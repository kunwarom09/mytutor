<?php
declare(strict_types=1);

namespace App\Core;

/**
 * HTTP Request Abstraction
 * Handles incoming parameters, JSON payloads, headers, files, and validation.
 */
class Request
{
    private string $method;
    private string $uri;
    private string $path;
    private array $queryParams = [];
    private array $body = [];
    private array $headers = [];
    private array $files = [];
    private array $cookies = [];
    private ?array $authUser = null;

    public function __construct()
    {
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->uri = $_SERVER['REQUEST_URI'] ?? '/';
        $this->path = $this->parsePath($this->uri);
        $this->queryParams = $_GET ?? [];
        $this->headers = $this->parseHeaders();
        $this->cookies = $_COOKIE ?? [];
        $this->files = $_FILES ?? [];
        $this->body = $this->parseBody();
    }

    private function parsePath(string $uri): string
    {
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        $path = rtrim($path, '/');
        return $path === '' ? '/' : $path;
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = str_replace('_', '-', strtolower(substr($key, 5)));
                $headers[$name] = $value;
            } elseif (in_array($key, ['CONTENT_TYPE', 'CONTENT_LENGTH'])) {
                $name = str_replace('_', '-', strtolower($key));
                $headers[$name] = $value;
            }
        }
        return $headers;
    }

    private function parseBody(): array
    {
        $contentType = $this->header('content-type', '');

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            if (!empty($raw)) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            }
            return [];
        }

        return $_POST ?? [];
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getUri(): string
    {
        return $this->uri;
    }

    public function all(): array
    {
        return array_merge($this->queryParams, $this->body);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $this->queryParams[$key] ?? $default;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->queryParams[$key] ?? $default;
    }

    public function body(string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return $this->body;
        }
        return $this->body[$key] ?? $default;
    }

    public function file(string $key): ?array
    {
        return $this->files[$key] ?? null;
    }

    public function header(string $key, ?string $default = null): ?string
    {
        $normalizedKey = strtolower($key);
        return $this->headers[$normalizedKey] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $header = $this->header('authorization');
        if ($header && preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return trim($matches[1]);
        }
        // Fallback to cookie if present
        return $this->cookies['auth_token'] ?? null;
    }

    public function setAuthUser(array $user): void
    {
        $this->authUser = $user;
    }

    public function getAuthUser(): ?array
    {
        return $this->authUser;
    }

    public function userId(): ?int
    {
        return isset($this->authUser['id']) ? (int)$this->authUser['id'] : null;
    }

    public function userRole(): ?string
    {
        return $this->authUser['role'] ?? null;
    }

    public function ip(): string
    {
        return $_SERVER['HTTP_CF_CONNECTING_IP'] 
            ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
            ?? $_SERVER['REMOTE_ADDR'] 
            ?? '127.0.0.1';
    }

    public function userAgent(): string
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    }

    /**
     * Validates input parameters against a simple rule set.
     * Rules: required, email, min:X, max:X, in:a,b,c, numeric, integer
     * Returns an array of error messages keyed by field name.
     */
    public function validate(array $rules): array
    {
        $errors = [];
        $data = $this->all();

        foreach ($rules as $field => $ruleString) {
            $ruleList = is_array($ruleString) ? $ruleString : explode('|', $ruleString);
            $value = $data[$field] ?? null;

            foreach ($ruleList as $rule) {
                $ruleName = $rule;
                $ruleParam = null;

                if (str_contains($rule, ':')) {
                    [$ruleName, $ruleParam] = explode(':', $rule, 2);
                }

                switch ($ruleName) {
                    case 'required':
                        if ($value === null || $value === '' || (is_array($value) && empty($value))) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
                        }
                        break;

                    case 'email':
                        if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[$field][] = 'Please enter a valid email address.';
                        }
                        break;

                    case 'min':
                        $min = (int)$ruleParam;
                        if (is_string($value) && mb_strlen($value) < $min) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must be at least {$min} characters.";
                        } elseif (is_numeric($value) && (float)$value < $min) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must be at least {$min}.";
                        }
                        break;

                    case 'max':
                        $max = (int)$ruleParam;
                        if (is_string($value) && mb_strlen($value) > $max) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " cannot exceed {$max} characters.";
                        } elseif (is_numeric($value) && (float)$value > $max) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " cannot exceed {$max}.";
                        }
                        break;

                    case 'in':
                        $allowed = explode(',', (string)$ruleParam);
                        if ($value !== null && !in_array((string)$value, $allowed, true)) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . ' must be one of: ' . implode(', ', $allowed) . '.';
                        }
                        break;

                    case 'numeric':
                        if ($value !== null && $value !== '' && !is_numeric($value)) {
                            $errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . ' must be a numeric value.';
                        }
                        break;
                }
            }
        }

        return $errors;
    }
}
