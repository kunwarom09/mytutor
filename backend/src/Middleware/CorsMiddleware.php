<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Config;
use App\Core\Request;
use Closure;

/**
 * CORS Middleware
 * Handles origin verification, allowed headers, credentials, and preflight requests.
 */
class CorsMiddleware implements MiddlewareInterface
{
    public function handle(Request $request, Closure $next): mixed
    {
        $config = Config::getInstance();
        $allowedOriginsString = $config->get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000');
        $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $allowedOriginsString))));

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $isAllowed = false;
        if (!empty($origin)) {
            if (in_array($origin, $allowedOrigins, true)) {
                $isAllowed = true;
            } elseif ($config->isDev()) {
                // In development, permit localhost, 127.0.0.1, and local private network IPs on any port
                if (preg_match('#^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$#', $origin)) {
                    $isAllowed = true;
                }
            }
        }

        $allowedOrigin = $isAllowed ? $origin : ($allowedOrigins[0] ?? 'http://localhost:3000');

        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, X-CSRF-Token');
        header('Access-Control-Max-Age: 86400');

        // Preflight OPTIONS check
        if ($request->getMethod() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        return $next($request);
    }
}
