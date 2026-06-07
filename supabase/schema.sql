-- =============================================================================
-- Supabase PostgreSQL Database Schema
-- Arabic Academic Department Management System
-- Migration: Initial schema with seed data
-- =============================================================================

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

CREATE TYPE announcement_priority AS ENUM ('urgent', 'important', 'normal');
CREATE TYPE target_role AS ENUM ('all', 'professors', 'employees', 'students');
CREATE TYPE member_role AS ENUM ('professor', 'employee');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE professor_request_category AS ENUM ('academic', 'administrative', 'technical', 'schedule_change', 'grade_review', 'other');
CREATE TYPE professor_request_target AS ENUM ('department', 'student');
CREATE TYPE professor_request_status AS ENUM ('pending', 'approved', 'rejected', 'in_progress');
CREATE TYPE student_enrollment_status AS ENUM ('active', 'withdrawn', 'incomplete');

-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority announcement_priority DEFAULT 'normal',
  target_role target_role DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role member_role NOT NULL,
  position TEXT NOT NULL,
  avatar TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  permissions TEXT[] DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professor Requests table
CREATE TABLE professor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category professor_request_category NOT NULL,
  target professor_request_target NOT NULL,
  target_student_id TEXT,
  target_student_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority announcement_priority DEFAULT 'normal',
  status professor_request_status DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Student Requests table
CREATE TABLE student_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hours INTEGER NOT NULL DEFAULT 3,
  semester INTEGER NOT NULL DEFAULT 1
);

-- Professor Course Assignments table
CREATE TABLE professor_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
  professor_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  enrolled_count INTEGER DEFAULT 0,
  UNIQUE(course_code, professor_name, semester)
);

-- Enrolled Students table
CREATE TABLE enrolled_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  grade TEXT,
  mid_term_mark INTEGER,
  final_mark INTEGER,
  assignments_mark INTEGER,
  attendance INTEGER DEFAULT 0 CHECK (attendance >= 0 AND attendance <= 100),
  status student_enrollment_status DEFAULT 'active',
  UNIQUE(student_id, course_code, semester)
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_target ON announcements(target_role);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_active ON members(is_active);
CREATE INDEX idx_professor_requests_status ON professor_requests(status);
CREATE INDEX idx_professor_requests_category ON professor_requests(category);
CREATE INDEX idx_professor_requests_created ON professor_requests(created_at DESC);
CREATE INDEX idx_student_requests_status ON student_requests(status);
CREATE INDEX idx_enrolled_students_course ON enrolled_students(course_code);
CREATE INDEX idx_enrolled_students_semester ON enrolled_students(semester);
CREATE INDEX idx_enrolled_students_student ON enrolled_students(student_id);
CREATE INDEX idx_professor_courses_professor ON professor_courses(professor_name);

-- =============================================================================
-- 4. UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professor_requests_updated_at BEFORE UPDATE ON professor_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrolled_students ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can read)
CREATE POLICY "Announcements are publicly readable" ON announcements FOR SELECT USING (true);
CREATE POLICY "Members are publicly readable" ON members FOR SELECT USING (true);
CREATE POLICY "Professor requests are publicly readable" ON professor_requests FOR SELECT USING (true);
CREATE POLICY "Student requests are publicly readable" ON student_requests FOR SELECT USING (true);
CREATE POLICY "Courses are publicly readable" ON courses FOR SELECT USING (true);
CREATE POLICY "Professor courses are publicly readable" ON professor_courses FOR SELECT USING (true);
CREATE POLICY "Enrolled students are publicly readable" ON enrolled_students FOR SELECT USING (true);

-- Service role (anon key with service_role) full access
CREATE POLICY "Service role full access on announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on professor_requests" ON professor_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on student_requests" ON student_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on professor_courses" ON professor_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on enrolled_students" ON enrolled_students FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 6. SEED DATA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Announcements (4 records)
-- -----------------------------------------------------------------------------
INSERT INTO announcements (id, title, content, priority, target_role, created_at) VALUES
  ('22222222-0000-0000-0000-000000000001', 'اجتماع مجلس القسم', 'يُعقد اجتماع مجلس القسم يوم الأحد القادم في الساعة العاشرة صباحاً بقاعة الاجتماعات الرئيسية. يُرجى الحضور في الموعد المحدد.', 'urgent', 'all', '2025-01-15T10:00:00.000Z'),
  ('22222222-0000-0000-0000-000000000002', 'تحديث المناهج الدراسية', 'تم اعتماد التحديثات الجديدة على المناهج الدراسية للفصل الدراسي القادم. يُرجى من جميع أعضاء هيئة التدريس مراجعة التغييرات وإرسال ملاحظاتهم.', 'important', 'professors', '2025-01-14T09:30:00.000Z'),
  ('22222222-0000-0000-0000-000000000003', 'بدء التسجيل للفصل الصيفي', 'يبدأ التسجيل للفصل الصيفي يوم الأحد ٢٠ يناير. على الطلاب الراغبين في التسجيل زيارة مكتب القبول والتسجيل خلال فترة التسجيل المحددة.', 'normal', 'students', '2025-01-13T14:00:00.000Z'),
  ('22222222-0000-0000-0000-000000000004', 'صيانة النظام الإداري', 'سيتم إجراء صيانة دورية للنظام الإداري يوم الجمعة القادم. يُرجى حفظ جميع الأعمال وتسجيل الخروج قبل الساعة الخامسة مساءً.', 'important', 'employees', '2025-01-12T11:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Department Members (8 records)
-- -----------------------------------------------------------------------------
INSERT INTO members (id, name, email, role, position, avatar, is_active, permissions, joined_at) VALUES
  ('33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'ahmed.sharif@univ.edu', 'professor', 'أستاذ مشارك', 'أ', TRUE, ARRAY['manage_announcements', 'manage_courses', 'manage_schedules', 'manage_exams', 'view_reports'], '2018-09-01T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'fatima.hasan@univ.edu', 'professor', 'أستاذ مساعد', 'ف', TRUE, ARRAY['manage_courses', 'manage_exams', 'view_reports'], '2020-01-15T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', 'khaled.omari@univ.edu', 'professor', 'محاضر', 'خ', TRUE, ARRAY['manage_courses', 'manage_schedules', 'view_reports'], '2021-09-01T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000004', 'أ. سارة محمود زايد', 'sara.zayed@univ.edu', 'employee', 'مسؤول شؤون الطلاب', 'س', TRUE, ARRAY['manage_requests', 'export_data', 'view_reports'], '2019-03-10T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000005', 'أ. عمر حسن الدوسري', 'omar.dosari@univ.edu', 'employee', 'مسؤول الشؤون الأكاديمية', 'ع', TRUE, ARRAY['manage_courses', 'manage_schedules', 'export_data', 'view_reports'], '2017-08-20T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000006', 'أ. نورة سعد القحطاني', 'noura.qahtani@univ.edu', 'employee', 'سكرتير القسم', 'ن', TRUE, ARRAY['manage_announcements', 'export_data'], '2022-01-05T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000007', 'د. محمد فيصل الغامدي', 'mohammed.ghamdi@univ.edu', 'professor', 'أستاذ', 'م', FALSE, ARRAY['manage_announcements', 'manage_courses', 'manage_exams', 'manage_users', 'view_reports', 'export_data'], '2015-01-01T00:00:00.000Z'),
  ('33333333-0000-0000-0000-000000000008', 'أ. هند عبدالرحمن السبيعي', 'hind.subaie@univ.edu', 'employee', 'مسؤول الامتحانات', 'هـ', TRUE, ARRAY['manage_exams', 'manage_schedules', 'view_reports'], '2023-06-15T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Professor Requests (5 records)
-- -----------------------------------------------------------------------------
INSERT INTO professor_requests (id, category, target, target_student_id, target_student_name, subject, description, priority, status, response, created_at, updated_at) VALUES
  ('44444444-0000-0000-0000-000000000001', 'academic', 'department', NULL, NULL, 'طلب تحديث المنهج الدراسي', 'أطلب تحديث منهج مقرر هياكل البيانات (CS201) لتشمل مواضيع الأشجار AVL والرسوم البيانية الموجهة بشكل أعمق، مع إضافة مشاريع تطبيقية للطلاب.', 'important', 'in_progress', NULL, '2025-01-12T09:00:00.000Z', '2025-01-14T11:30:00.000Z'),
  ('44444444-0000-0000-0000-000000000002', 'schedule_change', 'department', NULL, NULL, 'طلب تغيير وقت محاضرة', 'أطلب تغيير وقت محاضرة مقدمة في علوم الحاسب (CS101) من يوم الأحد الساعة 8 إلى يوم الثلاثاء الساعة 10 لتعارض مع اجتماع المجلس الأكاديمي.', 'normal', 'pending', NULL, '2025-01-15T08:00:00.000Z', NULL),
  ('44444444-0000-0000-0000-000000000003', 'grade_review', 'student', 'ST-2024-006', 'لمى أحمد الزهراني', 'طلب مراجعة درجات الطالبة', 'أطلب مراجعة درجات الطالبة لمى أحمد الزهراني في مقرر CS101 حيث يبدو أن هناك خطأ في احتساب درجة أعمال السنة. مجموع أعمال السنة المسجلة 20 بينما المفترض 25.', 'important', 'pending', NULL, '2025-01-14T14:00:00.000Z', NULL),
  ('44444444-0000-0000-0000-000000000004', 'technical', 'department', NULL, NULL, 'طلب صيانة أجهزة المعمل', 'الأجهزة في معمل البرمجة (معمل 5) تحتاج صيانة عاجلة. 4 أجهزة من أصل 20 متعطلة وأجهزة أخرى بطيئة جداً مما يؤثر على سير العملي.', 'urgent', 'approved', 'تمت الموافقة على الطلب وإرسال فريق الصيانة.', '2025-01-10T10:00:00.000Z', '2025-01-11T15:00:00.000Z'),
  ('44444444-0000-0000-0000-000000000005', 'administrative', 'student', 'ST-2024-003', 'فهد سعد العتيبي', 'تنبيه بخصوص الغياب المتكرر', 'أرسل تنبيه للطالب فهد سعد العتيبي بشأن غيابه المتكرر عن محاضرات هياكل البيانات (CS201) حيث بلغت نسبة غيابه 25% وأقترب من الحد الأقصى المسموح.', 'normal', 'approved', 'تم إبلاغ الطالب وإرسال إنذار رسمي.', '2025-01-08T12:00:00.000Z', '2025-01-09T09:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Student Requests (empty - no initial data)
-- -----------------------------------------------------------------------------
-- No initial student requests in the in-memory store.

-- -----------------------------------------------------------------------------
-- Courses (13 records - includes all from course catalog + those referenced by professor_courses)
-- Note: Courses from the in-memory store (8 semester-1 courses) plus
--       CS201, CS202, CS205, CS301, CS305 which are referenced by professor_courses
--       and enrolled_students but not present in initialCourses.
-- -----------------------------------------------------------------------------
INSERT INTO courses (id, code, name, hours, semester) VALUES
  -- Original 8 semester-1 courses from initialCourses
  ('55555555-0000-0000-0000-000000000001', 'CS101', 'مقدمة في علوم الحاسب', 3, 1),
  ('55555555-0000-0000-0000-000000000002', 'MATH101', 'رياضيات متقدمة', 4, 1),
  ('55555555-0000-0000-0000-000000000003', 'PHYS101', 'فيزياء عامة', 3, 1),
  ('55555555-0000-0000-0000-000000000004', 'ENG101', 'لغة إنجليزية', 2, 1),
  ('55555555-0000-0000-0000-000000000005', 'IT101', 'مهارات حاسوبية', 2, 1),
  ('55555555-0000-0000-0000-000000000006', 'CS102', 'مبادئ البرمجة', 3, 1),
  ('55555555-0000-0000-0000-000000000007', 'STAT101', 'إحصاء و احتمالات', 3, 1),
  ('55555555-0000-0000-0000-000000000008', 'CRIT101', 'تفكير نقدي', 2, 1),
  -- Additional courses referenced by professor_courses and enrolled_students
  ('55555555-0000-0000-0000-000000000009', 'CS201', 'هياكل البيانات', 3, 2),
  ('55555555-0000-0000-0000-000000000010', 'CS202', 'قواعد البيانات', 3, 2),
  ('55555555-0000-0000-0000-000000000011', 'CS205', 'شبكات الحاسب ١', 3, 2),
  ('55555555-0000-0000-0000-000000000012', 'CS301', 'تحليل الخوارزميات', 3, 3),
  ('55555555-0000-0000-0000-000000000013', 'CS305', 'ذكاء اصطناعي', 3, 3);

-- -----------------------------------------------------------------------------
-- Professor Course Assignments (8 records)
-- -----------------------------------------------------------------------------
INSERT INTO professor_courses (id, course_code, professor_name, semester, enrolled_count) VALUES
  -- Semester 1
  ('66666666-0000-0000-0000-000000000001', 'CS101', 'د. أحمد محمد الشريف', 1, 6),
  ('66666666-0000-0000-0000-000000000002', 'CS102', 'د. أحمد محمد الشريف', 1, 5),
  ('66666666-0000-0000-0000-000000000003', 'MATH101', 'د. فاطمة علي الحسن', 1, 5),
  -- Semester 2
  ('66666666-0000-0000-0000-000000000004', 'CS201', 'د. أحمد محمد الشريف', 2, 4),
  ('66666666-0000-0000-0000-000000000005', 'CS202', 'د. فاطمة علي الحسن', 2, 3),
  ('66666666-0000-0000-0000-000000000006', 'CS205', 'د. خالد عبدالله العمري', 2, 2),
  -- Semester 3
  ('66666666-0000-0000-0000-000000000007', 'CS301', 'د. أحمد محمد الشريف', 3, 3),
  ('66666666-0000-0000-0000-000000000008', 'CS305', 'د. فاطمة علي الحسن', 3, 3);

-- -----------------------------------------------------------------------------
-- Enrolled Students (31 records)
-- -----------------------------------------------------------------------------

-- === Semester 1 ===
-- CS101 - مقدمة في علوم الحاسب (6 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000001', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'CS101', 1, 'أ', 28, 42, 28, 95, 'active'),
  ('77777777-0000-0000-0000-000000000002', 'ST-2024-002', 'نورة عبدالله الحربي', 'CS101', 1, 'أ-', 26, 38, 27, 92, 'active'),
  ('77777777-0000-0000-0000-000000000003', 'ST-2024-003', 'فهد سعد العتيبي', 'CS101', 1, 'ب+', 22, 35, 25, 85, 'active'),
  ('77777777-0000-0000-0000-000000000004', 'ST-2024-004', 'ريم خالد الشمري', 'CS101', 1, 'ب', 20, 33, 24, 78, 'active'),
  ('77777777-0000-0000-0000-000000000005', 'ST-2024-005', 'سلطان فيصل المطيري', 'CS101', 1, 'أ+', 30, 45, 30, 98, 'active'),
  ('77777777-0000-0000-0000-000000000006', 'ST-2024-006', 'لمى أحمد الزهراني', 'CS101', 1, NULL, 18, 25, 20, 60, 'incomplete');

-- CS102 - مبادئ البرمجة (5 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000007', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'CS102', 1, 'ب', 21, 32, 23, 88, 'active'),
  ('77777777-0000-0000-0000-000000000008', 'ST-2024-002', 'نورة عبدالله الحربي', 'CS102', 1, 'أ', 28, 40, 28, 96, 'active'),
  ('77777777-0000-0000-0000-000000000009', 'ST-2024-007', 'ماجد ناصر الدوسري', 'CS102', 1, 'ب+', 23, 34, 25, 82, 'active'),
  ('77777777-0000-0000-0000-000000000010', 'ST-2024-003', 'فهد سعد العتيبي', 'CS102', 1, 'أ-', 27, 37, 26, 90, 'active'),
  ('77777777-0000-0000-0000-000000000011', 'ST-2024-008', 'هند عادل القحطاني', 'CS102', 1, 'ج+', 18, 28, 22, 70, 'active');

-- MATH101 - رياضيات متقدمة (5 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000012', 'ST-2024-004', 'ريم خالد الشمري', 'MATH101', 1, 'ب-', 20, 30, 22, 80, 'active'),
  ('77777777-0000-0000-0000-000000000013', 'ST-2024-005', 'سلطان فيصل المطيري', 'MATH101', 1, 'أ', 29, 42, 29, 97, 'active'),
  ('77777777-0000-0000-0000-000000000014', 'ST-2024-009', 'بدر همام السبيعي', 'MATH101', 1, 'ر', 12, 15, 10, 45, 'active'),
  ('77777777-0000-0000-0000-000000000015', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'MATH101', 1, 'ب+', 23, 35, 25, 86, 'active'),
  ('77777777-0000-0000-0000-000000000016', 'ST-2024-007', 'ماجد ناصر الدوسري', 'MATH101', 1, 'ج', 17, 26, 20, 68, 'active');

-- === Semester 2 ===
-- CS201 - هياكل البيانات (4 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000017', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'CS201', 2, 'أ-', 27, 38, 27, 93, 'active'),
  ('77777777-0000-0000-0000-000000000018', 'ST-2024-002', 'نورة عبدالله الحربي', 'CS201', 2, 'ب+', 23, 34, 25, 87, 'active'),
  ('77777777-0000-0000-0000-000000000019', 'ST-2024-003', 'فهد سعد العتيبي', 'CS201', 2, 'أ', 29, 42, 29, 96, 'active'),
  ('77777777-0000-0000-0000-000000000020', 'ST-2024-010', 'أسماء طارق البقمي', 'CS201', 2, 'ب', 21, 32, 23, 80, 'active');

-- CS202 - قواعد البيانات (3 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000021', 'ST-2024-004', 'ريم خالد الشمري', 'CS202', 2, 'أ+', 30, 45, 30, 99, 'active'),
  ('77777777-0000-0000-0000-000000000022', 'ST-2024-005', 'سلطان فيصل المطيري', 'CS202', 2, 'ب+', 24, 35, 26, 84, 'active'),
  ('77777777-0000-0000-0000-000000000023', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'CS202', 2, 'أ', 28, 41, 28, 94, 'active');

-- CS205 - شبكات الحاسب ١ (2 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000024', 'ST-2024-007', 'ماجد ناصر الدوسري', 'CS205', 2, 'ب', 20, 32, 24, 79, 'active'),
  ('77777777-0000-0000-0000-000000000025', 'ST-2024-010', 'أسماء طارق البقمي', 'CS205', 2, 'أ-', 26, 38, 27, 91, 'active');

-- === Semester 3 ===
-- CS301 - تحليل الخوارزميات (3 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000026', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'CS301', 3, 'أ', 28, 43, 29, 97, 'active'),
  ('77777777-0000-0000-0000-000000000027', 'ST-2024-002', 'نورة عبدالله الحربي', 'CS301', 3, 'ب+', 23, 34, 25, 86, 'active'),
  ('77777777-0000-0000-0000-000000000028', 'ST-2024-003', 'فهد سعد العتيبي', 'CS301', 3, 'أ-', 26, 38, 27, 92, 'active');

-- CS305 - ذكاء اصطناعي (3 students)
INSERT INTO enrolled_students (id, student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  ('77777777-0000-0000-0000-000000000029', 'ST-2024-004', 'ريم خالد الشمري', 'CS305', 3, 'أ+', 30, 45, 30, 100, 'active'),
  ('77777777-0000-0000-0000-000000000030', 'ST-2024-005', 'سلطان فيصل المطيري', 'CS305', 3, 'ب', 21, 33, 23, 81, 'active'),
  ('77777777-0000-0000-0000-000000000031', 'ST-2024-007', 'ماجد ناصر الدوسري', 'CS305', 3, NULL, 10, NULL, 15, 35, 'withdrawn');

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
