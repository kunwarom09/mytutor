<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Services\ClickLogService;
use App\Services\MailerService;
use Exception;

/**
 * Application Controller
 * Manages teacher applications to tutor requests, shortlisting, and hiring.
 */
class ApplicationController extends Controller
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
     * Teacher applies to a tutor request
     * POST /api/requests/{id}/apply
     */
    public function apply(Request $request, string $requestId): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $teacherId = (int)$user['id'];
        $reqId = (int)$requestId;

        // Check teacher verification status
        $teacherProfile = $this->db->fetchOne(
            "SELECT verification_status FROM teacher_profiles WHERE user_id = :id",
            ['id' => $teacherId]
        );

        if (!$teacherProfile || $teacherProfile['verification_status'] !== 'approved') {
            $this->error('Only approved teachers with verified ID documents can apply to tutor requests.', 403);
            return;
        }

        // Check if tutor request exists and is open
        $tutorReq = $this->db->fetchOne(
            "SELECT tr.*, u.email as parent_email, u.name as parent_name 
             FROM tutor_requests tr 
             JOIN users u ON u.id = tr.parent_id 
             WHERE tr.id = :id",
            ['id' => $reqId]
        );

        if (!$tutorReq) {
            $this->response->notFound('Tutor request not found.');
            return;
        }

        if ($tutorReq['status'] !== 'open') {
            $this->error('This tutor request is currently ' . $tutorReq['status'] . ' and no longer accepting applications.', 400);
            return;
        }

        // Check if already applied
        $existingApp = $this->db->fetchOne(
            "SELECT id FROM applications WHERE request_id = :r_id AND teacher_id = :t_id",
            ['r_id' => $reqId, 't_id' => $teacherId]
        );

        if ($existingApp) {
            $this->error('You have already applied to this tutor request.', 422);
            return;
        }

        $this->validate($request, [
            'message' => 'required|min:10',
        ]);

        $message = trim((string)$request->get('message'));
        $proposedRate = $request->get('proposed_rate') ? (float)$request->get('proposed_rate') : null;

        try {
            $appId = $this->db->insert('applications', [
                'request_id'    => $reqId,
                'teacher_id'    => $teacherId,
                'message'       => $message,
                'proposed_rate' => $proposedRate,
                'status'        => 'applied',
            ]);

            // Log click event
            $this->clickLogger->log($request, 'apply_click', "/requests/{$reqId}", $reqId);

            // Notify parent via email
            $this->mailer->send(
                $tutorReq['parent_email'],
                'New Applicant for Your Tutor Request - MyTutor',
                "Namaste {$tutorReq['parent_name']},\n\nTeacher {$user['name']} has applied for your tutor request: {$tutorReq['subjects']} ({$tutorReq['grade_level']}).\n\nProposal: \"{$message}\"\n\nLog in to MyTutor to view their full credentials, shortlist, or start a message.\n\nBest regards,\nMyTutor Team"
            );

            $application = $this->db->fetchOne("SELECT * FROM applications WHERE id = :id", ['id' => $appId]);

            $this->success('Application submitted successfully!', [
                'application' => $application
            ], 201);
        } catch (Exception $e) {
            $this->error('Failed to submit application: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all applications submitted by current teacher
     * GET /api/teacher/my-applications
     */
    public function myApplications(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $teacherId = (int)$user['id'];

        $sql = "SELECT a.id as application_id, a.message, a.proposed_rate, a.status as application_status, a.created_at,
                       tr.id as request_id, tr.child_name, tr.grade_level, tr.subjects, tr.location_city,
                       tr.location_area, tr.mode, tr.schedule_days, tr.schedule_time, tr.budget_min,
                       tr.budget_max, tr.status as request_status,
                       u.id as parent_id, u.name as parent_name
                FROM applications a
                JOIN tutor_requests tr ON tr.id = a.request_id
                JOIN users u ON u.id = tr.parent_id
                WHERE a.teacher_id = :t_id
                ORDER BY a.created_at DESC";

        $applications = $this->db->fetchAll($sql, ['t_id' => $teacherId]);

        $this->success('Teacher applications retrieved.', [
            'applications' => $applications
        ]);
    }

    /**
     * Get applicants for a parent request
     * GET /api/requests/{id}/applicants
     */
    public function getApplicants(Request $request, string $requestId): void
    {
        $user = $request->getAuthUser();
        $reqId = (int)$requestId;

        $tutorReq = $this->db->fetchOne("SELECT * FROM tutor_requests WHERE id = :id", ['id' => $reqId]);
        if (!$tutorReq) {
            $this->response->notFound('Request not found.');
            return;
        }

        if ((int)$tutorReq['parent_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
            $this->response->forbidden('You are not authorized to view applicants for this request.');
            return;
        }

        $sql = "SELECT a.id as application_id, a.message, a.proposed_rate, a.status as application_status, a.created_at,
                       u.id as teacher_id, u.name as teacher_name, u.email as teacher_email, u.phone as teacher_phone,
                       tp.qualification, tp.experience, tp.experience_years, tp.hourly_rate, tp.location_city,
                       tp.verification_status
                FROM applications a
                JOIN users u ON u.id = a.teacher_id
                JOIN teacher_profiles tp ON tp.user_id = u.id
                WHERE a.request_id = :r_id
                ORDER BY a.created_at DESC";

        $applicants = $this->db->fetchAll($sql, ['r_id' => $reqId]);

        $this->success('Applicants retrieved.', [
            'request'    => $tutorReq,
            'applicants' => $applicants,
        ]);
    }

    /**
     * Update application status (shortlist, reject, hire)
     * PATCH /api/applications/{id}/status
     */
    public function updateStatus(Request $request, string $applicationId): void
    {
        $user = $request->getAuthUser();
        $appId = (int)$applicationId;

        $this->validate($request, [
            'status' => 'required|in:shortlisted,rejected,hired',
        ]);

        $newStatus = (string)$request->get('status');

        $app = $this->db->fetchOne(
            "SELECT a.*, tr.parent_id, tr.subjects, tr.grade_level, u_t.email as teacher_email, u_t.name as teacher_name 
             FROM applications a
             JOIN tutor_requests tr ON tr.id = a.request_id
             JOIN users u_t ON u_t.id = a.teacher_id
             WHERE a.id = :id",
            ['id' => $appId]
        );

        if (!$app) {
            $this->response->notFound('Application not found.');
            return;
        }

        // Ownership check: parent must own the request
        if ((int)$app['parent_id'] !== (int)$user['id'] && $user['role'] !== 'admin') {
            $this->response->forbidden('You are not authorized to modify this application.');
            return;
        }

        $this->db->beginTransaction();

        try {
            // Update application status
            $this->db->update('applications', ['status' => $newStatus], 'id = :id', ['id' => $appId]);

            // If hired, link application to request and update request status to in_progress
            if ($newStatus === 'hired') {
                $this->db->update('tutor_requests', [
                    'hired_application_id' => $appId,
                    'status'               => 'in_progress',
                ], 'id = :id', ['id' => $app['request_id']]);

                // Notify teacher
                $this->mailer->send(
                    $app['teacher_email'],
                    'Congratulations! You Have Been Hired - MyTutor',
                    "Namaste {$app['teacher_name']},\n\nCongratulations! The parent has accepted your proposal and marked you as HIRED for {$app['subjects']} ({$app['grade_level']}).\n\nLog in to MyTutor to coordinate schedule and classes.\n\nBest regards,\nMyTutor Team"
                );
            } elseif ($newStatus === 'shortlisted') {
                // Notify teacher
                $this->mailer->send(
                    $app['teacher_email'],
                    'Your Application Has Been Shortlisted - MyTutor',
                    "Namaste {$app['teacher_name']},\n\nYour application for {$app['subjects']} ({$app['grade_level']}) has been shortlisted by the parent.\n\nBest regards,\nMyTutor Team"
                );
            }

            $this->db->commit();

            $this->success("Application marked as {$newStatus}.", [
                'application_id' => $appId,
                'status'         => $newStatus,
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->error('Failed to update application status: ' . $e->getMessage(), 500);
        }
    }
}
