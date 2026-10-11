<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use Exception;

/**
 * Parent Controller
 * Manages authenticated parent profile view and updates.
 */
class ParentController extends Controller
{
    /**
     * Get parent profile
     * GET /api/parent/profile
     */
    public function getProfile(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];

        $sql = "SELECT id, name, email, phone, avatar, created_at 
                FROM users 
                WHERE id = :id AND role = 'parent' 
                LIMIT 1";

        $profile = $this->db->fetchOne($sql, ['id' => $userId]);

        // Get total tutor requests posted by this parent
        $requestStats = $this->db->fetchOne(
            "SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_requests,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_requests
             FROM tutor_requests 
             WHERE parent_id = :parent_id",
            ['parent_id' => $userId]
        );

        $this->success('Parent profile retrieved.', [
            'profile' => $profile,
            'stats'   => $requestStats,
        ]);
    }

    /**
     * Update parent profile
     * PUT /api/parent/profile
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
            'name'  => 'required|min:2|max:150',
            'phone' => 'max:30',
        ]);

        $name = trim((string)$request->get('name'));
        $phone = $request->get('phone') ? trim((string)$request->get('phone')) : null;

        try {
            $this->db->update('users', [
                'name'  => $name,
                'phone' => $phone,
            ], 'id = :id', ['id' => $userId]);

            $updated = $this->db->fetchOne(
                "SELECT id, name, email, phone, avatar, role, status, created_at 
                 FROM users 
                 WHERE id = :id",
                ['id' => $userId]
            );

            $this->success('Profile updated successfully.', [
                'profile' => $updated
            ]);
        } catch (Exception $e) {
            $this->error('Failed to update parent profile: ' . $e->getMessage(), 500);
        }
    }
}
