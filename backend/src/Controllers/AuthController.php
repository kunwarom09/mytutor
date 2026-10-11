<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Services\AuthService;
use App\Services\UploadService;
use App\Services\MailerService;
use Exception;

/**
 * Authentication Controller
 * Handles teacher registration with document upload, parent registration,
 * email/password login, OAuth social authentication, and user profile management.
 */
class AuthController extends Controller
{
    private AuthService $auth;
    private UploadService $upload;
    private MailerService $mailer;

    public function __construct(AuthService $auth, UploadService $upload, MailerService $mailer)
    {
        parent::__construct();
        $this->auth = $auth;
        $this->upload = $upload;
        $this->mailer = $mailer;
    }

    /**
     * Teacher Registration with document upload
     * POST /api/auth/register/teacher
     */
    public function registerTeacher(Request $request): void
    {
        $this->validate($request, [
            'name'              => 'required|min:2|max:150',
            'email'             => 'required|email',
            'phone'             => 'required|min:7|max:30',
            'permanent_address' => 'required|min:3|max:255',
            'temporary_address' => 'required|min:3|max:255',
            'qualification'     => 'required|min:2|max:255',
            'experience'        => 'required|min:2|max:255',
            'document_type'     => 'required|in:Driving License,Citizenship Card,Voter ID Card,NID Card,Passport',
            'password'          => 'required|min:6',
            'confirm_password'  => 'required',
        ]);

        $password = (string)$request->get('password');
        $confirmPassword = (string)$request->get('confirm_password');

        if ($password !== $confirmPassword) {
            $this->error('Password and confirmation password do not match.', 422, [
                'confirm_password' => ['Passwords do not match.']
            ]);
            return;
        }

        $email = trim(strtolower((string)$request->get('email')));

        // Check unique email
        $existing = $this->db->fetchOne("SELECT id FROM users WHERE email = :email LIMIT 1", ['email' => $email]);
        if ($existing) {
            $this->error('An account with this email address already exists.', 422, [
                'email' => ['Email is already registered.']
            ]);
            return;
        }

        // Validate document file
        $documentFile = $request->file('document');
        if (!$documentFile || empty($documentFile['name'])) {
            $this->error('Verification document file is required.', 422, [
                'document' => ['Please upload an ID verification document (PDF, JPG, or PNG).']
            ]);
            return;
        }

        try {
            // Upload document outside public web root
            $uploadedDoc = $this->upload->storeDocument($documentFile);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 422, [
                'document' => [$e->getMessage()]
            ]);
            return;
        }

        $passwordHash = $this->auth->hashPassword($password);
        $name = trim((string)$request->get('name'));
        $phone = trim((string)$request->get('phone'));
        $permanentAddress = trim((string)$request->get('permanent_address'));
        $temporaryAddress = trim((string)$request->get('temporary_address'));
        $qualification = trim((string)$request->get('qualification'));
        $experience = trim((string)$request->get('experience'));
        $experienceYears = (int)($request->get('experience_years') ?? 1);
        $documentType = (string)$request->get('document_type');
        $subjects = trim((string)($request->get('subjects') ?? 'General'));
        $gradeLevels = trim((string)($request->get('grade_levels') ?? 'Primary, Secondary'));
        $locationCity = trim((string)($request->get('location_city') ?? 'Kathmandu'));
        $hourlyRate = $request->get('hourly_rate') ? (float)$request->get('hourly_rate') : null;
        $bio = $request->get('bio') ? trim((string)$request->get('bio')) : null;

        $this->db->beginTransaction();

        try {
            // 1. Insert into users
            $userId = $this->db->insert('users', [
                'name'          => $name,
                'email'         => $email,
                'password_hash' => $passwordHash,
                'phone'         => $phone,
                'role'          => 'teacher',
                'status'        => 'pending', // Starts as pending until admin verifies
            ]);

            // 2. Insert into teacher_profiles
            $this->db->insert('teacher_profiles', [
                'user_id'             => $userId,
                'permanent_address'   => $permanentAddress,
                'temporary_address'   => $temporaryAddress,
                'qualification'       => $qualification,
                'experience'          => $experience,
                'experience_years'    => $experienceYears,
                'bio'                 => $bio,
                'subjects'            => $subjects,
                'grade_levels'        => $gradeLevels,
                'location_city'       => $locationCity,
                'hourly_rate'         => $hourlyRate,
                'verification_status' => 'pending',
            ]);

            // 3. Insert into teacher_documents
            $this->db->insert('teacher_documents', [
                'teacher_id'      => $userId,
                'document_type'   => $documentType,
                'original_name'   => $uploadedDoc['original_name'],
                'stored_filename' => $uploadedDoc['stored_filename'],
                'file_path'       => $uploadedDoc['file_path'],
                'file_size'       => $uploadedDoc['file_size'],
                'mime_type'       => $uploadedDoc['mime_type'],
            ]);

            $this->db->commit();

            // Send notification email
            $this->mailer->send(
                $email,
                'Registration Received - MyTutor Teacher Application',
                "Namaste {$name},\n\nThank you for registering as a teacher on MyTutor. Your account and verification document ({$documentType}) have been submitted to our administration team for review.\n\nOnce approved, you will be able to apply for tutor requests and receive messages from parents.\n\nBest regards,\nMyTutor Team"
            );

            $newUser = $this->auth->getUserById($userId);

            $this->success(
                'Registration successful! Your profile is pending document verification by the admin.',
                [
                    'user'                => $newUser,
                    'verification_status' => 'pending',
                ],
                201
            );
        } catch (Exception $e) {
            $this->db->rollBack();
            // Remove uploaded file on failure
            if (isset($uploadedDoc['full_path']) && file_exists($uploadedDoc['full_path'])) {
                @unlink($uploadedDoc['full_path']);
            }
            $this->error('Failed to complete teacher registration: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Parent Registration
     * POST /api/auth/register/parent
     */
    public function registerParent(Request $request): void
    {
        $this->validate($request, [
            'name'             => 'required|min:2|max:150',
            'email'            => 'required|email',
            'password'         => 'required|min:6',
            'confirm_password' => 'required',
        ]);

        $password = (string)$request->get('password');
        $confirmPassword = (string)$request->get('confirm_password');

        if ($password !== $confirmPassword) {
            $this->error('Password and confirmation password do not match.', 422, [
                'confirm_password' => ['Passwords do not match.']
            ]);
            return;
        }

        $email = trim(strtolower((string)$request->get('email')));

        $existing = $this->db->fetchOne("SELECT id FROM users WHERE email = :email LIMIT 1", ['email' => $email]);
        if ($existing) {
            $this->error('An account with this email address already exists.', 422, [
                'email' => ['Email is already registered.']
            ]);
            return;
        }

        $name = trim((string)$request->get('name'));
        $phone = $request->get('phone') ? trim((string)$request->get('phone')) : null;
        $passwordHash = $this->auth->hashPassword($password);

        try {
            $userId = $this->db->insert('users', [
                'name'          => $name,
                'email'         => $email,
                'password_hash' => $passwordHash,
                'phone'         => $phone,
                'role'          => 'parent',
                'status'        => 'active',
            ]);

            $user = $this->auth->getUserById($userId);
            $token = $this->auth->generateTokenForUser($user);

            // Set session cookie
            setcookie('auth_token', $token, [
                'expires'  => time() + 86400,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);

            // Welcome email
            $this->mailer->send(
                $email,
                'Welcome to MyTutor!',
                "Namaste {$name},\n\nWelcome to MyTutor! You can now browse verified tuition teachers or post a tutor request for your children.\n\nBest regards,\nMyTutor Team"
            );

            $this->success('Parent account created successfully.', [
                'user'  => $user,
                'token' => $token,
            ], 201);
        } catch (Exception $e) {
            $this->error('Failed to create parent account: ' . $e->getMessage(), 500);
        }
    }

    /**
     * User login (Email & Password)
     * POST /api/auth/login
     */
    public function login(Request $request): void
    {
        $this->validate($request, [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $email = trim((string)$request->get('email'));
        $password = (string)$request->get('password');

        try {
            $authData = $this->auth->attempt($email, $password);

            if (!$authData) {
                $this->error('Invalid email or password.', 401);
                return;
            }

            setcookie('auth_token', $authData['token'], [
                'expires'  => time() + 86400,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);

            $this->success('Login successful.', $authData);
        } catch (Exception $e) {
            $this->error($e->getMessage(), 403);
        }
    }

    /**
     * Get currently authenticated user profile
     * GET /api/auth/me
     */
    public function me(Request $request): void
    {
        $user = $request->getAuthUser();

        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $this->success('Authenticated user retrieved.', [
            'user' => $user
        ]);
    }

    /**
     * User logout
     * POST /api/auth/logout
     */
    public function logout(Request $request): void
    {
        setcookie('auth_token', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        $this->success('Logged out successfully.');
    }

    /**
     * Social Authentication (Google / Facebook OAuth)
     * POST /api/auth/social
     */
    public function social(Request $request): void
    {
        $this->validate($request, [
            'provider'         => 'required|in:google,facebook',
            'provider_user_id' => 'required',
            'email'            => 'required|email',
            'name'             => 'required',
        ]);

        $provider = (string)$request->get('provider');
        $providerUserId = (string)$request->get('provider_user_id');
        $email = trim((string)$request->get('email'));
        $name = trim((string)$request->get('name'));
        $avatar = $request->get('avatar_url');

        $sql = "SELECT u.* FROM oauth_accounts oa 
                JOIN users u ON u.id = oa.user_id 
                WHERE oa.provider = :provider AND oa.provider_user_id = :p_id 
                LIMIT 1";
        $user = $this->db->fetchOne($sql, ['provider' => $provider, 'p_id' => $providerUserId]);

        if (!$user) {
            $existingUser = $this->db->fetchOne("SELECT * FROM users WHERE email = :email LIMIT 1", ['email' => $email]);

            if ($existingUser) {
                $userId = (int)$existingUser['id'];
                $user = $existingUser;
            } else {
                $userId = $this->db->insert('users', [
                    'name'       => $name,
                    'email'      => $email,
                    'role'       => 'parent',
                    'status'     => 'active',
                    'avatar'     => $avatar,
                ]);
                $user = $this->db->fetchOne("SELECT * FROM users WHERE id = :id", ['id' => $userId]);
            }

            $this->db->insert('oauth_accounts', [
                'user_id'          => $userId,
                'provider'         => $provider,
                'provider_user_id' => $providerUserId,
                'avatar_url'       => $avatar,
            ]);
        }

        $token = $this->auth->generateTokenForUser($user);
        unset($user['password_hash']);

        setcookie('auth_token', $token, [
            'expires'  => time() + 86400,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        $this->success('Social login successful.', [
            'user'  => $user,
            'token' => $token,
        ]);
    }
}
