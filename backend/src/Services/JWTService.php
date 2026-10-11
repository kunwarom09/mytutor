<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Config;
use Exception;

/**
 * Pure PHP JWT Service
 * Implements HMAC-SHA256 (HS256) JWT generation and verification.
 */
class JWTService
{
    private string $secret;
    private string $issuer;
    private int $defaultTtl;

    public function __construct()
    {
        $config = Config::getInstance();
        $this->secret = (string)$config->get('JWT_SECRET', 'mytutor_super_secret_jwt_key_fallback');
        $this->issuer = (string)$config->get('JWT_ISSUER', 'mytutor-api');
        $this->defaultTtl = (int)$config->get('JWT_ACCESS_TTL', 86400);
    }

    /**
     * Generate a signed JWT token.
     */
    public function encode(array $payload, ?int $ttl = null): string
    {
        $issuedAt = time();
        $expiresAt = $issuedAt + ($ttl ?? $this->defaultTtl);

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $payload = array_merge([
            'iss' => $this->issuer,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
        ], $payload);

        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $this->secret, true);
        $signatureEncoded = $this->base64UrlEncode($signature);

        return "{$headerEncoded}.{$payloadEncoded}.{$signatureEncoded}";
    }

    /**
     * Decode and verify a JWT token.
     * Returns null if signature is invalid or token is expired.
     */
    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

        // Verify signature
        $expectedSignature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $this->secret, true);
        $expectedSignatureEncoded = $this->base64UrlEncode($expectedSignature);

        if (!hash_equals($expectedSignatureEncoded, $signatureEncoded)) {
            return null; // Invalid signature
        }

        $payloadJson = $this->base64UrlDecode($payloadEncoded);
        $payload = json_decode($payloadJson, true);

        if (!is_array($payload)) {
            return null;
        }

        // Verify expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Token expired
        }

        return $payload;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
