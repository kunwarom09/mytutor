<?php
declare(strict_types=1);

use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Controllers\AuthController;
use App\Controllers\TeacherController;
use App\Controllers\ParentController;
use App\Controllers\TutorRequestController;
use App\Controllers\ApplicationController;
use App\Controllers\MessageController;
use App\Controllers\AdminController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Middleware\CorsMiddleware;
use App\Middleware\RateLimitMiddleware;

/** @var Router $router */

// Global CORS Middleware applies to all /api routes
$router->group(['prefix' => '/api', 'middleware' => [CorsMiddleware::class]], function (Router $router) {

    // Health check endpoint
    $router->get('/health', function (Request $request) {
        (new Response())->success('MyTutor API is healthy and operational', [
            'timestamp' => date('c'),
            'env'       => 'development',
            'php'       => PHP_VERSION,
        ]);
    });

    // Authentication group
    $router->group(['prefix' => '/auth'], function (Router $router) {
        $router->post('/register/teacher', [AuthController::class, 'registerTeacher']);
        $router->post('/register/parent', [AuthController::class, 'registerParent']);

        $loginRateLimiter = RateLimitMiddleware::forEndpoint(10, 60, 'login');
        $router->post('/login', [AuthController::class, 'login'], [$loginRateLimiter]);
        $router->post('/social', [AuthController::class, 'social']);
        $router->post('/logout', [AuthController::class, 'logout']);

        $router->get('/me', [AuthController::class, 'me'], [AuthMiddleware::class]);
    });

    // Public Teacher Directory
    $router->get('/teachers', [TeacherController::class, 'index']);
    $router->get('/teachers/{id}', [TeacherController::class, 'show']);

    // Public & Opportunities: Tutor Requests
    $router->get('/requests', [TutorRequestController::class, 'index']);
    $router->get('/requests/{id}', [TutorRequestController::class, 'show']);

    // Teacher Protected routes
    $teacherRoleCheck = RoleMiddleware::forRoles(['teacher']);
    $router->group(['prefix' => '/teacher', 'middleware' => [AuthMiddleware::class, $teacherRoleCheck]], function (Router $router) {
        $router->get('/profile', [TeacherController::class, 'getProfile']);
        $router->put('/profile', [TeacherController::class, 'updateProfile']);
        $router->get('/my-applications', [ApplicationController::class, 'myApplications']);
    });

    // Teacher Apply to Request
    $router->post('/requests/{id}/apply', [ApplicationController::class, 'apply'], [AuthMiddleware::class, $teacherRoleCheck]);

    // Parent Protected routes
    $parentRoleCheck = RoleMiddleware::forRoles(['parent']);
    $router->group(['prefix' => '/parent', 'middleware' => [AuthMiddleware::class, $parentRoleCheck]], function (Router $router) {
        $router->get('/profile', [ParentController::class, 'getProfile']);
        $router->put('/profile', [ParentController::class, 'updateProfile']);
        $router->get('/my-requests', [TutorRequestController::class, 'myRequests']);
    });

    // Parent Tutor Request management (with ownership check)
    $router->group(['middleware' => [AuthMiddleware::class, $parentRoleCheck]], function (Router $router) {
        $router->post('/requests', [TutorRequestController::class, 'store']);
        $router->put('/requests/{id}', [TutorRequestController::class, 'update']);
        $router->patch('/requests/{id}/close', [TutorRequestController::class, 'close']);
        $router->delete('/requests/{id}', [TutorRequestController::class, 'destroy']);
        $router->get('/requests/{id}/applicants', [ApplicationController::class, 'getApplicants']);
        $router->patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
    });

    // Messaging routes (Protected by AuthMiddleware)
    $messageRateLimiter = RateLimitMiddleware::forEndpoint(30, 60, 'messaging');
    $router->group(['middleware' => [AuthMiddleware::class]], function (Router $router) use ($messageRateLimiter) {
        $router->get('/conversations', [MessageController::class, 'getConversations']);
        $router->post('/conversations', [MessageController::class, 'startConversation']);
        $router->get('/conversations/{id}/messages', [MessageController::class, 'getMessages']);
        $router->post('/conversations/{id}/messages', [MessageController::class, 'sendMessage'], [$messageRateLimiter]);
        $router->post('/conversations/{id}/report', [MessageController::class, 'reportConversation']);
    });

    // Admin Protected routes (Role: admin)
    $adminRoleCheck = RoleMiddleware::forRoles(['admin']);
    $router->group(['prefix' => '/admin', 'middleware' => [AuthMiddleware::class, $adminRoleCheck]], function (Router $router) {
        $router->get('/dashboard', [AdminController::class, 'dashboard']);
        $router->get('/teachers', [AdminController::class, 'teachers']);
        $router->patch('/teachers/{id}/verify', [AdminController::class, 'verifyTeacher']);
        $router->delete('/teachers/{id}', [AdminController::class, 'deleteTeacher']);
        $router->get('/documents/{id}', [AdminController::class, 'viewDocument']);
        $router->get('/parents', [AdminController::class, 'parents']);
        $router->get('/requests', [AdminController::class, 'requests']);
        $router->patch('/requests/{id}/close', [AdminController::class, 'closeRequest']);
        $router->delete('/requests/{id}', [AdminController::class, 'deleteRequest']);
        $router->get('/reports', [AdminController::class, 'reports']);
        $router->patch('/reports/{id}/action', [AdminController::class, 'takeReportAction']);
    });
});
