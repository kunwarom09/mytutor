<?php
declare(strict_types=1);

/**
 * MyTutor - Pure OOP PHP REST API Backend
 * Front Controller Entry Point
 */

// Built-in web server router support
if (php_sapi_name() === 'cli-server') {
    $filePath = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($filePath)) {
        return false;
    }
}

// Autoload composer classes
require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Config;
use App\Core\Database;
use App\Core\Container;
use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Services\JWTService;
use App\Services\AuthService;
use App\Services\UploadService;
use App\Services\MailerService;
use App\Services\ClickLogService;
use App\Middleware\CorsMiddleware;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Middleware\RateLimitMiddleware;

// Initialize Configuration Singleton
$config = Config::getInstance();

// Set error reporting based on environment
if ($config->isDev()) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// Global Exception Handler - returns consistent JSON errors
set_exception_handler(function (Throwable $e) use ($config) {
    $response = new Response();
    $statusCode = 500;

    $errorPayload = [
        'success' => false,
        'message' => $e->getMessage() ?: 'Internal Server Error',
    ];

    if ($config->isDev()) {
        $errorPayload['debug'] = [
            'file'  => $e->getFile(),
            'line'  => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString()),
        ];
    }

    $response->json($errorPayload, $statusCode);
});

// Initialize Dependency Injection Container
$container = Container::getInstance();

// Register Core Singletons & Services
$container->instance(Config::class, $config);
$container->instance(Database::class, Database::getInstance());
$container->set(Response::class, fn() => new Response());
$container->set(JWTService::class, fn($c) => new JWTService());
$container->set(AuthService::class, fn($c) => new AuthService($c->get(Database::class), $c->get(JWTService::class)));
$container->set(UploadService::class, fn() => new UploadService());
$container->set(MailerService::class, fn() => new MailerService());
$container->set(ClickLogService::class, fn($c) => new ClickLogService($c->get(Database::class)));

// Register Router & Request
$router = new Router($container);
$request = new Request();

// Load Route Definitions
require_once dirname(__DIR__) . '/src/Routes/api.php';

// Apply CORS globally before routing
$cors = new CorsMiddleware();
$cors->handle($request, function (Request $req) use ($router) {
    $router->dispatch($req);
});

