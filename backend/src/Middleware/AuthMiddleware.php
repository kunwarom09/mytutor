<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use App\Services\JWTService;
use Closure;

/**
 * Authentication Middleware
 * Validates incoming Bearer token, checks user validity in DB, and attaches user to Request.
 */
class AuthMiddleware implements MiddlewareInterface
{
    private JWTService $jwt;
    private AuthService $auth;
    private Response $response;

    public function __construct(JWTService $jwt, AuthService $auth, Response $response)
    {
        $this->jwt = $jwt;
        $this->auth = $auth;
        $this->response = $response;
    }

    public function handle(Request $request, Closure $next): mixed
    {
        $token = $request->bearerToken();

        if (!$token) {
            $this->response->unauthorized('Access denied. Authentication token required.');
            return null;
        }

        $payload = $this->jwt->decode($token);

        if (!$payload || empty($payload['sub'])) {
            $this->response->unauthorized('Invalid or expired authentication token.');
            return null;
        }

        $userId = (int)$payload['sub'];
        $user = $this->auth->getUserById($userId);

        if (!$user) {
            $this->response->unauthorized('User associated with token no longer exists.');
            return null;
        }

        if ($user['status'] === 'suspended') {
            $this->response->forbidden('Your account is currently suspended.');
            return null;
        }

        $request->setAuthUser($user);

        return $next($request);
    }
}
