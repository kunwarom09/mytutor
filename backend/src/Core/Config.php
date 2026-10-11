<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Singleton Configuration Loader
 * Parses environment variables from .env and system environment.
 */
class Config
{
    private static ?Config $instance = null;
    private array $settings = [];

    private function __construct()
    {
        $this->loadEnvironment();
    }

    private function __clone() {}

    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize singleton");
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function loadEnvironment(): void
    {
        $envPath = dirname(__DIR__, 2) . '/.env';
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                if (str_contains($line, '=')) {
                    [$key, $value] = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value, " \t\n\r\0\x0B\"'");
                    $this->settings[$key] = $value;
                }
            }
        }

        // Merge in system environment variables (take precedence)
        foreach ($_ENV as $key => $value) {
            $this->settings[$key] = $value;
        }
        foreach ($_SERVER as $key => $value) {
            if (!isset($this->settings[$key]) && is_string($value)) {
                $this->settings[$key] = $value;
            }
        }
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->settings[$key] ?? $default;
    }

    public function isDev(): bool
    {
        return ($this->get('APP_ENV', 'production') === 'development') 
            || ($this->get('APP_DEBUG', 'false') === 'true');
    }

    public function getDbConfig(): array
    {
        return [
            'host' => $this->get('DB_HOST', '127.0.0.1'),
            'port' => $this->get('DB_PORT', '3306'),
            'dbname' => $this->get('DB_NAME', 'mytutor_db'),
            'user' => $this->get('DB_USER', 'root'),
            'pass' => $this->get('DB_PASS', ''),
        ];
    }
}
