<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Services\ClickLogService;
use App\Services\UploadService;
use App\Services\MailerService;
use Exception;

/**
 * Admin Controller
 * Manages dashboard analytics, 7-day traffic charts, teacher document verification,
 * parent directory, tutor request moderation, and conversation abuse reports.
 */
class AdminController extends Controller
{
    private ClickLogService $clickLogger;
    private UploadService $upload;
    private MailerService $mailer;

    public function __construct(ClickLogService $clickLogger, UploadService $upload, MailerService $mailer)
    {
        parent::__construct();
        $this->clickLogger = $clickLogger;
        $this->upload = $upload;
        $this->mailer = $mailer;
    }

    /**
     * Admin Dashboard Overview & Analytics
     * GET /api/admin/dashboard
     */
    public function dashboard(Request $request): void
    {
        // 1. Core Stat Cards
        $totalTeachers = (int)($this->db->fetchOne("SELECT COUNT(*) as cnt FROM users WHERE role = 'teacher'")['cnt'] ?? 0);
        $totalParents  = (int)($this->db->fetchOne("SELECT COUNT(*) as cnt FROM users WHERE role = 'parent'")['cnt'] ?? 0);
        $openRequests  = (int)($this->db->fetchOne("SELECT COUNT(*) as cnt FROM tutor_requests WHERE status = 'open'")['cnt'] ?? 0);
        $messagesToday = (int)($this->db->fetchOne("SELECT COUNT(*) as cnt FROM messages WHERE DATE(created_at) = CURDATE()")['cnt'] ?? 0);
        $pendingVerifications = (int)($this->db->fetchOne("SELECT COUNT(*) as cnt FROM teacher_profiles WHERE verification_status = 'pending'")['cnt'] ?? 0);

        // 2. Location Breakdown (Nepal Cities)
        $locationsSql = "SELECT location_city, COUNT(*) as count 
                         FROM teacher_profiles 
                         GROUP BY location_city 
                         ORDER BY count DESC";
        $locationRows = $this->db->fetchAll($locationsSql);

        // 3. 7-Day Daily Clicks / Views Chart Data
        $clicks7Days = $this->clickLogger->getDailyClicks(7);

        // 4. Newly Added Teachers Table
        $newestTeachersSql = "SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
                                     tp.qualification, tp.experience_years, tp.verification_status, tp.location_city
                              FROM users u
                              JOIN teacher_profiles tp ON tp.user_id = u.id
                              ORDER BY u.id DESC
                              LIMIT 5";
        $newestTeachers = $this->db->fetchAll($newestTeachersSql);

        $this->success('Admin dashboard stats retrieved.', [
            'stats' => [
                'total_teachers'        => $totalTeachers,
                'total_parents'         => $totalParents,
                'open_tutor_requests'   => $openRequests,
                'total_messages_today'  => $messagesToday,
                'pending_verifications' => $pendingVerifications,
            ],
            'location_breakdown' => $locationRows,
            'clicks_7_days'      => $clicks7Days,
            'newest_teachers'    => $newestTeachers,
        ]);
    }

    /**
     * Teachers Table with full details, documents, and search
     * GET /api/admin/teachers
     */
    public function teachers(Request $request): void
    {
        $q = trim((string)$request->query('q', ''));
        $status = (string)$request->query('status', 'all');
        $page = max(1, (int)$request->query('page', 1));
        $perPage = min(50, max(1, (int)$request->query('per_page', 15)));
        $offset = ($page - 1) * $perPage;

        $where = ["u.role = 'teacher'"];
        $params = [];

        if ($status !== 'all') {
            $where[] = "tp.verification_status = :status";
            $params['status'] = $status;
        }

        if ($q !== '') {
            $where[] = "(u.name LIKE :q OR u.email LIKE :q OR u.phone LIKE :q OR tp.location_city LIKE :q OR tp.qualification LIKE :q)";
            $params['q'] = "%{$q}%";
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $countSql = "SELECT COUNT(*) as total 
                     FROM users u 
                     JOIN teacher_profiles tp ON tp.user_id = u.id 
                     {$whereClause}";
        $total = (int)($this->db->fetchOne($countSql, $params)['total'] ?? 0);

        $sql = "SELECT u.id, u.name, u.email, u.phone, u.status as user_status,
                       u.created_at, u.created_at as joined_date,
                       tp.permanent_address, tp.temporary_address, tp.qualification, tp.experience,
                       tp.experience_years, tp.hourly_rate, tp.location_city, tp.subjects, tp.grade_levels,
                       tp.verification_status, tp.rejection_reason as admin_notes, tp.reviewed_at as verified_at,
                       tp.bio
                FROM users u
                JOIN teacher_profiles tp ON tp.user_id = u.id
                {$whereClause}
                ORDER BY u.id DESC
                LIMIT {$perPage} OFFSET {$offset}";

        $teachers = $this->db->fetchAll($sql, $params);

        if (!empty($teachers)) {
            $teacherIds = array_column($teachers, 'id');
            $inPlaceholders = implode(',', array_fill(0, count($teacherIds), '?'));
            $docs = $this->db->fetchAll("SELECT * FROM teacher_documents WHERE teacher_id IN ({$inPlaceholders})", $teacherIds);

            $docsByTeacher = [];
            foreach ($docs as $doc) {
                $docsByTeacher[(int)$doc['teacher_id']][] = [
                    'id'            => (int)$doc['id'],
                    'teacher_id'    => (int)$doc['teacher_id'],
                    'document_type' => $doc['document_type'],
                    'file_name'     => $doc['original_name'],
                    'file_path'     => $doc['stored_filename'],
                    'mime_type'     => $doc['mime_type'],
                    'file_size'     => (int)$doc['file_size'],
                    'uploaded_at'   => $doc['created_at'],
                ];
            }

            foreach ($teachers as &$teacher) {
                $teacherId = (int)$teacher['id'];
                $teacher['documents'] = $docsByTeacher[$teacherId] ?? [];
                $teacher['teaching_mode'] = 'In-Person / Online';
                $teacher['status'] = $teacher['user_status'] ?? 'active';
            }
            unset($teacher);
        }

        $this->success('Teachers retrieved.', [
            'teachers'   => $teachers,
            'pagination' => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'total_pages'  => (int)ceil($total / $perPage),
            ],
        ]);
    }

    /**
     * Verify, approve, or reject teacher
     * PATCH /api/admin/teachers/{id}/verify
     */
    public function verifyTeacher(Request $request, string $id): void
    {
        $admin = $request->getAuthUser();
        $adminId = (int)$admin['id'];
        $teacherId = (int)$id;

        $teacher = $this->db->fetchOne(
            "SELECT u.*, tp.verification_status 
             FROM users u 
             JOIN teacher_profiles tp ON tp.user_id = u.id 
             WHERE u.id = :id",
            ['id' => $teacherId]
        );

        if (!$teacher) {
            $this->response->notFound('Teacher not found.');
            return;
        }

        $rawAction = (string)($request->get('action') ?? $request->get('status') ?? '');
        $action = match(strtolower($rawAction)) {
            'approve', 'approved' => 'approve',
            'reject', 'rejected' => 'reject',
            default => '',
        };

        if ($action === '') {
            $this->response->badRequest('Action must be either "approve" or "reject".');
            return;
        }

        $rejectionReason = $request->get('rejection_reason') ?? $request->get('admin_notes');
        $rejectionReason = $rejectionReason ? trim((string)$rejectionReason) : null;

        $newStatus = ($action === 'approve') ? 'approved' : 'rejected';

        $this->db->beginTransaction();

        try {
            // Update teacher_profiles
            $this->db->update('teacher_profiles', [
                'verification_status' => $newStatus,
                'rejection_reason'    => $rejectionReason,
                'reviewed_by'         => $adminId,
                'reviewed_at'         => date('Y-m-d H:i:s'),
            ], 'user_id = :uid', ['uid' => $teacherId]);

            // Update user account status
            $userStatus = ($action === 'approve') ? 'active' : 'pending';
            $this->db->update('users', ['status' => $userStatus], 'id = :id', ['id' => $teacherId]);

            $this->db->commit();

            // Send notification email
            if ($action === 'approve') {
                $this->mailer->send(
                    $teacher['email'],
                    'Your Teacher Profile Has Been Approved! - MyTutor',
                    "Namaste {$teacher['name']},\n\nCongratulations! Your teacher credentials and verification document have been approved by our administration team.\n\nYour profile is now visible to parents, and you can apply for tutor requests immediately: http://localhost:3000/requests\n\nBest regards,\nMyTutor Team"
                );
            } else {
                $this->mailer->send(
                    $teacher['email'],
                    'Update on Your Teacher Application - MyTutor',
                    "Namaste {$teacher['name']},\n\nYour teacher verification document could not be approved at this time.\n\nReason: {$rejectionReason}\n\nPlease log in to update your documents or contact support: http://localhost:3000/login\n\nBest regards,\nMyTutor Team"
                );
            }

            $this->success("Teacher profile successfully {$newStatus}.", [
                'teacher_id'          => $teacherId,
                'verification_status' => $newStatus,
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->error('Failed to update verification status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete teacher account
     * DELETE /api/admin/teachers/{id}
     */
    public function deleteTeacher(Request $request, string $id): void
    {
        $teacherId = (int)$id;

        $teacher = $this->db->fetchOne("SELECT id FROM users WHERE id = :id AND role = 'teacher'", ['id' => $teacherId]);
        if (!$teacher) {
            $this->response->notFound('Teacher not found.');
            return;
        }

        $this->db->delete('users', 'id = :id', ['id' => $teacherId]);
        $this->success('Teacher account and associated profiles deleted successfully.');
    }

    /**
     * Authenticated endpoint to safely view/stream teacher verification documents
     * GET /api/admin/documents/{id}
     */
    public function viewDocument(Request $request, string $documentId): void
    {
        $docId = (int)$documentId;

        $doc = $this->db->fetchOne(
            "SELECT * FROM teacher_documents WHERE id = :id LIMIT 1",
            ['id' => $docId]
        );

        if (!$doc) {
            $this->response->notFound('Verification document record not found.');
            return;
        }

        $absolutePath = $this->upload->getDocumentAbsolutePath($doc['file_path']);

        if (!file_exists($absolutePath)) {
            $this->response->notFound('Document file not found on disk.');
            return;
        }

        // Stream private file safely
        $this->response->file($absolutePath, $doc['original_name'], $doc['mime_type']);
    }

    /**
     * Parents directory table
     * GET /api/admin/parents
     */
    public function parents(Request $request): void
    {
        $q = trim((string)$request->query('q', ''));
        $page = max(1, (int)$request->query('page', 1));
        $perPage = min(50, max(1, (int)$request->query('per_page', 15)));
        $offset = ($page - 1) * $perPage;

        $where = ["u.role = 'parent'"];
        $params = [];

        if ($q !== '') {
            $where[] = "(u.name LIKE :q OR u.email LIKE :q OR u.phone LIKE :q)";
            $params['q'] = "%{$q}%";
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $countSql = "SELECT COUNT(*) as total FROM users u {$whereClause}";
        $total = (int)($this->db->fetchOne($countSql, $params)['total'] ?? 0);

        $sql = "SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, u.created_at as joined_date,
                       (SELECT provider FROM oauth_accounts oa WHERE oa.user_id = u.id LIMIT 1) as oauth_provider,
                       (SELECT COUNT(*) FROM tutor_requests tr WHERE tr.parent_id = u.id) as requests_count
                FROM users u
                {$whereClause}
                ORDER BY u.id DESC
                LIMIT {$perPage} OFFSET {$offset}";

        $parents = $this->db->fetchAll($sql, $params);

        foreach ($parents as &$parent) {
            $parent['signup_method'] = $parent['oauth_provider'] 
                ? ucfirst($parent['oauth_provider']) 
                : 'Email & Password';
        }

        $this->success('Parents retrieved.', [
            'parents'    => $parents,
            'pagination' => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'total_pages'  => (int)ceil($total / $perPage),
            ],
        ]);
    }

    /**
     * All Tutor Requests management
     * GET /api/admin/requests
     */
    public function requests(Request $request): void
    {
        $status = (string)$request->query('status', 'all');
        $q = trim((string)$request->query('q', ''));
        $page = max(1, (int)$request->query('page', 1));
        $perPage = min(50, max(1, (int)$request->query('per_page', 15)));
        $offset = ($page - 1) * $perPage;

        $where = [];
        $params = [];

        if ($status !== 'all') {
            $where[] = "tr.status = :status";
            $params['status'] = $status;
        }

        if ($q !== '') {
            $where[] = "(tr.subjects LIKE :q OR tr.grade_level LIKE :q OR tr.location_city LIKE :q OR u.name LIKE :q)";
            $params['q'] = "%{$q}%";
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $countSql = "SELECT COUNT(*) as total 
                     FROM tutor_requests tr 
                     JOIN users u ON u.id = tr.parent_id 
                     {$whereClause}";
        $total = (int)($this->db->fetchOne($countSql, $params)['total'] ?? 0);

        $sql = "SELECT tr.*, u.name as parent_name, u.email as parent_email,
                       (SELECT COUNT(*) FROM applications a WHERE a.request_id = tr.id) as applicants_count
                FROM tutor_requests tr
                JOIN users u ON u.id = tr.parent_id
                {$whereClause}
                ORDER BY tr.id DESC
                LIMIT {$perPage} OFFSET {$offset}";

        $requests = $this->db->fetchAll($sql, $params);

        $this->success('Tutor requests retrieved.', [
            'requests'   => $requests,
            'pagination' => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'total_pages'  => (int)ceil($total / $perPage),
            ],
        ]);
    }

    /**
     * Close tutor request by admin
     * PATCH /api/admin/requests/{id}/close
     */
    public function closeRequest(Request $request, string $id): void
    {
        $this->db->update('tutor_requests', ['status' => 'closed'], 'id = :id', ['id' => (int)$id]);
        $this->success('Tutor request closed.');
    }

    /**
     * Delete tutor request by admin
     * DELETE /api/admin/requests/{id}
     */
    public function deleteRequest(Request $request, string $id): void
    {
        $this->db->delete('tutor_requests', 'id = :id', ['id' => (int)$id]);
        $this->success('Tutor request deleted.');
    }

    /**
     * Reported conversations queue
     * GET /api/admin/reports
     */
    public function reports(Request $request): void
    {
        $sql = "SELECT r.*,
                       u_by.name as reported_by_name, u_by.role as reported_by_role,
                       u_target.id as reported_user_id, u_target.name as reported_user_name,
                       u_target.role as reported_user_role, u_target.status as reported_user_status
                FROM reports r
                JOIN users u_by ON u_by.id = r.reported_by
                JOIN users u_target ON u_target.id = r.reported_user_id
                ORDER BY r.id DESC";

        $reports = $this->db->fetchAll($sql);

        $this->success('Reported conversations retrieved.', [
            'reports' => $reports
        ]);
    }

    /**
     * Action on reported conversation (warn, suspend user, dismiss)
     * PATCH /api/admin/reports/{id}/action
     */
    public function takeReportAction(Request $request, string $id): void
    {
        $reportId = (int)$id;

        $report = $this->db->fetchOne("SELECT * FROM reports WHERE id = :id", ['id' => $reportId]);
        if (!$report) {
            $this->response->notFound('Report not found.');
            return;
        }

        $rawAction = (string)$request->get('action', '');
        $action = match($rawAction) {
            'suspend_user', 'suspend' => 'suspend',
            'warn'                    => 'warn',
            'dismiss'                 => 'dismiss',
            default                   => '',
        };

        if ($action === '') {
            $this->response->badRequest('Action must be one of: warn, suspend, dismiss');
            return;
        }

        $notes = $request->get('admin_notes') ? trim((string)$request->get('admin_notes')) : null;

        $admin = $request->getAuthUser();

        $this->db->beginTransaction();

        try {
            if ($action === 'suspend') {
                // Suspend the reported user
                $this->db->update('users', ['status' => 'suspended'], 'id = :id', ['id' => (int)$report['reported_user_id']]);
                $this->db->update('reports', [
                    'status'       => 'action_taken',
                    'action_taken' => 'User account suspended',
                    'admin_notes'  => $notes,
                    'reviewed_by'  => (int)$admin['id'],
                    'reviewed_at'  => date('Y-m-d H:i:s'),
                ], 'id = :id', ['id' => $reportId]);
            } elseif ($action === 'warn') {
                $this->db->update('reports', [
                    'status'       => 'action_taken',
                    'action_taken' => 'User issued formal safety warning',
                    'admin_notes'  => $notes,
                    'reviewed_by'  => (int)$admin['id'],
                    'reviewed_at'  => date('Y-m-d H:i:s'),
                ], 'id = :id', ['id' => $reportId]);
            } else {
                $this->db->update('reports', [
                    'status'       => 'dismissed',
                    'action_taken' => 'Report investigated and dismissed',
                    'admin_notes'  => $notes,
                    'reviewed_by'  => (int)$admin['id'],
                    'reviewed_at'  => date('Y-m-d H:i:s'),
                ], 'id = :id', ['id' => $reportId]);
            }

            $this->db->commit();

            $this->success("Report marked as {$action}.");
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->error('Failed to take action on report: ' . $e->getMessage(), 500);
        }
    }
}
