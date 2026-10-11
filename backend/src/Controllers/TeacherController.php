<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Services\ClickLogService;
use Exception;

/**
 * Teacher Controller
 * Handles public teacher directory searches, detailed profile views,
 * and authenticated teacher profile management.
 */
class TeacherController extends Controller
{
    private ClickLogService $clickLogger;

    public function __construct(ClickLogService $clickLogger)
    {
        parent::__construct();
        $this->clickLogger = $clickLogger;
    }

    /**
     * Browse / Search approved teachers
     * GET /api/teachers
     */
    public function index(Request $request): void
    {
        // Log view event
        $this->clickLogger->log($request, 'page_view', '/teachers');

        $q = trim((string)$request->query('q', ''));
        $subject = trim((string)$request->query('subject', ''));
        $location = trim((string)$request->query('location_city', ''));
        $minExp = $request->query('min_experience');
        $qualification = trim((string)$request->query('qualification', ''));
        $sort = (string)$request->query('sort', 'newest');
        $page = max(1, (int)$request->query('page', 1));
        $perPage = min(50, max(1, (int)$request->query('per_page', 9)));
        $offset = ($page - 1) * $perPage;

        // Strictly search only APPROVED teachers whose account is ACTIVE
        $where = ["u.role = 'teacher'", "u.status = 'active'", "tp.verification_status = 'approved'"];
        $params = [];

        if ($q !== '') {
            $where[] = "(u.name LIKE :q OR tp.subjects LIKE :q OR tp.qualification LIKE :q OR tp.bio LIKE :q)";
            $params['q'] = "%{$q}%";
        }

        if ($subject !== '') {
            $where[] = "tp.subjects LIKE :subject";
            $params['subject'] = "%{$subject}%";
        }

        if ($location !== '' && $location !== 'all') {
            $where[] = "tp.location_city = :location";
            $params['location'] = $location;
        }

        if ($minExp !== null && $minExp !== '' && is_numeric($minExp)) {
            $where[] = "tp.experience_years >= :minExp";
            $params['minExp'] = (int)$minExp;
        }

        if ($qualification !== '') {
            $where[] = "tp.qualification LIKE :qual";
            $params['qual'] = "%{$qualification}%";
        }

        $whereClause = implode(' AND ', $where);

        // Sorting
        $orderBy = match ($sort) {
            'exp_desc'  => 'tp.experience_years DESC',
            'rate_asc'  => 'tp.hourly_rate ASC',
            'rate_desc' => 'tp.hourly_rate DESC',
            'name_asc'  => 'u.name ASC',
            default     => 'u.id DESC',
        };

        // Total count
        $countSql = "SELECT COUNT(*) as total 
                     FROM users u 
                     JOIN teacher_profiles tp ON tp.user_id = u.id 
                     WHERE {$whereClause}";
        $totalRow = $this->db->fetchOne($countSql, $params);
        $total = (int)($totalRow['total'] ?? 0);

        // Fetch teachers
        $sql = "SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
                       tp.qualification, tp.experience, tp.experience_years, tp.bio,
                       tp.subjects, tp.grade_levels, tp.location_city, tp.hourly_rate,
                       tp.verification_status, tp.temporary_address
                FROM users u
                JOIN teacher_profiles tp ON tp.user_id = u.id
                WHERE {$whereClause}
                ORDER BY {$orderBy}
                LIMIT {$perPage} OFFSET {$offset}";

        $teachers = $this->db->fetchAll($sql, $params);

        // Format subjects & grade_levels arrays for easy client rendering
        foreach ($teachers as &$teacher) {
            $teacher['subjects_list'] = array_map('trim', explode(',', $teacher['subjects'] ?? ''));
            $teacher['grade_levels_list'] = array_map('trim', explode(',', $teacher['grade_levels'] ?? ''));
        }

        $this->success('Approved teachers retrieved successfully.', [
            'teachers' => $teachers,
            'pagination' => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'total_pages'  => (int)ceil($total / $perPage),
            ],
        ]);
    }

    /**
     * View single approved teacher profile
     * GET /api/teachers/{id}
     */
    public function show(Request $request, string $id): void
    {
        $teacherId = (int)$id;

        $sql = "SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
                       tp.permanent_address, tp.temporary_address, tp.qualification,
                       tp.experience, tp.experience_years, tp.bio, tp.subjects,
                       tp.grade_levels, tp.location_city, tp.hourly_rate,
                       tp.verification_status
                FROM users u
                JOIN teacher_profiles tp ON tp.user_id = u.id
                WHERE u.id = :id AND u.role = 'teacher'
                LIMIT 1";

        $teacher = $this->db->fetchOne($sql, ['id' => $teacherId]);

        if (!$teacher) {
            $this->response->notFound('Teacher not found.');
            return;
        }

        // Only approved teachers are public, unless the viewer is the teacher or an admin
        $authUser = $request->getAuthUser();
        $isOwnerOrAdmin = $authUser && ($authUser['id'] === $teacherId || $authUser['role'] === 'admin');

        if ($teacher['verification_status'] !== 'approved' && !$isOwnerOrAdmin) {
            $this->response->forbidden('This teacher profile is pending document verification.');
            return;
        }

        // Log teacher profile click event
        $this->clickLogger->log($request, 'teacher_click', "/teachers/{$teacherId}", $teacherId);

        $teacher['subjects_list'] = array_map('trim', explode(',', $teacher['subjects'] ?? ''));
        $teacher['grade_levels_list'] = array_map('trim', explode(',', $teacher['grade_levels'] ?? ''));

        $this->success('Teacher details retrieved.', [
            'teacher' => $teacher
        ]);
    }

    /**
     * Get authenticated teacher's own profile
     * GET /api/teacher/profile
     */
    public function getProfile(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];

        $sql = "SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
                       tp.permanent_address, tp.temporary_address, tp.qualification,
                       tp.experience, tp.experience_years, tp.bio, tp.subjects,
                       tp.grade_levels, tp.location_city, tp.hourly_rate,
                       tp.verification_status, tp.rejection_reason
                FROM users u
                JOIN teacher_profiles tp ON tp.user_id = u.id
                WHERE u.id = :id
                LIMIT 1";

        $profile = $this->db->fetchOne($sql, ['id' => $userId]);

        // Get uploaded documents
        $documents = $this->db->fetchAll(
            "SELECT id, document_type, original_name, file_size, mime_type, created_at 
             FROM teacher_documents 
             WHERE teacher_id = :teacher_id",
            ['teacher_id' => $userId]
        );

        $this->success('Teacher profile retrieved.', [
            'profile'   => $profile,
            'documents' => $documents,
        ]);
    }

    /**
     * Update authenticated teacher's profile
     * PUT /api/teacher/profile
     */
    public function updateProfile(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];

        $this->validate($request, [
            'name'                => 'required|min:2|max:150',
            'phone'               => 'required|min:7|max:30',
            'permanent_address'   => 'required|min:3|max:255',
            'temporary_address'   => 'required|min:3|max:255',
            'qualification'       => 'required|min:2|max:255',
            'experience'          => 'required|min:2|max:255',
            'subjects'            => 'required|min:2|max:255',
            'grade_levels'        => 'required|min:2|max:255',
            'location_city'       => 'required|max:100',
        ]);

        $name = trim((string)$request->get('name'));
        $phone = trim((string)$request->get('phone'));

        $this->db->beginTransaction();

        try {
            // Update users table
            $this->db->update('users', [
                'name'  => $name,
                'phone' => $phone,
            ], 'id = :id', ['id' => $userId]);

            // Update teacher_profiles table
            $this->db->update('teacher_profiles', [
                'permanent_address' => trim((string)$request->get('permanent_address')),
                'temporary_address' => trim((string)$request->get('temporary_address')),
                'qualification'     => trim((string)$request->get('qualification')),
                'experience'        => trim((string)$request->get('experience')),
                'experience_years'  => (int)($request->get('experience_years') ?? 1),
                'bio'               => $request->get('bio') ? trim((string)$request->get('bio')) : null,
                'subjects'          => trim((string)$request->get('subjects')),
                'grade_levels'      => trim((string)$request->get('grade_levels')),
                'location_city'     => trim((string)$request->get('location_city')),
                'hourly_rate'       => $request->get('hourly_rate') ? (float)$request->get('hourly_rate') : null,
            ], 'user_id = :uid', ['uid' => $userId]);

            $this->db->commit();

            $updatedProfile = $this->db->fetchOne(
                "SELECT u.id, u.name, u.email, u.phone, u.avatar,
                        tp.permanent_address, tp.temporary_address, tp.qualification,
                        tp.experience, tp.experience_years, tp.bio, tp.subjects,
                        tp.grade_levels, tp.location_city, tp.hourly_rate,
                        tp.verification_status
                 FROM users u
                 JOIN teacher_profiles tp ON tp.user_id = u.id
                 WHERE u.id = :id",
                ['id' => $userId]
            );

            $this->success('Profile updated successfully.', [
                'profile' => $updatedProfile
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->error('Failed to update profile: ' . $e->getMessage(), 500);
        }
    }
}
