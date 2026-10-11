<?php
declare(strict_types=1);

namespace App\Core;

use App\Middleware\MiddlewareInterface;
use Closure;
use Exception;

/**
 * Custom Router
 * Supports HTTP verbs, route groups, nested prefixes, middleware pipelines,
 * parameter matching, and DI container resolution.
 */
class Router
{
    private Container $container;
    private array $routes = [];
    private array $groupStack = [];

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * Define a route group with shared attributes (prefix, middleware).
     */
    public function group(array $attributes, callable $callback): void
    {
        $this->groupStack[] = $attributes;
        $callback($this);
        array_pop($this->groupStack);
    }

    public function get(string $uri, mixed $action, array $middleware = []): self
    {
        return $this->addRoute('GET', $uri, $action, $middleware);
    }

    public function post(string $uri, mixed $action, array $middleware = []): self
    {
        return $this->addRoute('POST', $uri, $action, $middleware);
    }

    public function put(string $uri, mixed $action, array $middleware = []): self
    {
        return $this->addRoute('PUT', $uri, $action, $middleware);
    }

    public function patch(string $uri, mixed $action, array $middleware = []): self
    {
        return $this->addRoute('PATCH', $uri, $action, $middleware);
    }

    public function delete(string $uri, mixed $action, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $uri, $action, $middleware);
    }

    public function options(string $uri, mixed $action, array $middleware = []): self
    {
        return $this->addRoute('OPTIONS', $uri, $action, $middleware);
    }

    private function addRoute(string $method, string $uri, mixed $action, array $middleware = []): self
    {
        $prefix = '';
        $groupMiddleware = [];

        foreach ($this->groupStack as $group) {
            if (isset($group['prefix'])) {
                $prefix .= '/' . trim($group['prefix'], '/');
            }
            if (isset($group['middleware'])) {
                $m = is_array($group['middleware']) ? $group['middleware'] : [$group['middleware']];
                $groupMiddleware = array_merge($groupMiddleware, $m);
            }
        }

        $fullUri = $prefix . '/' . trim($uri, '/');
        $fullUri = '/' . trim($fullUri, '/');
        if ($fullUri === '') {
            $fullUri = '/';
        }

        $allMiddleware = array_merge($groupMiddleware, $middleware);

        $this->routes[] = [
            'method'     => strtoupper($method),
            'uri'        => $fullUri,
            'action'     => $action,
            'middleware' => $allMiddleware,
            'pattern'    => $this->compilePattern($fullUri),
        ];

        return $this;
    }

    private function compilePattern(string $uri): string
    {
        // Replace {param} with named regex capture groups
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $uri);
        return '#^' . $pattern . '$#';
    }

    /**
     * Dispatches the incoming HTTP request.
     */
    public function dispatch(Request $request): mixed
    {
        $method = $request->getMethod();
        $path = $request->getPath();

        $allowedMethods = [];
        $matchedRoute = null;
        $matchedParams = [];

        foreach ($this->routes as $route) {
            if (preg_match($route['pattern'], $path, $matches)) {
                $allowedMethods[] = $route['method'];

                if ($route['method'] === $method) {
                    $matchedRoute = $route;
                    // Extract named parameters
                    foreach ($matches as $key => $value) {
                        if (is_string($key)) {
                            $matchedParams[$key] = $value;
                        }
                    }
                    break;
                }
            }
        }

        if ($matchedRoute !== null) {
            return $this->runRoutePipeline($matchedRoute, $request, $matchedParams);
        }

        $response = new Response();

        if (!empty($allowedMethods)) {
            if ($method === 'OPTIONS') {
                http_response_code(204);
                return null;
            }
            $response->error("Method {$method} not allowed for {$path}. Allowed: " . implode(', ', array_unique($allowedMethods)), 405);
            return null;
        }

        $response->notFound("Route {$method} {$path} not found.");
        return null;
    }

    /**
     * Executes the route's middleware stack followed by the action.
     */
    private function runRoutePipeline(array $route, Request $request, array $params): mixed
    {
        $middlewareStack = $route['middleware'];
        $action = $route['action'];

        $pipeline = function (Request $req) use ($action, $params) {
            return $this->executeAction($action, $req, $params);
        };

        // Build middleware chain from right to left
        while (!empty($middlewareStack)) {
            $middleware = array_pop($middlewareStack);

            $pipeline = function (Request $req) use ($middleware, $pipeline) {
                $middlewareInstance = is_object($middleware) 
                    ? $middleware 
                    : $this->container->get($middleware);

                if (!$middlewareInstance instanceof MiddlewareInterface) {
                    throw new Exception("Middleware " . get_class($middlewareInstance) . " must implement MiddlewareInterface");
                }

                return $middlewareInstance->handle($req, $pipeline);
            };
        }

        return $pipeline($request);
    }

    /**
     * Executes the controller or closure action.
     */
    private function executeAction(mixed $action, Request $request, array $params): mixed
    {
        if ($action instanceof Closure) {
            return $action($request, ...array_values($params));
        }

        if (is_array($action) && count($action) === 2) {
            [$controllerClass, $method] = $action;

            $controller = is_object($controllerClass)
                ? $controllerClass
                : $this->container->get($controllerClass);

            if (!method_exists($controller, $method)) {
                throw new Exception("Method {$method} does not exist on controller " . get_class($controller));
            }

            return $controller->$method($request, ...array_values($params));
        }

        throw new Exception("Invalid route action handler");
    }
}
