<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Config;
use Exception;

/**
 * Upload Service
 * Enforces file size limits, MIME type inspection, randomized naming,
 * and secure storage outside the public web root.
 */
class UploadService
{
    private string $storageRoot;
    private int $maxSize;

    private const ALLOWED_DOC_MIMES = [
        'application/pdf' => 'pdf',
        'image/jpeg'      => 'jpg',
        'image/png'       => 'png',
    ];

    public function __construct()
    {
        $config = Config::getInstance();
        $this->storageRoot = dirname(__DIR__, 2) . '/storage/uploads';
        $this->maxSize = (int)$config->get('UPLOAD_MAX_SIZE', 5242880); // 5 MB default
    }

    /**
     * Uploads and stores a teacher verification document outside the public web root.
     */
    public function storeDocument(array $file): array
    {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('No valid uploaded document was received.');
        }

        if ($file['size'] > $this->maxSize) {
            $mb = round($this->maxSize / 1048576, 1);
            throw new Exception("File size exceeds the allowable limit of {$mb}MB.");
        }

        // Strictly verify MIME type using finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!array_key_exists($detectedMime, self::ALLOWED_DOC_MIMES)) {
            throw new Exception('Invalid file format. Only PDF, JPG, and PNG documents are allowed.');
        }

        $extension = self::ALLOWED_DOC_MIMES[$detectedMime];
        $randomName = 'doc_' . bin2hex(random_bytes(16)) . '.' . $extension;
        $relativeDir = 'documents';
        $targetDir = $this->storageRoot . '/' . $relativeDir;

        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0750, true);
        }

        $targetPath = $targetDir . '/' . $randomName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Failed to save the uploaded document to secure storage.');
        }

        return [
            'original_name'   => basename($file['name']),
            'stored_filename' => $randomName,
            'file_path'       => $relativeDir . '/' . $randomName,
            'file_size'       => $file['size'],
            'mime_type'       => $detectedMime,
            'full_path'       => $targetPath,
        ];
    }

    /**
     * Returns full absolute path for a stored relative file path.
     */
    public function getDocumentAbsolutePath(string $relativePath): string
    {
        // Prevent directory traversal attacks
        $cleanRelative = str_replace(['../', '..\\'], '', $relativePath);
        return $this->storageRoot . '/' . ltrim($cleanRelative, '/');
    }
}
