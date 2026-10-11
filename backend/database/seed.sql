-- =======================================================================
-- MyTutor Sample Seed Data (Nepal Locations)
-- All accounts use password: Password123!
-- Bcrypt Hash: $2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK
-- =======================================================================

-- -----------------------------------------------------------------------
-- 1. Seed Users (1 Admin, 8 Teachers, 4 Parents)
-- -----------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, phone, role, status, avatar, created_at) VALUES
-- Admin
(1, 'System Administrator', 'admin@mytutor.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9801000001', 'admin', 'active', NULL, NOW() - INTERVAL 30 DAY),

-- Approved Teachers
(2, 'Ramesh Sharma', 'ramesh.sharma@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9841223344', 'teacher', 'active', NULL, NOW() - INTERVAL 25 DAY),
(3, 'Sita Adhikari', 'sita.adhikari@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9851122334', 'teacher', 'active', NULL, NOW() - INTERVAL 20 DAY),
(4, 'Bikash Thapa', 'bikash.thapa@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9812334455', 'teacher', 'active', NULL, NOW() - INTERVAL 18 DAY),
(5, 'Anjali Shrestha', 'anjali.shrestha@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9861445566', 'teacher', 'active', NULL, NOW() - INTERVAL 15 DAY),
(6, 'Pradeep Neupane', 'pradeep.neupane@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9803556677', 'teacher', 'active', NULL, NOW() - INTERVAL 12 DAY),

-- Pending Teachers (for Admin verification testing)
(7, 'Sandeep Karki', 'sandeep.karki@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9849667788', 'teacher', 'pending', NULL, NOW() - INTERVAL 2 DAY),
(8, 'Deepa Gurung', 'deepa.gurung@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9808778899', 'teacher', 'pending', NULL, NOW() - INTERVAL 1 DAY),

-- Rejected Teacher
(9, 'Manoj Gautam', 'manoj.gautam@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9818889900', 'teacher', 'pending', NULL, NOW() - INTERVAL 10 DAY),

-- Parents
(10, 'Sunita Maharjan', 'sunita.maharjan@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9841990011', 'parent', 'active', NULL, NOW() - INTERVAL 22 DAY),
(11, 'Rajesh Khadka', 'rajesh.khadka@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9851001122', 'parent', 'active', NULL, NOW() - INTERVAL 19 DAY),
(12, 'Dipak Pokhrel', 'dipak.pokhrel@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9801112233', 'parent', 'active', NULL, NOW() - INTERVAL 16 DAY),
(13, 'Binita Tamang', 'binita.tamang@example.com', '$2y$10$FVFCNZ..ln9NL.obF57vaOua7ZsDD6aKpWawjMTv/bY6UkPgEuFoK', '+977-9812223344', 'parent', 'active', NULL, NOW() - INTERVAL 14 DAY);

-- -----------------------------------------------------------------------
-- 2. Seed Admin Record
-- -----------------------------------------------------------------------
INSERT INTO admins (id, user_id, admin_role, permissions, last_login_at, created_at) VALUES
(1, 1, 'superadmin', '{"all": true, "manage_teachers": true, "manage_requests": true, "manage_reports": true}', NOW(), NOW() - INTERVAL 30 DAY);

-- -----------------------------------------------------------------------
-- 3. Seed Teacher Profiles
-- -----------------------------------------------------------------------
INSERT INTO teacher_profiles (
    id, user_id, permanent_address, temporary_address, qualification, 
    experience, experience_years, bio, subjects, grade_levels, location_city, 
    hourly_rate, verification_status, rejection_reason, reviewed_by, reviewed_at, created_at
) VALUES
(1, 2, 'Lalitpur-3, Pulchowk', 'Pulchowk, Lalitpur', 'M.Sc. in Mathematics, Tribhuvan University', 
 '7+ years teaching SEE and +2 Mathematics in reputed colleges', 7, 
 'Passionate Mathematics educator committed to conceptual clarity and exam mastery for SEE and +2 students.', 
 'Mathematics, Additional Mathematics, Statistics', 'Grade 9, Grade 10 (SEE), Grade 11-12', 'Lalitpur', 
 750.00, 'approved', NULL, 1, NOW() - INTERVAL 24 DAY, NOW() - INTERVAL 25 DAY),

(2, 3, 'Kathmandu-10, Baneshwor', 'New Baneshwor, Kathmandu', 'M.Sc. in Physics, St. Xavier College', 
 '5 years specialized tuition in Physics and General Science', 5, 
 'Specialized in breaking down complex mechanics, electromagnetism, and modern physics into engaging experiments and easy numerical solving techniques.', 
 'Physics, Science, Basic Mathematics', 'Grade 8, Grade 9, Grade 10 (SEE), +2 Science', 'Kathmandu', 
 800.00, 'approved', NULL, 1, NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 20 DAY),

(3, 4, 'Bhaktapur-5, Suryabinayak', 'Suryabinayak, Bhaktapur', 'M.A. English Literature, TU', 
 '6 years teaching English Language, Grammar, and Social Studies', 6, 
 'Experienced teacher focused on building strong English writing, speaking confidence, and analytical thinking.', 
 'English, Social Studies, Nepali', 'Grade 6, Grade 7, Grade 8, Grade 9, Grade 10 (SEE)', 'Bhaktapur', 
 600.00, 'approved', NULL, 1, NOW() - INTERVAL 17 DAY, NOW() - INTERVAL 18 DAY),

(4, 5, 'Pokhara-6, Lakeside', 'Lakeside, Pokhara', 'B.Sc. Chemistry & Biology, PN Campus', 
 '4 years home tuition and institute teaching', 4, 
 'Patient and dedicated tutor providing hands-on conceptual assistance in Chemistry and Biology for middle and high school students.', 
 'Chemistry, Biology, Science', 'Grade 8, Grade 9, Grade 10 (SEE), Grade 11-12', 'Pokhara', 
 650.00, 'approved', NULL, 1, NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 15 DAY),

(5, 6, 'Kathmandu-7, Kapan', 'Kapan, Kathmandu', 'B.E. Computer Engineering, Pulchowk Campus', 
 '3 years teaching Computer Science and Mathematics', 3, 
 'Engineering graduate passionate about teaching programming, computer concepts, and quantitative mathematics to young minds.', 
 'Computer Science, Mathematics, Coding', 'Grade 7, Grade 8, Grade 9, Grade 10 (SEE), +2 Science', 'Kathmandu', 
 700.00, 'approved', NULL, 1, NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 12 DAY),

(6, 7, 'Lalitpur-14, Imadol', 'Imadol, Lalitpur', 'B.Sc. Physics (Final Year), Patan Multiple Campus', 
 '2 years private home tuition experience', 2, 
 'Energetic science tutor focused on daily revisions, homework guidance, and practice exams.', 
 'Science, Mathematics', 'Grade 6, Grade 7, Grade 8, Grade 9', 'Lalitpur', 
 500.00, 'pending', NULL, NULL, NULL, NOW() - INTERVAL 2 DAY),

(7, 8, 'Pokhara-1, Bagar', 'Bagar, Pokhara', 'B.Ed. Major English, Prithvi Narayan Campus', 
 '1.5 years experience as school assistant teacher', 1, 
 'Engaging tutor dedicated to boosting student confidence in English grammar, comprehension, and school performance.', 
 'English, Social Studies', 'Primary, Grade 6, Grade 7, Grade 8', 'Pokhara', 
 450.00, 'pending', NULL, NULL, NULL, NOW() - INTERVAL 1 DAY),

(8, 9, 'Kathmandu-14, Kalanki', 'Kalanki, Kathmandu', 'B.Com / BBS, Shankar Dev Campus', 
 '2 years tutoring accounting and business math', 2, 
 'Helps students understand accounting equations, balance sheets, and commerce subjects.', 
 'Accountancy, Business Math, Economics', 'Grade 10, Grade 11-12 Commerce', 'Kathmandu', 
 500.00, 'rejected', 'The uploaded citizenship card photo was blurry and illegible. Please re-upload a clear copy.', 1, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 10 DAY);

-- -----------------------------------------------------------------------
-- 4. Seed Teacher Documents
-- -----------------------------------------------------------------------
INSERT INTO teacher_documents (id, teacher_id, document_type, original_name, stored_filename, file_path, file_size, mime_type, created_at) VALUES
(1, 2, 'Citizenship Card', 'ramesh_citizenship.pdf', 'doc_teacher_2_citizenship_a8b9c0d1.pdf', 'documents/doc_teacher_2_citizenship_a8b9c0d1.pdf', 1450230, 'application/pdf', NOW() - INTERVAL 25 DAY),
(2, 3, 'Citizenship Card', 'sita_citizenship.jpg', 'doc_teacher_3_citizenship_b1c2d3e4.jpg', 'documents/doc_teacher_3_citizenship_b1c2d3e4.jpg', 845210, 'image/jpeg', NOW() - INTERVAL 20 DAY),
(3, 4, 'Driving License', 'bikash_license.pdf', 'doc_teacher_4_license_c2d3e4f5.pdf', 'documents/doc_teacher_4_license_c2d3e4f5.pdf', 1230490, 'application/pdf', NOW() - INTERVAL 18 DAY),
(4, 5, 'Passport', 'anjali_passport.jpg', 'doc_teacher_5_passport_d3e4f5a6.jpg', 'documents/doc_teacher_5_passport_d3e4f5a6.jpg', 912400, 'image/jpeg', NOW() - INTERVAL 15 DAY),
(5, 6, 'Citizenship Card', 'pradeep_citizenship.pdf', 'doc_teacher_6_citizenship_e4f5a6b7.pdf', 'documents/doc_teacher_6_citizenship_e4f5a6b7.pdf', 1540320, 'application/pdf', NOW() - INTERVAL 12 DAY),
(6, 7, 'Citizenship Card', 'sandeep_citizenship_scan.pdf', 'doc_teacher_7_citizenship_f5a6b7c8.pdf', 'documents/doc_teacher_7_citizenship_f5a6b7c8.pdf', 1320490, 'application/pdf', NOW() - INTERVAL 2 DAY),
(7, 8, 'Driving License', 'deepa_driving_license.png', 'doc_teacher_8_license_a6b7c8d9.png', 'documents/doc_teacher_8_license_a6b7c8d9.png', 789120, 'image/png', NOW() - INTERVAL 1 DAY),
(8, 9, 'NID Card', 'manoj_nid_blur.jpg', 'doc_teacher_9_nid_b7c8d9e0.jpg', 'documents/doc_teacher_9_nid_b7c8d9e0.jpg', 450120, 'image/jpeg', NOW() - INTERVAL 10 DAY);

-- -----------------------------------------------------------------------
-- 5. Seed Tutor Requests (Job Postings by Parents)
-- -----------------------------------------------------------------------
INSERT INTO tutor_requests (
    id, parent_id, child_name, grade_level, subjects, location_city, location_area, 
    mode, schedule_days, schedule_time, budget_min, budget_max, additional_notes, 
    status, hired_application_id, created_at
) VALUES
(1, 10, 'Aarav Maharjan', 'Grade 10 (SEE)', 'Mathematics, Science', 'Lalitpur', 'Jhamsikhel', 
 'home', 'Sunday to Friday (6 days/week)', '5:30 PM - 7:00 PM', 8000.00, 12000.00, 
 'Looking for an experienced teacher to prepare Aarav for upcoming SEE board exams with high emphasis on solving past papers and concept clearing.', 
 'open', NULL, NOW() - INTERVAL 8 DAY),

(2, 11, 'Kritika Khadka', 'Grade 12 (+2 Science)', 'Physics, Chemistry', 'Kathmandu', 'New Baneshwor', 
 'home', 'Sunday to Thursday (5 days/week)', 'Morning 6:30 AM - 8:00 AM', 10000.00, 15000.00, 
 'Need a specialized teacher for Grade 12 physics numericals and chemistry organic reactions before terminal board exams.', 
 'open', NULL, NOW() - INTERVAL 5 DAY),

(3, 12, 'Prashant Pokhrel', 'Grade 8', 'English, Mathematics', 'Pokhara', 'Lakeside', 
 'online', 'Mon, Wed, Fri (3 days/week)', '4:00 PM - 5:30 PM', 6000.00, 8000.00, 
 'Online classes required via Zoom or Google Meet with digital whiteboard notes.', 
 'in_progress', NULL, NOW() - INTERVAL 12 DAY),

(4, 13, 'Smriti Tamang', 'Grade 7', 'All Subjects', 'Bhaktapur', 'Thimi', 
 'home', 'Sunday to Friday', '5:00 PM - 6:30 PM', 7000.00, 9000.00, 
 'Looking for a disciplined home tutor for daily homework review and foundational guidance.', 
 'closed', NULL, NOW() - INTERVAL 14 DAY);

-- -----------------------------------------------------------------------
-- 6. Seed Applications
-- -----------------------------------------------------------------------
INSERT INTO applications (id, request_id, teacher_id, message, proposed_rate, status, created_at) VALUES
(1, 1, 2, 'Namaste Sunita ji, I have 7+ years of experience helping students achieve GPA 4.0 in SEE Compulsory and Optional Mathematics & Science. I live right in Pulchowk, so reaching Jhamsikhel on time is very convenient.', 10000.00, 'shortlisted', NOW() - INTERVAL 7 DAY),
(2, 1, 3, 'Hello Sunita ji, I hold an M.Sc. in Physics and specialize in secondary level science and math pedagogy. I would love to conduct a demo class for Aarav.', 9500.00, 'applied', NOW() - INTERVAL 6 DAY),
(3, 2, 3, 'Namaste Rajesh ji, I have extensive experience with +2 Science Physics syllabus and can guide Kritika through numericals and conceptual models effectively.', 13000.00, 'shortlisted', NOW() - INTERVAL 4 DAY),
(4, 3, 4, 'Hello Dipak ji, I teach English and Mathematics online using high-res drawing tablets and interactive notes. I would be glad to mentor Prashant.', 7500.00, 'hired', NOW() - INTERVAL 10 DAY);

-- Update tutor_requests hired_application_id for Request 3
UPDATE tutor_requests SET hired_application_id = 4 WHERE id = 3;

-- -----------------------------------------------------------------------
-- 7. Seed Conversations
-- -----------------------------------------------------------------------
INSERT INTO conversations (id, parent_id, teacher_id, request_id, created_at, updated_at) VALUES
(1, 10, 2, 1, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 1 HOUR),
(2, 12, 4, 3, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 3 DAY);

-- -----------------------------------------------------------------------
-- 8. Seed Messages
-- -----------------------------------------------------------------------
INSERT INTO messages (id, conversation_id, sender_id, body, is_read, read_at, created_at) VALUES
-- Conversation 1: Sunita Maharjan (Parent 10) & Ramesh Sharma (Teacher 2)
(1, 1, 10, 'Namaste Ramesh sir, I reviewed your profile and shortlisted your application for Aarav. When can we arrange a demo class?', 1, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 7 DAY),
(2, 1, 2, 'Namaste Sunita ji! Thank you for considering my application. I can come for a 45-minute demo session tomorrow evening at 5:30 PM.', 1, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 6 DAY),
(3, 1, 10, 'Tomorrow at 5:30 PM works perfectly. Our address is Jhamsikhel, near St. Marys School.', 1, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 6 DAY),
(4, 1, 2, 'Noted! I will bring past SEE question booklets and diagnostic worksheets for Aarav.', 1, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(5, 1, 10, 'The demo class went very well. Aarav found your approach very clear.', 1, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
(6, 1, 2, 'I am very glad to hear that! Looking forward to starting regular sessions from this Sunday.', 0, NULL, NOW() - INTERVAL 1 HOUR),

-- Conversation 2: Dipak Pokhrel (Parent 12) & Bikash Thapa (Teacher 4)
(7, 2, 12, 'Hello Bikash sir, we would like to confirm your schedule for the online sessions starting Monday.', 1, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),
(8, 2, 4, 'Hello Dipak ji, Monday 4:00 PM is confirmed. I will send the Zoom meeting link 10 minutes prior to class.', 1, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),
(9, 2, 12, 'Great, thank you sir!', 1, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(10, 2, 4, 'You are welcome! Prashant participated actively during today\'s lesson.', 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY);

-- -----------------------------------------------------------------------
-- 9. Seed Reports
-- -----------------------------------------------------------------------
INSERT INTO reports (id, conversation_id, reported_by, reported_user_id, reason, details, status, created_at) VALUES
(1, 1, 10, 2, 'Spam or Solicitation test', 'This is a test report to verify admin panel safety and moderation features.', 'pending', NOW() - INTERVAL 1 DAY);

-- -----------------------------------------------------------------------
-- 10. Seed Click Logs (Past 7 Days Analytics)
-- -----------------------------------------------------------------------
INSERT INTO click_logs (user_id, ip_address, user_agent, page_path, action_type, target_id, created_at) VALUES
-- Day -6
(10, '202.70.75.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 6 DAY + INTERVAL 2 HOUR),
(10, '202.70.75.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/teachers/2', 'teacher_click', 2, NOW() - INTERVAL 6 DAY + INTERVAL 3 HOUR),
(NULL, '27.34.20.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '/', 'page_view', NULL, NOW() - INTERVAL 6 DAY + INTERVAL 4 HOUR),
(NULL, '27.34.20.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '/requests', 'page_view', NULL, NOW() - INTERVAL 6 DAY + INTERVAL 5 HOUR),

-- Day -5
(11, '103.1.200.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 5 DAY + INTERVAL 1 HOUR),
(11, '103.1.200.45', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', '/teachers/3', 'teacher_click', 3, NOW() - INTERVAL 5 DAY + INTERVAL 2 HOUR),
(NULL, '202.51.74.88', 'Mozilla/5.0 (X11; Linux x86_64)', '/requests', 'page_view', NULL, NOW() - INTERVAL 5 DAY + INTERVAL 3 HOUR),
(NULL, '202.51.74.88', 'Mozilla/5.0 (X11; Linux x86_64)', '/requests/1', 'request_click', 1, NOW() - INTERVAL 5 DAY + INTERVAL 4 HOUR),
(2, '202.70.80.19', 'Mozilla/5.0 (Windows NT 10.0)', '/requests/1', 'apply_click', 1, NOW() - INTERVAL 5 DAY + INTERVAL 6 HOUR),

-- Day -4
(NULL, '110.44.112.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/', 'page_view', NULL, NOW() - INTERVAL 4 DAY + INTERVAL 1 HOUR),
(NULL, '110.44.112.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 4 DAY + INTERVAL 2 HOUR),
(12, '103.24.168.10', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '/requests/create', 'page_view', NULL, NOW() - INTERVAL 4 DAY + INTERVAL 3 HOUR),
(3, '27.34.22.90', 'Mozilla/5.0 (Windows NT 10.0)', '/requests/2', 'apply_click', 2, NOW() - INTERVAL 4 DAY + INTERVAL 4 HOUR),
(NULL, '103.1.200.99', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', '/teachers/4', 'teacher_click', 4, NOW() - INTERVAL 4 DAY + INTERVAL 5 HOUR),

-- Day -3
(NULL, '202.70.75.50', 'Mozilla/5.0 (Windows NT 10.0)', '/', 'page_view', NULL, NOW() - INTERVAL 3 DAY + INTERVAL 1 HOUR),
(NULL, '202.70.75.50', 'Mozilla/5.0 (Windows NT 10.0)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 3 DAY + INTERVAL 2 HOUR),
(NULL, '202.70.75.50', 'Mozilla/5.0 (Windows NT 10.0)', '/teachers/5', 'teacher_click', 5, NOW() - INTERVAL 3 DAY + INTERVAL 3 HOUR),
(10, '202.70.75.12', 'Mozilla/5.0 (Windows NT 10.0)', '/inbox', 'page_view', NULL, NOW() - INTERVAL 3 DAY + INTERVAL 4 HOUR),
(4, '110.44.115.22', 'Mozilla/5.0 (Windows NT 10.0)', '/requests/3', 'apply_click', 3, NOW() - INTERVAL 3 DAY + INTERVAL 5 HOUR),
(NULL, '27.34.25.101', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)', '/requests', 'page_view', NULL, NOW() - INTERVAL 3 DAY + INTERVAL 6 HOUR),

-- Day -2
(NULL, '103.1.200.77', 'Mozilla/5.0 (iPhone)', '/', 'page_view', NULL, NOW() - INTERVAL 2 DAY + INTERVAL 1 HOUR),
(NULL, '103.1.200.77', 'Mozilla/5.0 (iPhone)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR),
(NULL, '103.1.200.77', 'Mozilla/5.0 (iPhone)', '/teachers/2', 'teacher_click', 2, NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR),
(11, '103.1.200.45', 'Mozilla/5.0 (iPhone)', '/requests/2', 'request_click', 2, NOW() - INTERVAL 2 DAY + INTERVAL 4 HOUR),
(7, '202.51.78.14', 'Mozilla/5.0 (Windows NT 10.0)', '/register/teacher', 'page_view', NULL, NOW() - INTERVAL 2 DAY + INTERVAL 5 HOUR),
(NULL, '202.51.78.14', 'Mozilla/5.0 (Windows NT 10.0)', '/requests', 'page_view', NULL, NOW() - INTERVAL 2 DAY + INTERVAL 7 HOUR),

-- Day -1 (Yesterday)
(NULL, '27.34.20.55', 'Mozilla/5.0 (Macintosh)', '/', 'page_view', NULL, NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR),
(NULL, '27.34.20.55', 'Mozilla/5.0 (Macintosh)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR),
(NULL, '27.34.20.55', 'Mozilla/5.0 (Macintosh)', '/teachers/3', 'teacher_click', 3, NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR),
(8, '103.24.168.44', 'Mozilla/5.0 (iPhone)', '/register/teacher', 'page_view', NULL, NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR),
(12, '103.24.168.10', 'Mozilla/5.0 (Macintosh)', '/inbox', 'page_view', NULL, NOW() - INTERVAL 1 DAY + INTERVAL 5 HOUR),
(1, '202.70.75.1', 'Mozilla/5.0 (Windows NT 10.0)', '/admin/dashboard', 'page_view', NULL, NOW() - INTERVAL 1 DAY + INTERVAL 6 HOUR),
(1, '202.70.75.1', 'Mozilla/5.0 (Windows NT 10.0)', '/admin/teachers', 'page_view', NULL, NOW() - INTERVAL 1 DAY + INTERVAL 7 HOUR),

-- Day 0 (Today)
(NULL, '202.70.75.99', 'Mozilla/5.0 (Windows NT 10.0)', '/', 'page_view', NULL, NOW() - INTERVAL 4 HOUR),
(NULL, '202.70.75.99', 'Mozilla/5.0 (Windows NT 10.0)', '/teachers', 'page_view', NULL, NOW() - INTERVAL 3 HOUR),
(NULL, '202.70.75.99', 'Mozilla/5.0 (Windows NT 10.0)', '/teachers/6', 'teacher_click', 6, NOW() - INTERVAL 2 HOUR),
(10, '202.70.75.12', 'Mozilla/5.0 (Windows NT 10.0)', '/inbox', 'page_view', NULL, NOW() - INTERVAL 1 HOUR),
(2, '202.70.80.19', 'Mozilla/5.0 (Windows NT 10.0)', '/inbox', 'page_view', NULL, NOW() - INTERVAL 30 MINUTE),
(1, '202.70.75.1', 'Mozilla/5.0 (Windows NT 10.0)', '/admin/dashboard', 'page_view', NULL, NOW() - INTERVAL 10 MINUTE);
