<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use Closure;

/**
 * Rate Limit Middleware
 * Protects endpoints (such as login and messaging) against brute force and spam abuse.
 */
class RateLimitMiddleware implements MiddlewareInterface
{
    private int $maxAttempts;
    private int $decaySeconds;
    private string $keyPrefix;
    private Response $response;

    public function __construct(int $maxAttempts = 60, int $decaySeconds = 60, string $keyPrefix = 'global')
    {
        $this->maxAttempts = $maxAttempts;
        $this->decaySeconds = $decaySeconds;
        $this->keyPrefix = $keyPrefix;
        $this->response = new Response();
    }

    public static function forEndpoint(int $maxAttempts, int $decaySeconds, string $keyPrefix): self
    {
        return new self($maxAttempts, $decaySeconds, $keyPrefix);
    }

    public function handle(Request $request, Closure $next): mixed
    {
        $ip = $request->ip();
        $cacheDir = dirname(__DIR__, 2) . '/storage/logs/ratelimit';

        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }

        $hashKey = md5("{$this->keyPrefix}_{$ip}");
        $filePath = "{$cacheDir}/{$hashKey}.json";

        $now = time();
        $data = ['count' => 0, 'expires_at' => $now + $this->decaySeconds];

        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            $parsed = json_decode((string)$content, true);

            if (is_array($parsed) && isset($parsed['expires_at']) && $parsed['expires_at'] > $now) {
                $data = $parsed;
            }
        }

        $data['count']++;

        if ($data['count'] > $this->maxAttempts) {
            $retryAfter = max(1, $data['expires_at'] - $now);
            header("Retry-After: {$retryAfter}");
            $this->response->error("Too many requests. Please try again in {$retryAfter} seconds.", 429);
            return null;
        }

        file_put_contents($filePath, json_encode($data), LOCK_EX);

        return $next($request);
    }
}
