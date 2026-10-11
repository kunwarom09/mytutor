<?php
declare(strict_types=1);

/**
 * MyTutor Database Migration and Seeder Script
 * Run with: php backend/database/setup_db.php
 */

$envFile = dirname(__DIR__) . '/.env';
if (!file_exists($envFile)) {
    die("Error: .env file not found at {$envFile}\n");
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) {
        continue;
    }
    if (str_contains($line, '=')) {
        [$key, $val] = explode('=', $line, 2);
        $env[trim($key)] = trim($val, " \t\n\r\0\x0B\"'");
    }
}

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '3306';
$dbname = $env['DB_NAME'] ?? 'mytutor_db';
$user = $env['DB_USER'] ?? 'root';
$pass = $env['DB_PASS'] ?? '';

echo "Connecting to MySQL server at {$host}:{$port}...\n";

try {
    // Initial connection without dbname to create it if it doesn't exist
    $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "Ensuring database `{$dbname}` exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

    // Reconnect directly to the target database
    $pdo->exec("USE `{$dbname}`;");

    echo "Executing schema.sql...\n";
    $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
    $pdo->exec($schemaSql);
    echo "✔ Schema imported successfully!\n";

    echo "Executing seed.sql...\n";
    $seedSql = file_get_contents(__DIR__ . '/seed.sql');
    $pdo->exec($seedSql);
    echo "✔ Seed data imported successfully!\n\n";

    echo "=== Summary of Seeded Records in {$dbname} ===\n";
    $tables = [
        'users',
        'teacher_profiles',
        'teacher_documents',
        'admins',
        'tutor_requests',
        'applications',
        'conversations',
        'messages',
        'reports',
        'click_logs',
    ];

    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM `{$table}`");
        $count = $stmt->fetch()['cnt'];
        printf("  - %-20s : %d rows\n", $table, $count);
    }

    echo "\n✔ Database setup and seeding completed successfully!\n";
} catch (PDOException $e) {
    fwrite(STDERR, "Database Error: " . $e->getMessage() . "\n");
    exit(1);
}
