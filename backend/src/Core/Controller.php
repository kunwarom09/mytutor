<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Base Controller
 * Supplies helper shortcuts for JSON responses, validation, and database operations.
 */
abstract class Controller
{
    protected Response $response;
    protected Database $db;

    public function __construct()
    {
        $this->response = new Response();
        $this->db = Database::getInstance();
    }

    protected function success(string $message = 'Success', mixed $data = null, int $statusCode = 200, array $meta = []): void
    {
        $this->response->success($message, $data, $statusCode, $meta);
    }

    protected function error(string $message = 'Error', int $statusCode = 400, array $errors = []): void
    {
        $this->response->error($message, $statusCode, $errors);
    }

    protected function validate(Request $request, array $rules): array
    {
        $errors = $request->validate($rules);
        if (!empty($errors)) {
            $this->response->unprocessable('Validation failed', $errors);
        }
        return $request->all();
    }
}
