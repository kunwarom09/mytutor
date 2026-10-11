<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Database;
use App\Core\Request;

/**
 * Click & View Analytics Service
 * Tracks user interactions and aggregates 7-day data for Admin dashboard charts.
 */
class ClickLogService
{
    private Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    /**
     * Record an action or page view.
     */
    public function log(Request $request, string $actionType = 'page_view', ?string $pagePath = null, ?int $targetId = null): void
    {
        try {
            $this->db->insert('click_logs', [
                'user_id'     => $request->userId(),
                'ip_address'  => $request->ip(),
                'user_agent'  => substr($request->userAgent(), 0, 255),
                'page_path'   => $pagePath ?? $request->getPath(),
                'action_type' => $actionType,
                'target_id'   => $targetId,
            ]);
        } catch (\Throwable $e) {
            // Silently ignore logging failures to not disrupt primary user workflows
        }
    }

    /**
     * Get aggregated daily clicks/views for the last N days.
     */
    public function getDailyClicks(int $days = 7): array
    {
        $sql = "SELECT DATE(created_at) as log_date, COUNT(*) as click_count,
                       SUM(CASE WHEN action_type = 'page_view' THEN 1 ELSE 0 END) as views_count,
                       SUM(CASE WHEN action_type != 'page_view' THEN 1 ELSE 0 END) as actions_count
                FROM click_logs
                WHERE created_at >= CURDATE() - INTERVAL :days DAY
                GROUP BY DATE(created_at)
                ORDER BY log_date ASC";

        $rows = $this->db->fetchAll($sql, ['days' => $days]);

        // Ensure every single date in the range is represented even if 0
        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $result[$date] = [
                'date'    => $date,
                'clicks'  => 0,
                'views'   => 0,
                'actions' => 0,
            ];
        }

        foreach ($rows as $row) {
            $date = $row['log_date'];
            if (isset($result[$date])) {
                $result[$date]['clicks'] = (int)$row['click_count'];
                $result[$date]['views'] = (int)$row['views_count'];
                $result[$date]['actions'] = (int)$row['actions_count'];
            }
        }

        return array_values($result);
    }
}
