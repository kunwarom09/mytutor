<?php
declare(strict_types=1);

namespace App\Core;

use ReflectionClass;
use ReflectionNamedType;
use Exception;

/**
 * Dependency Injection Container
 * Resolves registered services, factories, and auto-wires class constructor parameters.
 */
class Container
{
    private static ?Container $instance = null;
    private array $bindings = [];
    private array $instances = [];

    public function __construct()
    {
        self::$instance = $this;
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Bind a service or factory to the container.
     */
    public function set(string $id, mixed $concrete = null, bool $shared = true): self
    {
        if ($concrete === null) {
            $concrete = $id;
        }

        $this->bindings[$id] = [
            'concrete' => $concrete,
            'shared' => $shared,
        ];

        return $this;
    }

    /**
     * Bind an existing singleton instance directly.
     */
    public function instance(string $id, object $instance): self
    {
        $this->instances[$id] = $instance;
        return $this;
    }

    public function has(string $id): bool
    {
        return isset($this->bindings[$id]) || isset($this->instances[$id]) || class_exists($id);
    }

    /**
     * Resolves the requested service or class.
     */
    public function get(string $id): mixed
    {
        // Return existing shared instance if available
        if (isset($this->instances[$id])) {
            return $this->instances[$id];
        }

        $concrete = $this->bindings[$id]['concrete'] ?? $id;
        $shared = $this->bindings[$id]['shared'] ?? true;

        // If closure or callable
        if ($concrete instanceof \Closure) {
            $object = $concrete($this);
            if ($shared) {
                $this->instances[$id] = $object;
            }
            return $object;
        }

        // If string class name, auto-wire via reflection
        if (is_string($concrete) && class_exists($concrete)) {
            $object = $this->build($concrete);
            if ($shared) {
                $this->instances[$id] = $object;
            }
            return $object;
        }

        if (is_object($concrete)) {
            return $concrete;
        }

        throw new Exception("Unable to resolve service: {$id}");
    }

    /**
     * Instantiates a class and resolves constructor dependencies recursively.
     */
    public function build(string $className): object
    {
        $reflector = new ReflectionClass($className);

        if (!$reflector->isInstantiable()) {
            throw new Exception("Class {$className} is not instantiable");
        }

        $constructor = $reflector->getConstructor();
        if ($constructor === null) {
            return new $className();
        }

        $parameters = $constructor->getParameters();
        $dependencies = [];

        foreach ($parameters as $parameter) {
            $type = $parameter->getType();

            if ($type === null) {
                if ($parameter->isDefaultValueAvailable()) {
                    $dependencies[] = $parameter->getDefaultValue();
                } else {
                    throw new Exception("Cannot resolve untyped parameter {$parameter->getName()} in {$className}");
                }
                continue;
            }

            if ($type instanceof ReflectionNamedType && !$type->isBuiltin()) {
                $dependencyClass = $type->getName();
                $dependencies[] = $this->get($dependencyClass);
            } elseif ($parameter->isDefaultValueAvailable()) {
                $dependencies[] = $parameter->getDefaultValue();
            } else {
                throw new Exception("Cannot resolve parameter {$parameter->getName()} in {$className}");
            }
        }

        return $reflector->newInstanceArgs($dependencies);
    }
}
