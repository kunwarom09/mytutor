<?php
declare(strict_types=1);

namespace App\Core;

/**
 * HTTP Response Abstraction
 * Produces consistent JSON API responses, status codes, and secure file downloads.
 */
class Response
{
    public function json(mixed $data, int $statusCode = 200, array $headers = []): void
    {
        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json; charset=UTF-8');
            foreach ($headers as $name => $value) {
                header("{$name}: {$value}");
            }
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public function success(string $message = 'Success', mixed $data = null, int $statusCode = 200, array $meta = []): void
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }

        $this->json($payload, $statusCode);
    }

    public function error(string $message = 'An error occurred', int $statusCode = 400, array $errors = []): void
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }

        $this->json($payload, $statusCode);
    }

    public function unauthorized(string $message = 'Authentication required'): void
    {
        $this->error($message, 401);
    }

    public function forbidden(string $message = 'Access forbidden'): void
    {
        $this->error($message, 403);
    }

    public function notFound(string $message = 'Resource not found'): void
    {
        $this->error($message, 404);
    }

    public function unprocessable(string $message = 'Validation failed', array $errors = []): void
    {
        $this->error($message, 422, $errors);
    }

    /**
     * Safely stream a private file (e.g., verification document) to the client.
     */
    public function file(string $filePath, string $filename, string $mimeType = 'application/octet-stream'): void
    {
        if (!file_exists($filePath)) {
            $this->notFound('File not found');
        }

        if (!headers_sent()) {
            header('Content-Type: ' . $mimeType);
            header('Content-Disposition: inline; filename="' . basename($filename) . '"');
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
        }

        readfile($filePath);
        exit;
    }
}
