<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Services\ClickLogService;
use App\Services\MailerService;
use Exception;

/**
 * Tutor Request Controller
 * Handles job postings created by parents, public/teacher request browsing,
 * and parent request lifecycle (create, edit, close, delete).
 */
class TutorRequestController extends Controller
{
    private ClickLogService $clickLogger;
    private MailerService $mailer;

    public function __construct(ClickLogService $clickLogger, MailerService $mailer)
    {
        parent::__construct();
        $this->clickLogger = $clickLogger;
        $this->mailer = $mailer;
    }

    /**
     * Browse open tutor requests (Public & Teacher Opportunities)
     * GET /api/requests
     */
    public function index(Request $request): void
    {
        $this->clickLogger->log($request, 'page_view', '/requests');

        $q = trim((string)$request->query('q', ''));
        $subject = trim((string)$request->query('subject', ''));
        $grade = trim((string)$request->query('grade_level', ''));
        $location = trim((string)$request->query('location_city', ''));
        $mode = trim((string)$request->query('mode', ''));
        $status = (string)$request->query('status', 'open');
        $minBudget = $request->query('min_budget');
        $maxBudget = $request->query('max_budget');
        $sort = (string)$request->query('sort', 'newest');
        $page = max(1, (int)$request->query('page', 1));
        $perPage = min(50, max(1, (int)$request->query('per_page', 10)));
        $offset = ($page - 1) * $perPage;

        $where = [];
        $params = [];

        if ($status !== 'all') {
            $where[] = "tr.status = :status";
            $params['status'] = $status;
        }

        if ($q !== '') {
            $where[] = "(tr.subjects LIKE :q OR tr.grade_level LIKE :q OR tr.location_area LIKE :q OR tr.additional_notes LIKE :q)";
            $params['q'] = "%{$q}%";
        }

        if ($subject !== '') {
            $where[] = "tr.subjects LIKE :subject";
            $params['subject'] = "%{$subject}%";
        }

        if ($grade !== '') {
            $where[] = "tr.grade_level LIKE :grade";
            $params['grade'] = "%{$grade}%";
        }

        if ($location !== '' && $location !== 'all') {
            $where[] = "tr.location_city = :location";
            $params['location'] = $location;
        }

        if ($mode !== '' && $mode !== 'all') {
            $where[] = "tr.mode = :mode";
            $params['mode'] = $mode;
        }

        if ($minBudget !== null && $minBudget !== '' && is_numeric($minBudget)) {
            $where[] = "tr.budget_max >= :minBudget";
            $params['minBudget'] = (float)$minBudget;
        }

        if ($maxBudget !== null && $maxBudget !== '' && is_numeric($maxBudget)) {
            $where[] = "tr.budget_min <= :maxBudget";
            $params['maxBudget'] = (float)$maxBudget;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $orderBy = match ($sort) {
            'budget_desc' => 'tr.budget_max DESC',
            'budget_asc'  => 'tr.budget_min ASC',
            default       => 'tr.created_at DESC',
        };

        // Total count
        $countSql = "SELECT COUNT(*) as total FROM tutor_requests tr {$whereClause}";
        $totalRow = $this->db->fetchOne($countSql, $params);
        $total = (int)($totalRow['total'] ?? 0);

        // Fetch requests with applicant count and parent name
        $sql = "SELECT tr.*, 
                       u.name as parent_name,
                       u.avatar as parent_avatar,
                       (SELECT COUNT(*) FROM applications a WHERE a.request_id = tr.id) as applicants_count
                FROM tutor_requests tr
                JOIN users u ON u.id = tr.parent_id
                {$whereClause}
                ORDER BY {$orderBy}
                LIMIT {$perPage} OFFSET {$offset}";

        $requests = $this->db->fetchAll($sql, $params);

        // If authenticated teacher, annotate whether teacher has already applied
        $authUser = $request->getAuthUser();
        $teacherId = ($authUser && $authUser['role'] === 'teacher') ? (int)$authUser['id'] : null;

        if ($teacherId !== null && !empty($requests)) {
            $appliedMap = [];
            $appliedSql = "SELECT request_id, status FROM applications WHERE teacher_id = :t_id";
            $appliedRows = $this->db->fetchAll($appliedSql, ['t_id' => $teacherId]);
            foreach ($appliedRows as $ar) {
                $appliedMap[$ar['request_id']] = $ar['status'];
            }

            foreach ($requests as &$req) {
                $req['has_applied'] = isset($appliedMap[$req['id']]);
                $req['my_application_status'] = $appliedMap[$req['id']] ?? null;
            }
        }

        $this->success('Tutor requests retrieved successfully.', [
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
     * View single tutor request details
     * GET /api/requests/{id}
     */
    public function show(Request $request, string $id): void
    {
        $requestId = (int)$id;

        $sql = "SELECT tr.*, 
                       u.name as parent_name,
                       u.phone as parent_phone,
                       u.email as parent_email,
                       (SELECT COUNT(*) FROM applications a WHERE a.request_id = tr.id) as applicants_count
                FROM tutor_requests tr
                JOIN users u ON u.id = tr.parent_id
                WHERE tr.id = :id
                LIMIT 1";

        $req = $this->db->fetchOne($sql, ['id' => $requestId]);

        if (!$req) {
            $this->response->notFound('Tutor request not found.');
            return;
        }

        $this->clickLogger->log($request, 'request_click', "/requests/{$requestId}", $requestId);

        $authUser = $request->getAuthUser();
        $isOwner = $authUser && ($authUser['id'] === (int)$req['parent_id'] || $authUser['role'] === 'admin');

        // Check if viewing teacher has applied
        if ($authUser && $authUser['role'] === 'teacher') {
            $app = $this->db->fetchOne(
                "SELECT id, status, message, proposed_rate, created_at 
                 FROM applications 
                 WHERE request_id = :r_id AND teacher_id = :t_id",
                ['r_id' => $requestId, 't_id' => $authUser['id']]
            );
            $req['my_application'] = $app;
        }

        // If parent owner, include applicants list
        if ($isOwner) {
            $applicantsSql = "SELECT a.id as application_id, a.message, a.proposed_rate, a.status, a.created_at,
                                     u.id as teacher_id, u.name as teacher_name, u.email as teacher_email, u.phone as teacher_phone,
                                     tp.qualification, tp.experience, tp.experience_years, tp.hourly_rate, tp.location_city,
                                     tp.verification_status
                              FROM applications a
                              JOIN users u ON u.id = a.teacher_id
                              JOIN teacher_profiles tp ON tp.user_id = u.id
                              WHERE a.request_id = :r_id
                              ORDER BY a.created_at DESC";
            $req['applicants'] = $this->db->fetchAll($applicantsSql, ['r_id' => $requestId]);
        }

        $this->success('Tutor request details retrieved.', [
            'request' => $req
        ]);
    }

    /**
     * Create a new tutor request
     * POST /api/requests
     */
    public function store(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $this->validate($request, [
            'child_name'     => 'required|min:2|max:100',
            'grade_level'    => 'required|max:50',
            'subjects'       => 'required|max:255',
            'location_city'  => 'required|max:100',
            'location_area'  => 'required|max:150',
            'mode'           => 'required|in:home,online,both',
            'schedule_days'  => 'required|max:100',
            'schedule_time'  => 'required|max:100',
            'budget_min'     => 'required|numeric',
            'budget_max'     => 'required|numeric',
        ]);

        $budgetMin = (float)$request->get('budget_min');
        $budgetMax = (float)$request->get('budget_max');

        if ($budgetMin > $budgetMax) {
            $this->error('Minimum budget cannot exceed maximum budget.', 422, [
                'budget_min' => ['Minimum budget cannot be higher than maximum budget.']
            ]);
            return;
        }

        try {
            $requestId = $this->db->insert('tutor_requests', [
                'parent_id'        => (int)$user['id'],
                'child_name'       => trim((string)$request->get('child_name')),
                'grade_level'      => trim((string)$request->get('grade_level')),
                'subjects'         => trim((string)$request->get('subjects')),
                'location_city'    => trim((string)$request->get('location_city')),
                'location_area'    => trim((string)$request->get('location_area')),
                'mode'             => (string)$request->get('mode'),
                'schedule_days'    => trim((string)$request->get('schedule_days')),
                'schedule_time'    => trim((string)$request->get('schedule_time')),
                'budget_min'       => $budgetMin,
                'budget_max'       => $budgetMax,
                'additional_notes' => $request->get('additional_notes') ? trim((string)$request->get('additional_notes')) : null,
                'status'           => 'open',
            ]);

            // Log confirmation email
            $this->mailer->send(
                $user['email'],
                'Tutor Request Published - MyTutor',
                "Namaste {$user['name']},\n\nYour tutor request for {$request->get('subjects')} ({$request->get('grade_level')}) has been published. Verified teachers will begin submitting proposals shortly.\n\nBest regards,\nMyTutor Team"
            );

            $created = $this->db->fetchOne("SELECT * FROM tutor_requests WHERE id = :id", ['id' => $requestId]);

            $this->success('Tutor request posted successfully!', [
                'request' => $created
            ], 201);
        } catch (Exception $e) {
            $this->error('Failed to create tutor request: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all requests posted by current parent
     * GET /api/parent/my-requests
     */
    public function myRequests(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];

        $sql = "SELECT tr.*,
                       (SELECT COUNT(*) FROM applications a WHERE a.request_id = tr.id) as applicants_count,
                       (SELECT COUNT(*) FROM applications a WHERE a.request_id = tr.id AND a.status = 'shortlisted') as shortlisted_count,
                       u_hired.name as hired_teacher_name
                FROM tutor_requests tr
                LEFT JOIN applications a_hired ON a_hired.id = tr.hired_application_id
                LEFT JOIN users u_hired ON u_hired.id = a_hired.teacher_id
                WHERE tr.parent_id = :p_id
                ORDER BY tr.created_at DESC";

        $requests = $this->db->fetchAll($sql, ['p_id' => $userId]);

        $this->success('Parent tutor requests retrieved.', [
            'requests' => $requests
        ]);
    }

    /**
     * Update an existing request
     * PUT /api/requests/{id}
     */
    public function update(Request $request, string $id): void
    {
        $user = $request->getAuthUser();
        $requestId = (int)$id;

        $existing = $this->db->fetchOne("SELECT * FROM tutor_requests WHERE id = :id", ['id' => $requestId]);
        if (!$existing) {
            $this->response->notFound('Request not found.');
            return;
        }

        // Ownership check
        if ((int)$existing['parent_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
            $this->response->forbidden('You are not authorized to edit this request.');
            return;
        }

        $this->validate($request, [
            'child_name'     => 'required|min:2|max:100',
            'grade_level'    => 'required|max:50',
            'subjects'       => 'required|max:255',
            'location_city'  => 'required|max:100',
            'location_area'  => 'required|max:150',
            'mode'           => 'required|in:home,online,both',
            'schedule_days'  => 'required|max:100',
            'schedule_time'  => 'required|max:100',
            'budget_min'     => 'required|numeric',
            'budget_max'     => 'required|numeric',
        ]);

        $budgetMin = (float)$request->get('budget_min');
        $budgetMax = (float)$request->get('budget_max');

        try {
            $this->db->update('tutor_requests', [
                'child_name'       => trim((string)$request->get('child_name')),
                'grade_level'      => trim((string)$request->get('grade_level')),
                'subjects'         => trim((string)$request->get('subjects')),
                'location_city'    => trim((string)$request->get('location_city')),
                'location_area'    => trim((string)$request->get('location_area')),
                'mode'             => (string)$request->get('mode'),
                'schedule_days'    => trim((string)$request->get('schedule_days')),
                'schedule_time'    => trim((string)$request->get('schedule_time')),
                'budget_min'       => $budgetMin,
                'budget_max'       => $budgetMax,
                'additional_notes' => $request->get('additional_notes') ? trim((string)$request->get('additional_notes')) : null,
                'status'           => $request->get('status') ? (string)$request->get('status') : $existing['status'],
            ], 'id = :id', ['id' => $requestId]);

            $updated = $this->db->fetchOne("SELECT * FROM tutor_requests WHERE id = :id", ['id' => $requestId]);

            $this->success('Tutor request updated successfully.', [
                'request' => $updated
            ]);
        } catch (Exception $e) {
            $this->error('Failed to update request: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Close a tutor request
     * PATCH /api/requests/{id}/close
     */
    public function close(Request $request, string $id): void
    {
        $user = $request->getAuthUser();
        $requestId = (int)$id;

        $existing = $this->db->fetchOne("SELECT * FROM tutor_requests WHERE id = :id", ['id' => $requestId]);
        if (!$existing) {
            $this->response->notFound('Request not found.');
            return;
        }

        if ((int)$existing['parent_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
            $this->response->forbidden('You are not authorized to close this request.');
            return;
        }

        $this->db->update('tutor_requests', ['status' => 'closed'], 'id = :id', ['id' => $requestId]);

        $this->success('Tutor request marked as closed.');
    }

    /**
     * Delete a tutor request
     * DELETE /api/requests/{id}
     */
    public function destroy(Request $request, string $id): void
    {
        $user = $request->getAuthUser();
        $requestId = (int)$id;

        $existing = $this->db->fetchOne("SELECT * FROM tutor_requests WHERE id = :id", ['id' => $requestId]);
        if (!$existing) {
            $this->response->notFound('Request not found.');
            return;
        }

        if ((int)$existing['parent_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
            $this->response->forbidden('You are not authorized to delete this request.');
            return;
        }

        $this->db->delete('tutor_requests', 'id = :id', ['id' => $requestId]);

        $this->success('Tutor request deleted successfully.');
    }
}
