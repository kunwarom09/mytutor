<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Core\Config;
use App\Core\Database;
use App\Core\Container;
use App\Core\Router;
use App\Core\Request;
use App\Core\Response;
use App\Services\JWTService;
use App\Services\AuthService;
use App\Middleware\CorsMiddleware;

echo "=== Running MyTutor Core Architecture Tests ===\n\n";

$testsPassed = 0;
$totalTests = 0;

function assertTest(string $name, bool $condition): void {
    global $testsPassed, $totalTests;
    $totalTests++;
    if ($condition) {
        $testsPassed++;
        echo "  [PASS] {$name}\n";
    } else {
        echo "  [FAIL] {$name}\n";
    }
}

// ----------------------------------------------------
// 1. Config Singleton Test
// ----------------------------------------------------
echo "1. Testing Config Singleton...\n";
$config1 = Config::getInstance();
$config2 = Config::getInstance();
assertTest("Config returns identical instance", $config1 === $config2);
assertTest("Config loads DB_NAME correctly", $config1->get('DB_NAME') === 'mytutor_db');

// ----------------------------------------------------
// 2. Database Singleton Test
// ----------------------------------------------------
echo "\n2. Testing Database Singleton & Prepared Statements...\n";
$db1 = Database::getInstance();
$db2 = Database::getInstance();
assertTest("Database returns identical instance", $db1 === $db2);

$user = $db1->fetchOne("SELECT id, name, email, role FROM users WHERE email = :email", ['email' => 'admin@mytutor.com']);
assertTest("Database fetchOne retrieves admin", $user !== null && $user['role'] === 'admin');

$teachers = $db1->fetchAll("SELECT id, name FROM users WHERE role = :role", ['role' => 'teacher']);
assertTest("Database fetchAll retrieves multiple teachers", count($teachers) >= 5);

// ----------------------------------------------------
// 3. DI Container Test
// ----------------------------------------------------
echo "\n3. Testing DI Container & Auto-wiring...\n";
$container = new Container();
$container->instance(Database::class, $db1);
$container->set(JWTService::class, fn() => new JWTService());
$jwtFromContainer = $container->get(JWTService::class);
assertTest("Container resolves JWTService", $jwtFromContainer instanceof JWTService);

// Auto-wire AuthService (needs Database and JWTService in constructor)
$authFromContainer = $container->get(AuthService::class);
assertTest("Container auto-wires AuthService with dependencies", $authFromContainer instanceof AuthService);

// ----------------------------------------------------
// 4. JWT Service Test
// ----------------------------------------------------
echo "\n4. Testing JWT Encoding & Decoding...\n";
$jwt = new JWTService();
$testPayload = ['sub' => 999, 'name' => 'Test User', 'role' => 'parent'];
$token = $jwt->encode($testPayload, 3600);
assertTest("JWT token generated with 3 parts", count(explode('.', $token)) === 3);

$decoded = $jwt->decode($token);
assertTest("JWT token successfully decoded", $decoded !== null && $decoded['sub'] === 999);

// Tampered token test
$tamperedToken = $token . 'tampered';
$tamperedDecoded = $jwt->decode($tamperedToken);
assertTest("Tampered JWT signature fails verification", $tamperedDecoded === null);

// Expired token test (TTL = -10 seconds)
$expiredToken = $jwt->encode($testPayload, -10);
$expiredDecoded = $jwt->decode($expiredToken);
assertTest("Expired JWT token is rejected", $expiredDecoded === null);

// ----------------------------------------------------
// 5. Auth Service Test
// ----------------------------------------------------
echo "\n5. Testing AuthService Credentials & Hashing...\n";
$hash = $authFromContainer->hashPassword('Secret123!');
assertTest("Password hashed with bcrypt", str_starts_with($hash, '$2y$'));
assertTest("Password verifies successfully", $authFromContainer->verifyPassword('Secret123!', $hash));
assertTest("Wrong password fails verification", !$authFromContainer->verifyPassword('WrongPass', $hash));

// Login attempt with seeded admin account
$loginResult = $authFromContainer->attempt('admin@mytutor.com', 'Password123!');
assertTest("Admin login attempt succeeds", $loginResult !== null && isset($loginResult['token']));
assertTest("Admin token contains user data", $loginResult['user']['email'] === 'admin@mytutor.com');

// Login attempt with bad password
$badLogin = $authFromContainer->attempt('admin@mytutor.com', 'WrongPassword');
assertTest("Invalid login attempt fails", $badLogin === null);

// ----------------------------------------------------
// 6. Router Test
// ----------------------------------------------------
echo "\n6. Testing Router & Middleware Pipeline...\n";
$router = new Router($container);
$visitedMiddleware = false;

$dummyMiddleware = new class($visitedMiddleware) implements \App\Middleware\MiddlewareInterface {
    private $flag;
    public function __construct(&$flag) { $this->flag = &$flag; }
    public function handle(Request $request, Closure $next): mixed {
        $this->flag = true;
        return $next($request);
    }
};

$router->group(['prefix' => '/api/v1', 'middleware' => [$dummyMiddleware]], function(Router $r) {
    $r->get('/teachers/{id}', function(Request $req, $id) {
        return "Teacher ID: " . $id;
    });
});

// Mock request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/v1/teachers/42';
$mockRequest = new Request();

$output = $router->dispatch($mockRequest);
assertTest("Router matched parameter {id}", $output === "Teacher ID: 42");
assertTest("Middleware pipeline executed", $visitedMiddleware === true);

echo "\n============================================\n";
echo "Test Results: {$testsPassed} / {$totalTests} Passed\n";
echo "============================================\n";

if ($testsPassed === $totalTests) {
    echo "✔ All Core Architecture tests passed perfectly!\n";
    exit(0);
} else {
    echo "❌ Some tests failed.\n";
    exit(1);
}
