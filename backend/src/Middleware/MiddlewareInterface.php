<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use Closure;

interface MiddlewareInterface
{
    /**
     * Handle an incoming request.
     * Must either return the result of $next($request) or terminate with a Response.
     */
    public function handle(Request $request, Closure $next): mixed;
}
