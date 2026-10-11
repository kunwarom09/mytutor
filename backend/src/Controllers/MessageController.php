<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Services\MailerService;
use Exception;

/**
 * Message Controller
 * Handles 1-to-1 Parent <-> Teacher messaging, unread counts,
 * message polling, rate-limiting, and conversation reporting.
 */
class MessageController extends Controller
{
    private MailerService $mailer;

    public function __construct(MailerService $mailer)
    {
        parent::__construct();
        $this->mailer = $mailer;
    }

    /**
     * Get all conversations for the authenticated user
     * GET /api/conversations
     */
    public function getConversations(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];

        $sql = "SELECT c.id, c.parent_id, c.teacher_id, c.request_id, c.updated_at,
                       tr.subjects as request_subjects, tr.grade_level as request_grade,
                       CASE WHEN c.parent_id = :uid1 THEN u_t.id ELSE u_p.id END as other_user_id,
                       CASE WHEN c.parent_id = :uid2 THEN u_t.name ELSE u_p.name END as other_user_name,
                       CASE WHEN c.parent_id = :uid3 THEN u_t.role ELSE u_p.role END as other_user_role,
                       CASE WHEN c.parent_id = :uid4 THEN u_t.avatar ELSE u_p.avatar END as other_user_avatar,
                       CASE WHEN c.parent_id = :uid5 THEN tp.verification_status ELSE NULL END as other_teacher_verification,
                       (SELECT m.body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) as last_message_body,
                       (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) as last_message_time,
                       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != :uid6 AND m.is_read = 0) as unread_count
                FROM conversations c
                JOIN users u_p ON u_p.id = c.parent_id
                JOIN users u_t ON u_t.id = c.teacher_id
                LEFT JOIN teacher_profiles tp ON tp.user_id = u_t.id
                LEFT JOIN tutor_requests tr ON tr.id = c.request_id
                WHERE c.parent_id = :uid7 OR c.teacher_id = :uid8
                ORDER BY c.updated_at DESC";

        $params = [
            'uid1' => $userId,
            'uid2' => $userId,
            'uid3' => $userId,
            'uid4' => $userId,
            'uid5' => $userId,
            'uid6' => $userId,
            'uid7' => $userId,
            'uid8' => $userId,
        ];
        $conversations = $this->db->fetchAll($sql, $params);

        // Escape output message body
        foreach ($conversations as &$conv) {
            if ($conv['last_message_body']) {
                $conv['last_message_body'] = htmlspecialchars($conv['last_message_body'], ENT_QUOTES, 'UTF-8');
            }
        }

        $this->success('Conversations retrieved.', [
            'conversations' => $conversations
        ]);
    }

    /**
     * Start or find an existing conversation
     * POST /api/conversations
     */
    public function startConversation(Request $request): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];
        $userRole = (string)$user['role'];

        $targetTeacherId = $request->get('teacher_id') ? (int)$request->get('teacher_id') : null;
        $targetParentId = $request->get('parent_id') ? (int)$request->get('parent_id') : null;
        $requestId = $request->get('request_id') ? (int)$request->get('request_id') : null;

        if ($userRole === 'parent') {
            $parentId = $userId;
            $teacherId = $targetTeacherId;
        } elseif ($userRole === 'teacher') {
            $parentId = $targetParentId;
            $teacherId = $userId;
        } else {
            // Admin can initiate with both specified
            $parentId = $targetParentId;
            $teacherId = $targetTeacherId;
        }

        if (!$parentId || !$teacherId) {
            $this->error('Both parent and teacher participants are required to start a conversation.', 422);
            return;
        }

        if ($parentId === $teacherId) {
            $this->error('You cannot start a conversation with yourself.', 422);
            return;
        }

        // Rule: Teacher must be approved to engage in messaging
        $teacher = $this->db->fetchOne(
            "SELECT u.id, u.name, tp.verification_status 
             FROM users u 
             JOIN teacher_profiles tp ON tp.user_id = u.id 
             WHERE u.id = :t_id",
            ['t_id' => $teacherId]
        );

        if (!$teacher || $teacher['verification_status'] !== 'approved') {
            $this->error('Messaging is only permitted with approved and verified teachers.', 403);
            return;
        }

        // Check if conversation already exists
        $sql = "SELECT id FROM conversations 
                WHERE parent_id = :p_id AND teacher_id = :t_id 
                LIMIT 1";
        $existing = $this->db->fetchOne($sql, [
            'p_id' => $parentId,
            't_id' => $teacherId,
        ]);

        if ($existing) {
            // If request_id provided and not set on existing, update it
            if ($requestId && empty($existing['request_id'])) {
                $this->db->update('conversations', ['request_id' => $requestId], 'id = :id', ['id' => $existing['id']]);
            }

            $this->success('Conversation found.', [
                'conversation_id' => (int)$existing['id'],
                'is_new'          => false,
            ]);
            return;
        }

        // Create new conversation
        $conversationId = $this->db->insert('conversations', [
            'parent_id'  => $parentId,
            'teacher_id' => $teacherId,
            'request_id' => $requestId,
        ]);

        $this->success('Conversation started.', [
            'conversation_id' => $conversationId,
            'is_new'          => true,
        ], 201);
    }

    /**
     * Get messages in a conversation (with polling support)
     * GET /api/conversations/{id}/messages
     */
    public function getMessages(Request $request, string $conversationId): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];
        $convId = (int)$conversationId;

        // Verify conversation ownership
        $conversation = $this->db->fetchOne(
            "SELECT * FROM conversations WHERE id = :id",
            ['id' => $convId]
        );

        if (!$conversation) {
            $this->response->notFound('Conversation not found.');
            return;
        }

        if ((int)$conversation['parent_id'] !== $userId && (int)$conversation['teacher_id'] !== $userId && $user['role'] !== 'admin') {
            $this->response->forbidden('You are not a participant in this conversation.');
            return;
        }

        // Mark unread messages sent by the other party as read
        $this->db->update(
            'messages',
            ['is_read' => 1, 'read_at' => date('Y-m-d H:i:s')],
            'conversation_id = :cid AND sender_id != :uid AND is_read = 0',
            ['cid' => $convId, 'uid' => $userId]
        );

        $afterId = $request->query('after_id');
        $params = ['cid' => $convId];
        $whereAfter = '';

        if ($afterId !== null && is_numeric($afterId)) {
            $whereAfter = "AND m.id > :after_id";
            $params['after_id'] = (int)$afterId;
        }

        $sql = "SELECT m.id, m.conversation_id, m.sender_id, m.body, m.is_read, m.created_at,
                       u.name as sender_name, u.role as sender_role, u.avatar as sender_avatar
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                WHERE m.conversation_id = :cid {$whereAfter}
                ORDER BY m.id ASC
                LIMIT 100";

        $messages = $this->db->fetchAll($sql, $params);

        // Escape output
        foreach ($messages as &$msg) {
            $msg['body'] = htmlspecialchars($msg['body'], ENT_QUOTES, 'UTF-8');
            $msg['is_mine'] = ((int)$msg['sender_id'] === $userId);
        }

        $this->success('Messages retrieved.', [
            'conversation_id' => $convId,
            'messages'        => $messages,
        ]);
    }

    /**
     * Send a message
     * POST /api/conversations/{id}/messages
     */
    public function sendMessage(Request $request, string $conversationId): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];
        $convId = (int)$conversationId;

        // Check conversation participation
        $conversation = $this->db->fetchOne(
            "SELECT c.*, 
                    u_p.email as parent_email, u_p.name as parent_name,
                    u_t.email as teacher_email, u_t.name as teacher_name
             FROM conversations c
             JOIN users u_p ON u_p.id = c.parent_id
             JOIN users u_t ON u_t.id = c.teacher_id
             WHERE c.id = :id",
            ['id' => $convId]
        );

        if (!$conversation) {
            $this->response->notFound('Conversation not found.');
            return;
        }

        if ((int)$conversation['parent_id'] !== $userId && (int)$conversation['teacher_id'] !== $userId && $user['role'] !== 'admin') {
            $this->response->forbidden('You cannot send messages to a conversation you are not part of.');
            return;
        }

        // If sender is teacher, check approval status
        if ($user['role'] === 'teacher') {
            $status = $user['verification_status'] ?? null;
            if (!$status) {
                $tp = $this->db->fetchOne("SELECT verification_status FROM teacher_profiles WHERE user_id = :uid", ['uid' => $userId]);
                $status = $tp['verification_status'] ?? 'pending';
            }
            if ($status !== 'approved') {
                $this->response->forbidden('Your teacher profile is pending document verification by an administrator.');
                return;
            }
        }

        // Validation & length limit
        $this->validate($request, [
            'body' => 'required|min:1|max:1000',
        ]);

        $body = trim((string)$request->get('body'));

        // Basic spam rate check: max 20 messages in the last 60 seconds by this user
        $recentCount = $this->db->fetchOne(
            "SELECT COUNT(*) as cnt FROM messages 
             WHERE sender_id = :uid AND created_at >= NOW() - INTERVAL 1 MINUTE",
            ['uid' => $userId]
        );

        if ((int)($recentCount['cnt'] ?? 0) >= 20) {
            $this->error('You are sending messages too quickly. Please wait a moment.', 429);
            return;
        }

        try {
            $msgId = $this->db->insert('messages', [
                'conversation_id' => $convId,
                'sender_id'       => $userId,
                'body'            => $body,
                'is_read'         => 0,
            ]);

            // Update conversation updated_at timestamp
            $this->db->update('conversations', ['updated_at' => date('Y-m-d H:i:s')], 'id = :id', ['id' => $convId]);

            // Determine recipient for email notification
            $isSenderParent = ($userId === (int)$conversation['parent_id']);
            $recipientEmail = $isSenderParent ? $conversation['teacher_email'] : $conversation['parent_email'];
            $recipientName  = $isSenderParent ? $conversation['teacher_name'] : $conversation['parent_name'];

            // Log email notification
            $this->mailer->send(
                $recipientEmail,
                "New Message from {$user['name']} - MyTutor",
                "Namaste {$recipientName},\n\nYou have received a new message from {$user['name']}:\n\n\"{$body}\"\n\nReply directly in your MyTutor inbox: http://localhost:3000/messages\n\nBest regards,\nMyTutor Team"
            );

            $createdMessage = $this->db->fetchOne("SELECT * FROM messages WHERE id = :id", ['id' => $msgId]);
            $createdMessage['is_mine'] = true;
            $createdMessage['body'] = htmlspecialchars($createdMessage['body'], ENT_QUOTES, 'UTF-8');

            $this->success('Message sent.', [
                'message' => $createdMessage
            ], 201);
        } catch (Exception $e) {
            $this->error('Failed to send message: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Report a conversation to the admin
     * POST /api/conversations/{id}/report
     */
    public function reportConversation(Request $request, string $conversationId): void
    {
        $user = $request->getAuthUser();
        if (!$user) {
            $this->response->unauthorized();
            return;
        }

        $userId = (int)$user['id'];
        $convId = (int)$conversationId;

        $conversation = $this->db->fetchOne(
            "SELECT * FROM conversations WHERE id = :id",
            ['id' => $convId]
        );

        if (!$conversation) {
            $this->response->notFound('Conversation not found.');
            return;
        }

        if ((int)$conversation['parent_id'] !== $userId && (int)$conversation['teacher_id'] !== $userId) {
            $this->response->forbidden('You can only report conversations you are a member of.');
            return;
        }

        $this->validate($request, [
            'reason' => 'required|min:3|max:150',
        ]);

        $reportedUserId = ($userId === (int)$conversation['parent_id'])
            ? (int)$conversation['teacher_id']
            : (int)$conversation['parent_id'];

        $reason = trim((string)$request->get('reason'));
        $details = $request->get('details') ? trim((string)$request->get('details')) : null;

        try {
            $reportId = $this->db->insert('reports', [
                'conversation_id'  => $convId,
                'reported_by'      => $userId,
                'reported_user_id' => $reportedUserId,
                'reason'           => $reason,
                'details'          => $details,
                'status'           => 'pending',
            ]);

            $this->success('Conversation reported to administration team for safety review.', [
                'report_id' => $reportId
            ], 201);
        } catch (Exception $e) {
            $this->error('Failed to report conversation: ' . $e->getMessage(), 500);
        }
    }
}
