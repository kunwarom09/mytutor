<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Config;

/**
 * Mailer Service
 * Clean abstraction for email notifications with logging.
 */
class MailerService
{
    private string $logPath;

    public function __construct()
    {
        $this->logPath = dirname(__DIR__, 2) . '/storage/logs/mail.log';
    }

    /**
     * Send or log an email notification.
     */
    public function send(string $to, string $subject, string $body): bool
    {
        $logDir = dirname($this->logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = date('Y-m-d H:i:s');
        $logEntry = sprintf(
            "[%s] TO: %s | SUBJECT: %s\nBODY:\n%s\n%s\n",
            $timestamp,
            $to,
            $subject,
            $body,
            str_repeat('-', 60)
        );

        file_put_contents($this->logPath, $logEntry, FILE_APPEND | LOCK_EX);

        // Optionally invoke PHP mail() if production and configured
        $env = Config::getInstance()->get('APP_ENV', 'development');
        if ($env === 'production' && function_exists('mail')) {
            $headers = "From: no-reply@mytutor.com\r\nContent-Type: text/html; charset=UTF-8\r\n";
            @mail($to, $subject, $body, $headers);
        }

        return true;
    }
}
