<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Database;
use Exception;

/**
 * Authentication Service
 * Manages password hashing, verification, credentials validation, and JWT generation.
 */
class AuthService
{
    private Database $db;
    private JWTService $jwt;

    public function __construct(Database $db, JWTService $jwt)
    {
        $this->db = $db;
        $this->jwt = $jwt;
    }

    /**
     * Hash password using standard bcrypt.
     */
    public function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verify plain password against hashed password.
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Authenticate user by email and password.
     */
    public function attempt(string $email, string $password): ?array
    {
        $sql = "SELECT u.*, 
                       tp.verification_status,
                       tp.qualification,
                       tp.location_city
                FROM users u
                LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
                WHERE u.email = :email
                LIMIT 1";

        $user = $this->db->fetchOne($sql, ['email' => $email]);

        if (!$user) {
            return null;
        }

        if (empty($user['password_hash']) || !$this->verifyPassword($password, $user['password_hash'])) {
            return null;
        }

        // Prevent suspended users from logging in
        if ($user['status'] === 'suspended') {
            throw new Exception("Your account has been suspended. Please contact support.");
        }

        // Generate token
        $token = $this->generateTokenForUser($user);

        // Sanitize sensitive fields before returning
        unset($user['password_hash']);

        return [
            'user'  => $user,
            'token' => $token,
        ];
    }

    /**
     * Generate signed JWT for a user record.
     */
    public function generateTokenForUser(array $user): string
    {
        $payload = [
            'sub'   => (int)$user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'name'  => $user['name'],
            'status'=> $user['status'],
        ];

        if (isset($user['verification_status'])) {
            $payload['verification_status'] = $user['verification_status'];
        }

        return $this->jwt->encode($payload);
    }

    /**
     * Retrieve full user details by ID.
     */
    public function getUserById(int $userId): ?array
    {
        $sql = "SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.avatar, u.created_at,
                       tp.verification_status, tp.qualification, tp.experience, tp.location_city,
                       tp.subjects, tp.grade_levels, tp.hourly_rate, tp.bio
                FROM users u
                LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
                WHERE u.id = :id
                LIMIT 1";

        return $this->db->fetchOne($sql, ['id' => $userId]);
    }
}
