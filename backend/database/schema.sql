-- =======================================================================
-- MyTutor Database Schema
-- Database: mytutor_db
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- =======================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS click_logs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS tutor_requests;
DROP TABLE IF EXISTS oauth_accounts;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS teacher_documents;
DROP TABLE IF EXISTS teacher_profiles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------
-- 1. users
-- Stores parents, teachers, and admins.
-- Passwords are hashed with BCRYPT (password_hash).
-- -----------------------------------------------------------------------
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL COMMENT 'Nullable for OAuth only accounts',
    phone VARCHAR(30) NULL,
    role ENUM('parent', 'teacher', 'admin') NOT NULL DEFAULT 'parent',
    status ENUM('active', 'pending', 'suspended') NOT NULL DEFAULT 'active' COMMENT 'Teachers start as pending until verified',
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 2. teacher_profiles
-- Detailed profile for teachers, verification status, qualifications,
-- subjects, and Nepal locations.
-- -----------------------------------------------------------------------
CREATE TABLE teacher_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    permanent_address VARCHAR(255) NOT NULL,
    temporary_address VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience VARCHAR(255) NOT NULL,
    experience_years INT UNSIGNED NOT NULL DEFAULT 1,
    bio TEXT NULL,
    subjects VARCHAR(255) NOT NULL COMMENT 'Comma-separated or JSON list of subjects taught',
    grade_levels VARCHAR(255) NOT NULL COMMENT 'Comma-separated grades (e.g. Primary, Secondary/SEE, +2)',
    location_city VARCHAR(100) NOT NULL DEFAULT 'Kathmandu' COMMENT 'Kathmandu, Lalitpur, Bhaktapur, Pokhara, etc.',
    hourly_rate DECIMAL(10,2) NULL,
    verification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    rejection_reason TEXT NULL,
    reviewed_by INT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_profiles_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_tp_verification_status (verification_status),
    INDEX idx_tp_location_city (location_city),
    INDEX idx_tp_experience_years (experience_years)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 3. teacher_documents
-- Verification document uploaded by teacher during registration.
-- Stored outside public web root and served exclusively via auth endpoint.
-- -----------------------------------------------------------------------
CREATE TABLE teacher_documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT UNSIGNED NOT NULL,
    document_type ENUM(
        'Driving License',
        'Citizenship Card',
        'Voter ID Card',
        'NID Card',
        'Passport'
    ) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL COMMENT 'Relative path inside backend/storage/uploads/documents',
    file_size INT UNSIGNED NOT NULL COMMENT 'Size in bytes',
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_documents_teacher FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_td_teacher_id (teacher_id),
    INDEX idx_td_document_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 4. admins
-- Admin metadata, privileges, and audit fields.
-- -----------------------------------------------------------------------
CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    admin_role ENUM('superadmin', 'manager', 'support') NOT NULL DEFAULT 'superadmin',
    permissions JSON NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 5. oauth_accounts
-- Google / Facebook social sign-in mapping.
-- -----------------------------------------------------------------------
CREATE TABLE oauth_accounts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    provider ENUM('google', 'facebook') NOT NULL,
    provider_user_id VARCHAR(191) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY uq_oauth_provider_user (provider, provider_user_id),
    INDEX idx_oauth_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 6. tutor_requests
-- Job postings created by parents seeking tutors for their children.
-- -----------------------------------------------------------------------
CREATE TABLE tutor_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED NOT NULL,
    child_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL COMMENT 'e.g. Grade 10 (SEE), Grade 8, +2 Science',
    subjects VARCHAR(255) NOT NULL COMMENT 'e.g. Mathematics, Science',
    location_city VARCHAR(100) NOT NULL COMMENT 'Kathmandu, Lalitpur, Bhaktapur, Pokhara, etc.',
    location_area VARCHAR(150) NOT NULL COMMENT 'e.g. Jhamsikhel, Baneshwor, Suryabinayak',
    mode ENUM('home', 'online', 'both') NOT NULL DEFAULT 'home',
    schedule_days VARCHAR(100) NOT NULL COMMENT 'e.g. Sun-Fri (6 days/week)',
    schedule_time VARCHAR(100) NOT NULL COMMENT 'e.g. 5:00 PM - 6:30 PM',
    budget_min DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    budget_max DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    additional_notes TEXT NULL,
    status ENUM('open', 'in_progress', 'closed') NOT NULL DEFAULT 'open',
    hired_application_id INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tutor_requests_parent FOREIGN KEY (parent_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_tr_parent_id (parent_id),
    INDEX idx_tr_status (status),
    INDEX idx_tr_location_city (location_city),
    INDEX idx_tr_grade_level (grade_level),
    INDEX idx_tr_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 7. applications
-- Teacher applications submitted to open parent tutor requests.
-- -----------------------------------------------------------------------
CREATE TABLE applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNSIGNED NOT NULL,
    teacher_id INT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    proposed_rate DECIMAL(10,2) NULL,
    status ENUM('applied', 'shortlisted', 'rejected', 'hired') NOT NULL DEFAULT 'applied',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_request FOREIGN KEY (request_id) REFERENCES tutor_requests (id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_teacher FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY uq_request_teacher (request_id, teacher_id),
    INDEX idx_app_request_id (request_id),
    INDEX idx_app_teacher_id (teacher_id),
    INDEX idx_app_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add optional FK constraint from tutor_requests to hired_application_id
ALTER TABLE tutor_requests
    ADD CONSTRAINT fk_tutor_requests_hired_app 
    FOREIGN KEY (hired_application_id) REFERENCES applications (id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------
-- 8. conversations
-- One-to-one messaging channel between a parent and a teacher.
-- -----------------------------------------------------------------------
CREATE TABLE conversations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED NOT NULL,
    teacher_id INT UNSIGNED NOT NULL,
    request_id INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_parent FOREIGN KEY (parent_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_teacher FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_request FOREIGN KEY (request_id) REFERENCES tutor_requests (id) ON DELETE SET NULL,
    INDEX idx_conv_parent_id (parent_id),
    INDEX idx_conv_teacher_id (teacher_id),
    INDEX idx_conv_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 9. messages
-- Real-time chat messages inside conversations.
-- -----------------------------------------------------------------------
CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT UNSIGNED NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    body TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_msg_conversation_id (conversation_id),
    INDEX idx_msg_sender_id (sender_id),
    INDEX idx_msg_is_read (is_read),
    INDEX idx_msg_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 10. reports
-- Reported conversations for admin moderation and safety.
-- -----------------------------------------------------------------------
CREATE TABLE reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT UNSIGNED NULL,
    reported_by INT UNSIGNED NOT NULL,
    reported_user_id INT UNSIGNED NOT NULL,
    reason VARCHAR(150) NOT NULL,
    details TEXT NULL,
    status ENUM('pending', 'reviewed', 'action_taken', 'dismissed') NOT NULL DEFAULT 'pending',
    admin_notes TEXT NULL,
    action_taken VARCHAR(100) NULL COMMENT 'warned, suspended, dismissed, etc.',
    reviewed_by INT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_target FOREIGN KEY (reported_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_rep_status (status),
    INDEX idx_rep_reported_by (reported_by),
    INDEX idx_rep_reported_user (reported_user_id),
    INDEX idx_rep_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------
-- 11. click_logs
-- Tracks clicks and page views for 7-day analytics in Admin dashboard.
-- -----------------------------------------------------------------------
CREATE TABLE click_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255) NULL,
    page_path VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'page_view' COMMENT 'page_view, teacher_click, request_click, apply_click, search',
    target_id INT UNSIGNED NULL COMMENT 'ID of clicked teacher or request',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_click_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_cl_created_at (created_at),
    INDEX idx_cl_action_type (action_type),
    INDEX idx_cl_user_id (user_id),
    INDEX idx_cl_page_path (page_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
