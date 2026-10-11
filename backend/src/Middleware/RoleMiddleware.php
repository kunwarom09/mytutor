<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use Closure;

/**
 * Role-Based Access Control Middleware
 * Enforces role restrictions (parent, teacher, admin) and checks teacher approval status.
 */
class RoleMiddleware implements MiddlewareInterface
{
    private array $allowedRoles;
    private bool $requireTeacherApproval;
    private Response $response;

    public function __construct(array $allowedRoles = [], bool $requireTeacherApproval = false)
    {
        $this->allowedRoles = $allowedRoles;
        $this->requireTeacherApproval = $requireTeacherApproval;
        $this->response = new Response();
    }

    public static function forRoles(array $roles, bool $requireTeacherApproval = false): self
    {
        return new self($roles, $requireTeacherApproval);
    }

    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->getAuthUser();

        if (!$user) {
            $this->response->unauthorized('Authentication required.');
            return null;
        }

        $userRole = $user['role'] ?? null;

        // If specific roles required, check match
        if (!empty($this->allowedRoles) && !in_array($userRole, $this->allowedRoles, true)) {
            $this->response->forbidden('Forbidden: You do not have permissions for this action.');
            return null;
        }

        // If user is a teacher and approval is strictly required
        if ($userRole === 'teacher' && $this->requireTeacherApproval) {
            $verificationStatus = $user['verification_status'] ?? 'pending';
            if ($verificationStatus !== 'approved') {
                $this->response->forbidden('Your teacher profile is pending document verification by an administrator.');
                return null;
            }
        }

        return $next($request);
    }
}
