<?php
declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use PDOStatement;

/**
 * Singleton Database Connection (PDO)
 * Strictly utilizes prepared statements and robust error handling.
 */
class Database
{
    private static ?Database $instance = null;
    private ?PDO $pdo = null;

    private function __construct()
    {
        $this->connect();
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

    private function connect(): void
    {
        $config = Config::getInstance();
        $dbConfig = $config->getDbConfig();

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            $dbConfig['host'],
            $dbConfig['port'],
            $dbConfig['dbname']
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $this->pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], $options);
        } catch (PDOException $e) {
            throw new PDOException("Database connection failed: " . $e->getMessage(), (int)$e->getCode());
        }
    }

    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /**
     * Executes a prepared statement with parameters.
     */
    public function query(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Fetches a single row.
     */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->query($sql, $params);
        $result = $stmt->fetch();
        return $result === false ? null : $result;
    }

    /**
     * Fetches all rows.
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Inserts a record and returns the last inserted ID.
     */
    public function insert(string $table, array $data): int
    {
        $columns = array_keys($data);
        $placeholders = array_map(fn($col) => ':' . $col, $columns);

        $sql = sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s)',
            $table,
            implode(', ', array_map(fn($col) => '`' . $col . '`', $columns)),
            implode(', ', $placeholders)
        );

        $this->query($sql, $data);
        return (int)$this->pdo->lastInsertId();
    }

    /**
     * Updates records matching a WHERE clause.
     */
    public function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $setClauses = [];
        $params = [];

        foreach ($data as $column => $value) {
            $paramKey = 'set_' . $column;
            $setClauses[] = sprintf('`%s` = :%s', $column, $paramKey);
            $params[$paramKey] = $value;
        }

        $sql = sprintf(
            'UPDATE `%s` SET %s WHERE %s',
            $table,
            implode(', ', $setClauses),
            $where
        );

        $mergedParams = array_merge($params, $whereParams);
        $stmt = $this->query($sql, $mergedParams);
        return $stmt->rowCount();
    }

    /**
     * Deletes records matching a WHERE clause.
     */
    public function delete(string $table, string $where, array $whereParams = []): int
    {
        $sql = sprintf('DELETE FROM `%s` WHERE %s', $table, $where);
        $stmt = $this->query($sql, $whereParams);
        return $stmt->rowCount();
    }

    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    public function rollBack(): bool
    {
        return $this->pdo->rollBack();
    }
}
