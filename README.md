# MyTutor - Tuition Marketplace Web Application

MyTutor is a modern, high-performance tuition marketplace platform connecting parents seeking tutors for their children with verified, qualified teachers across Nepal (Kathmandu, Lalitpur, Bhaktapur, Pokhara, and beyond).

---

## 1. System Architecture

The project consists of two decoupled applications:

- **Backend (`/backend`)**: PHP 8+ pure Object-Oriented Architecture (Zero Frameworks).
  - Strict MVC design pattern: Front Controller, Router, Controllers, Models, Repositories/Services, and Middleware.
  - Creational Singleton pattern for Database PDO connection and Configuration Loader.
  - Lightweight Dependency Injection Container (`Container`) for service resolution.
  - RESTful JSON API format with standard HTTP status codes.
  - Secure storage: Verification documents stored completely outside the public web root (`storage/uploads/documents/`).
- **Frontend (`/frontend`)**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS.
  - Responsive, modern UI with rich visual aesthetics, state validation, and role-based views (Parent, Teacher, Admin).
- **Database (`/backend/database`)**: MySQL 8.0+ normalized schema with strict foreign keys, cascading rules, performance indexes, and seed data.

---

## 2. Project Folder Structure

```
MyTutor/
├── backend/
│   ├── config/                     # Configuration definitions
│   │   └── config.php
│   ├── database/                   # Database migrations and seed scripts
│   │   ├── schema.sql              # Complete DDL tables and constraints
│   │   ├── seed.sql                # Seed data with realistic Nepal records
│   │   └── setup_db.php            # Automated migration & seeding runner
│   ├── public/                     # Public web root
│   │   ├── index.php               # Front Controller
│   │   └── .htaccess               # URL rewrite for Apache/Nginx
│   ├── src/                        # PSR-4 Autoloaded source code (App\*)
│   │   ├── Controllers/            # HTTP Request Handlers
│   │   ├── Core/                   # Container, Router, Request, Response, Singleton DB
│   │   ├── Middleware/             # Auth, RoleCheck, Cors, RateLimit
│   │   ├── Models/                 # Database entity representations
│   │   ├── Repositories/           # Data access layer
│   │   └── Services/               # Business logic (Auth, Upload, Mailer, etc.)
│   ├── storage/                    # Private storage (NOT accessible from web)
│   │   ├── logs/                   # System & access logs
│   │   └── uploads/
│   │       ├── documents/          # Private teacher verification documents
│   │       └── avatars/            # User profile avatars
│   ├── .env                        # Local backend environment
│   ├── .env.example                # Example backend environment template
│   └── composer.json               # PSR-4 autoload definition
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router (Layouts & Pages)
│   │   │   ├── (auth)/             # Login & Registration routes
│   │   │   ├── (parent)/           # Parent dashboard & request management
│   │   │   ├── (teacher)/          # Teacher dashboard, profile & opportunities
│   │   │   ├── (admin)/            # Admin panel & moderation views
│   │   │   ├── messages/           # Real-time messaging / Inbox
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Landing page
│   │   ├── components/             # Reusable UI, Chat, Forms, Navbar
│   │   └── lib/                    # API client, Auth Context, Utilities
│   ├── public/                     # Static frontend assets
│   ├── .env.local                  # Local Next.js environment
│   ├── .env.example                # Example frontend environment template
│   ├── package.json                # Frontend dependencies
│   └── tailwind.config.ts          # Tailwind CSS styling tokens
│
└── README.md                       # Complete documentation
```

---

## 3. Database Schema Overview

The database `mytutor_db` comprises 11 normalized tables:

| Table | Description | Key Relationships |
|---|---|---|
| `users` | Base user table for parents, teachers, and admins | Primary entity for all roles |
| `teacher_profiles` | Qualification, experience, Nepal city, verification status | `user_id` -> `users.id` (1:1) |
| `teacher_documents` | Verification documents (Citizenship, License, Passport, etc.) | `teacher_id` -> `users.id` |
| `admins` | Admin roles, permissions, audit timestamps | `user_id` -> `users.id` (1:1) |
| `oauth_accounts` | Google & Facebook OAuth provider linkages | `user_id` -> `users.id` |
| `tutor_requests` | Parent job postings (subject, grade, Nepal city, budget) | `parent_id` -> `users.id` |
| `applications` | Teacher applications to parent tutor requests | `request_id` -> `tutor_requests.id`, `teacher_id` -> `users.id` |
| `conversations` | 1-to-1 chat channels between parent and teacher | `parent_id` & `teacher_id` -> `users.id` |
| `messages` | Chat messages with read receipts | `conversation_id` -> `conversations.id`, `sender_id` -> `users.id` |
| `reports` | Inappropriate conversation reports for admin review | `conversation_id` -> `conversations.id`, `reported_by` & `reported_user_id` -> `users.id` |
| `click_logs` | User interaction and view tracking for 7-day dashboard charts | `user_id` -> `users.id` (nullable) |

---

## 4. Environment Variables

### Backend `.env` (`backend/.env`)
```env
APP_NAME=MyTutor
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mytutor_db
DB_USER=root
DB_PASS=kingnikesh

# JWT & Authentication
JWT_SECRET=mytutor_secure_jwt_secret_token_key_change_in_prod_998877
JWT_ISSUER=mytutor-api
JWT_ACCESS_TTL=86400

# File Upload Settings (5MB = 5242880 bytes)
UPLOAD_MAX_SIZE=5242880
UPLOAD_DIR=storage/uploads

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend `.env.local` (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 5. Setup & Installation Instructions

### Prerequisites
- PHP 8.1+ with `pdo_mysql`, `mbstring`, `fileinfo` extensions
- Composer 2.x
- MySQL 8.0+
- Node.js 18+ and npm

### 1. Database Setup
Run the automated PHP migration and seeder script:
```bash
php backend/database/setup_db.php
```
Or manually run the SQL files:
```bash
mysql -u root -p mytutor_db < backend/database/schema.sql
mysql -u root -p mytutor_db < backend/database/seed.sql
```

### 2. Backend Setup
```bash
cd backend
composer dump-autoload
# Start PHP built-in web server
php -S localhost:8000 -t public
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 6. Seeded Test Accounts

All accounts are pre-seeded with the password: **`Password123!`**

| Role | Email | Status | Notes |
|---|---|---|---|
| **Admin** | `admin@mytutor.com` | Active | Superadmin with full privileges |
| **Teacher (Approved)** | `ramesh.sharma@example.com` | Approved | Lalitpur, SEE/Math specialist, 7 yrs exp |
| **Teacher (Approved)** | `sita.adhikari@example.com` | Approved | Kathmandu, Physics/Science, 5 yrs exp |
| **Teacher (Approved)** | `bikash.thapa@example.com` | Approved | Bhaktapur, English/Social Studies, 6 yrs exp |
| **Teacher (Approved)** | `anjali.shrestha@example.com` | Approved | Pokhara, Chemistry/Biology, 4 yrs exp |
| **Teacher (Pending)** | `sandeep.karki@example.com` | Pending | Lalitpur, Citizenship uploaded for review |
| **Teacher (Pending)** | `deepa.gurung@example.com` | Pending | Pokhara, Driving License uploaded for review |
| **Teacher (Rejected)** | `manoj.gautam@example.com` | Rejected | Kathmandu, Document re-upload requested |
| **Parent** | `sunita.maharjan@example.com` | Active | Lalitpur (Jhamsikhel), Posted SEE Request #1 |
| **Parent** | `rajesh.khadka@example.com` | Active | Kathmandu (Baneshwor), Posted +2 Request #2 |
| **Parent** | `dipak.pokhrel@example.com` | Active | Pokhara (Lakeside), Posted Grade 8 Request #3 |
| **Parent** | `binita.tamang@example.com` | Active | Bhaktapur (Thimi), Posted Request #4 |

---

## 7. API Endpoints Reference

### Public & Authentication Endpoints
- `GET /api/health` - API health check and operational status
- `POST /api/auth/register/teacher` - Teacher registration with multipart document upload
- `POST /api/auth/register/parent` - Parent account registration
- `POST /api/auth/login` - Secure login (Rate-limited: 10 attempts / min)
- `POST /api/auth/social` - Social OAuth sign-in (Google / Facebook mock)
- `POST /api/auth/logout` - Session invalidation
- `GET /api/auth/me` - Authenticated user identity and active profile

### Teachers & Parents
- `GET /api/teachers` - Public approved teacher directory (with search, city, subject, min experience, sort filters)
- `GET /api/teachers/{id}` - Public teacher profile view (Pending profiles gated from public view)
- `GET /api/teacher/profile` - Teacher self profile details
- `PUT /api/teacher/profile` - Update teacher bio, subjects, rate, city, and teaching mode
- `GET /api/parent/profile` - Parent profile view
- `PUT /api/parent/profile` - Parent profile update

### Tutor Requests & Applications
- `GET /api/requests` - Public tutor requests board (with filters by city, subject, grade level)
- `GET /api/requests/{id}` - Single request details with applicant count
- `POST /api/requests` - Parent post new tuition request
- `PUT /api/requests/{id}` - Parent update existing request
- `PATCH /api/requests/{id}/close` - Parent close request
- `DELETE /api/requests/{id}` - Parent delete request
- `GET /api/parent/my-requests` - Parent dashboard listings
- `GET /api/requests/{id}/applicants` - Parent view teacher applicants
- `POST /api/requests/{id}/apply` - Verified teacher applies to tuition request
- `GET /api/teacher/my-applications` - Teacher track application statuses
- `PATCH /api/applications/{id}/status` - Parent shortlist or hire applicant (auto-sets request to `in_progress`)

### Direct Messaging & Moderation
- `GET /api/conversations` - User active inbox threads
- `POST /api/conversations` - Initiate conversation between parent and teacher
- `GET /api/conversations/{id}/messages` - Fetch messages with read receipt updates and polling
- `POST /api/conversations/{id}/messages` - Send message with 30 msg/min rate limiting
- `POST /api/conversations/{id}/report` - Report abusive conversation to admin moderation queue

### Admin Panel (Protected: `role: admin`)
- `GET /api/admin/dashboard` - 5 KPI stats cards, 7-day traffic trend, Nepal city breakdown, newest tutors
- `GET /api/admin/teachers` - Teacher verification queue and directory with document attachments
- `PATCH /api/admin/teachers/{id}/verify` - Approve or reject teacher credentials with feedback notes
- `DELETE /api/admin/teachers/{id}` - Delete teacher profile and associated credentials
- `GET /api/admin/documents/{id}` - Authenticated secure document streaming from outside web root
- `GET /api/admin/parents` - Registered parents directory with OAuth provider tracking
- `GET /api/admin/requests` - Moderate parent tutor requests
- `PATCH /api/admin/requests/{id}/close` - Close inappropriate or expired request
- `DELETE /api/admin/requests/{id}` - Delete request and cascading applications
- `GET /api/admin/reports` - Reported conversations safety queue
- `PATCH /api/admin/reports/{id}/action` - Enact safety verdict: issue warning, suspend user account, or dismiss

---

## 8. Security & Engineering Highlights

1. **Zero PHP Frameworks**: Pure OOP PHP 8.3 implementation with strict types (`declare(strict_types=1);`), custom DI Container with reflection auto-wiring, and pipeline Router.
2. **Creational Singletons**: Thread-safe singletons for PDO database connections and environment configuration loaders.
3. **Prepared Statements Only**: 100% prepared SQL statements via PDO with distinct named parameters ensuring absolute immunity from SQL injection.
4. **Custom HMAC-SHA256 JWT**: Framework-free JSON Web Token implementation with constant-time signature verification (`hash_equals`) and expiration verification.
5. **Private Document Storage**: National ID, citizenship, and academic credential scans are stored completely outside the public web root (`storage/uploads/documents/`). Files are streamed strictly through authenticated Admin controllers.
6. **Rate Limiting Middleware**: In-memory token bucket rate limiting on sensitive endpoints (Login: 10/min, Chat: 30/min).
7. **Type-Safe Full-Stack**: Next.js 16 App Router + React 19 + TypeScript with 100% build pass and zero compilation warnings.

