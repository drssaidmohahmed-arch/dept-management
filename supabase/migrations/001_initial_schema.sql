-- =============================================
-- نظام إدارة القسم الأكاديمي
-- Academic Department Management System
-- Supabase Postgres Database Schema
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ANNOUNCEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('urgent', 'important', 'normal')),
  target_role TEXT NOT NULL DEFAULT 'all'
    CHECK (target_role IN ('all', 'professors', 'employees', 'students')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.announcements IS 'الإعلانات الداخلية للقسم الأكاديمي';
COMMENT ON COLUMN public.announcements.priority IS 'أولوية الإعلان: عاجل، مهم، عادي';
COMMENT ON COLUMN public.announcements.target_role IS 'الفئة المستهدفة: الجميع، أعضاء هيئة التدريس، الموظفون، الطلاب';

CREATE INDEX idx_announcements_created_at ON public.announcements (created_at DESC);
CREATE INDEX idx_announcements_target_role ON public.announcements (target_role);

-- =============================================
-- 2. MEMBERS TABLE (Department Staff)
-- =============================================

CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('professor', 'employee')),
  position TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.members IS 'أعضاء هيئة التدريس والموظفون الإداريون في القسم';
COMMENT ON COLUMN public.members.permissions IS 'قائمة الصلاحيات الممنوحة للعضو';

CREATE UNIQUE INDEX idx_members_email ON public.members (email);
CREATE INDEX idx_members_role ON public.members (role);
CREATE INDEX idx_members_is_active ON public.members (is_active);

-- =============================================
-- 3. STUDENT REQUESTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.student_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.student_requests IS 'طلبات الطلاب المقدمة للقسم';
COMMENT ON COLUMN public.student_requests.status IS 'حالة الطلب: معلق، مقبول، مرفوض';

CREATE INDEX idx_student_requests_status ON public.student_requests (status);
CREATE INDEX idx_student_requests_created_at ON public.student_requests (created_at DESC);

-- =============================================
-- 4. COURSES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  hours INTEGER NOT NULL DEFAULT 3,
  semester INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE public.courses IS 'المقررات الدراسية المتاحة في القسم';

CREATE UNIQUE INDEX idx_courses_code ON public.courses (code);
CREATE INDEX idx_courses_semester ON public.courses (semester);

-- =============================================
-- 5. PROFESSOR COURSES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.professor_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_code TEXT NOT NULL REFERENCES public.courses(code) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  hours INTEGER NOT NULL DEFAULT 3,
  professor_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  enrolled_count INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.professor_courses IS 'المقررات التي يدرسها أعضاء هيئة التدريس مع معلومات التسجيل';

CREATE INDEX idx_professor_courses_semester ON public.professor_courses (semester);
CREATE INDEX idx_professor_courses_professor ON public.professor_courses (professor_name);

-- =============================================
-- 6. ENROLLED STUDENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.enrolled_students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  course_code TEXT NOT NULL REFERENCES public.courses(code) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  grade TEXT,
  mid_term_mark INTEGER,
  final_mark INTEGER,
  assignments_mark INTEGER,
  attendance INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'withdrawn', 'incomplete'))
);

COMMENT ON TABLE public.enrolled_students IS 'تسجيل الطلاب في المقررات مع الدرجات';
COMMENT ON COLUMN public.enrolled_students.student_id IS 'الرقم الجامعي للطالب';
COMMENT ON COLUMN public.enrolled_students.student_name IS 'اسم الطالب الكامل';
COMMENT ON COLUMN public.enrolled_students.grade IS 'التقدير النهائي';
COMMENT ON COLUMN public.enrolled_students.attendance IS 'نسبة الحضور (0-100)';
COMMENT ON COLUMN public.enrolled_students.status IS 'حالة التسجيل: نشط، منسحب، غير مكتمل';

CREATE INDEX idx_enrolled_students_course ON public.enrolled_students (course_code, semester);
CREATE INDEX idx_enrolled_students_student ON public.enrolled_students (student_id);
CREATE INDEX idx_enrolled_students_semester ON public.enrolled_students (semester);

-- =============================================
-- 7. PROFESSOR REQUESTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.professor_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('academic', 'administrative', 'technical', 'schedule_change', 'grade_review', 'other')),
  target TEXT NOT NULL CHECK (target IN ('department', 'student')),
  target_student_id TEXT,
  target_student_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('urgent', 'important', 'normal')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ
);

COMMENT ON TABLE public.professor_requests IS 'طلبات أعضاء هيئة التدريس المقدمة لرئيس القسم';
COMMENT ON COLUMN public.professor_requests.category IS 'تصنيف الطلب';
COMMENT ON COLUMN public.professor_requests.target IS 'جهة الطلب: القسم أو طالب محدد';
COMMENT ON COLUMN public.professor_requests.status IS 'حالة الطلب';

CREATE INDEX idx_professor_requests_status ON public.professor_requests (status);
CREATE INDEX idx_professor_requests_category ON public.professor_requests (category);
CREATE INDEX idx_professor_requests_created_at ON public.professor_requests (created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrolled_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (anon key) for all tables
-- In production, replace with authenticated user policies

CREATE POLICY "Announcements can be read by anyone" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "Announcements can be inserted by anyone" ON public.announcements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Announcements can be deleted by anyone" ON public.announcements
  FOR DELETE USING (true);

CREATE POLICY "Members can be read by anyone" ON public.members
  FOR SELECT USING (true);

CREATE POLICY "Members can be inserted by anyone" ON public.members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Members can be updated by anyone" ON public.members
  FOR UPDATE USING (true);

CREATE POLICY "Members can be deleted by anyone" ON public.members
  FOR DELETE USING (true);

CREATE POLICY "Student requests can be read by anyone" ON public.student_requests
  FOR SELECT USING (true);

CREATE POLICY "Student requests can be inserted by anyone" ON public.student_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Student requests can be deleted by anyone" ON public.student_requests
  FOR DELETE USING (true);

CREATE POLICY "Courses can be read by anyone" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Courses can be inserted by anyone" ON public.courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Professor courses can be read by anyone" ON public.professor_courses
  FOR SELECT USING (true);

CREATE POLICY "Professor courses can be inserted by anyone" ON public.professor_courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Professor courses can be updated by anyone" ON public.professor_courses
  FOR UPDATE USING (true);

CREATE POLICY "Enrolled students can be read by anyone" ON public.enrolled_students
  FOR SELECT USING (true);

CREATE POLICY "Enrolled students can be inserted by anyone" ON public.enrolled_students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enrolled students can be updated by anyone" ON public.enrolled_students
  FOR UPDATE USING (true);

CREATE POLICY "Professor requests can be read by anyone" ON public.professor_requests
  FOR SELECT USING (true);

CREATE POLICY "Professor requests can be inserted by anyone" ON public.professor_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Professor requests can be updated by anyone" ON public.professor_requests
  FOR UPDATE USING (true);

CREATE POLICY "Professor requests can be deleted by anyone" ON public.professor_requests
  FOR DELETE USING (true);

-- =============================================
-- SEED DATA
-- =============================================

-- --- Courses ---
INSERT INTO public.courses (code, name, hours, semester) VALUES
  ('CS101', 'مقدمة في علوم الحاسب', 3, 1),
  ('MATH101', 'رياضيات متقدمة', 4, 1),
  ('PHYS101', 'فيزياء عامة', 3, 1),
  ('ENG101', 'لغة إنجليزية', 2, 1),
  ('IT101', 'مهارات حاسوبية', 2, 1),
  ('CS102', 'مبادئ البرمجة', 3, 1),
  ('STAT101', 'إحصاء و احتمالات', 3, 1),
  ('CRIT101', 'تفكير نقدي', 2, 1),
  ('CS201', 'هياكل البيانات', 3, 2),
  ('CS202', 'قواعد البيانات', 3, 2),
  ('CS205', 'شبكات الحاسب ١', 3, 2),
  ('CS301', 'تحليل الخوارزميات', 3, 3),
  ('CS305', 'ذكاء اصطناعي', 3, 3)
ON CONFLICT (code) DO NOTHING;

-- --- Announcements ---
INSERT INTO public.announcements (id, title, content, priority, target_role, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'اجتماع مجلس القسم',
   'يُعقد اجتماع مجلس القسم يوم الأحد القادم في الساعة العاشرة صباحاً بقاعة الاجتماعات الرئيسية. يُرجى الحضور في الموعد المحدد.',
   'urgent', 'all', '2025-01-15T10:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000002',
   'تحديث المناهج الدراسية',
   'تم اعتماد التحديثات الجديدة على المناهج الدراسية للفصل الدراسي القادم. يُرجى من جميع أعضاء هيئة التدريس مراجعة التغييرات وإرسال ملاحظاتهم.',
   'important', 'professors', '2025-01-14T09:30:00.000Z'),
  ('00000000-0000-0000-0000-000000000003',
   'بدء التسجيل للفصل الصيفي',
   'يبدأ التسجيل للفصل الصيفي يوم الأحد ٢٠ يناير. على الطلاب الراغبين في التسجيل زيارة مكتب القبول والتسجيل خلال فترة التسجيل المحددة.',
   'normal', 'students', '2025-01-13T14:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000004',
   'صيانة النظام الإداري',
   'سيتم إجراء صيانة دورية للنظام الإداري يوم الجمعة القادم. يُرجى حفظ جميع الأعمال وتسجيل الخروج قبل الساعة الخامسة مساءً.',
   'important', 'employees', '2025-01-12T11:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- --- Members ---
INSERT INTO public.members (id, name, email, role, position, avatar, is_active, permissions, joined_at) VALUES
  ('00000000-0000-0000-0000-000000000010',
   'د. أحمد محمد الشريف', 'ahmed.sharif@univ.edu', 'professor',
   'أستاذ مشارك', 'أ', true,
   ARRAY['manage_announcements', 'manage_courses', 'manage_schedules', 'manage_exams', 'view_reports'],
   '2018-09-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000011',
   'د. فاطمة علي الحسن', 'fatima.hasan@univ.edu', 'professor',
   'أستاذ مساعد', 'ف', true,
   ARRAY['manage_courses', 'manage_exams', 'view_reports'],
   '2020-01-15T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000012',
   'د. خالد عبدالله العمري', 'khaled.omari@univ.edu', 'professor',
   'محاضر', 'خ', true,
   ARRAY['manage_courses', 'manage_schedules', 'view_reports'],
   '2021-09-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000013',
   'أ. سارة محمود زايد', 'sara.zayed@univ.edu', 'employee',
   'مسؤول شؤون الطلاب', 'س', true,
   ARRAY['manage_requests', 'export_data', 'view_reports'],
   '2019-03-10T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000014',
   'أ. عمر حسن الدوسري', 'omar.dosari@univ.edu', 'employee',
   'مسؤول الشؤون الأكاديمية', 'ع', true,
   ARRAY['manage_courses', 'manage_schedules', 'export_data', 'view_reports'],
   '2017-08-20T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000015',
   'أ. نورة سعد القحطاني', 'noura.qahtani@univ.edu', 'employee',
   'سكرتير القسم', 'ن', true,
   ARRAY['manage_announcements', 'export_data'],
   '2022-01-05T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000016',
   'د. محمد فيصل الغامدي', 'mohammed.ghamdi@univ.edu', 'professor',
   'أستاذ', 'م', false,
   ARRAY['manage_announcements', 'manage_courses', 'manage_exams', 'manage_users', 'view_reports', 'export_data'],
   '2015-01-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000017',
   'أ. هند عبدالرحمن السبيعي', 'hind.subaie@univ.edu', 'employee',
   'مسؤول الامتحانات', 'هـ', true,
   ARRAY['manage_exams', 'manage_schedules', 'view_reports'],
   '2023-06-15T00:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- --- Professor Courses ---
INSERT INTO public.professor_courses (course_code, name, hours, professor_name, semester, enrolled_count) VALUES
  ('CS101', 'مقدمة في علوم الحاسب', 3, 'د. أحمد محمد الشريف', 1, 6),
  ('CS102', 'مبادئ البرمجة', 3, 'د. أحمد محمد الشريف', 1, 5),
  ('MATH101', 'رياضيات متقدمة', 4, 'د. فاطمة علي الحسن', 1, 5),
  ('CS201', 'هياكل البيانات', 3, 'د. أحمد محمد الشريف', 2, 4),
  ('CS202', 'قواعد البيانات', 3, 'د. فاطمة علي الحسن', 2, 3),
  ('CS205', 'شبكات الحاسب ١', 3, 'د. خالد عبدالله العمري', 2, 2),
  ('CS301', 'تحليل الخوارزميات', 3, 'د. أحمد محمد الشريف', 3, 3),
  ('CS305', 'ذكاء اصطناعي', 3, 'د. فاطمة علي الحسن', 3, 3);

-- --- Enrolled Students ---
INSERT INTO public.enrolled_students (student_id, student_name, course_code, semester, grade, mid_term_mark, final_mark, assignments_mark, attendance, status) VALUES
  -- Semester 1: CS101
  ('ST-2024-001', 'عبدالرحمن محمد السالم', 'CS101', 1, 'أ', 28, 42, 28, 95, 'active'),
  ('ST-2024-002', 'نورة عبدالله الحربي', 'CS101', 1, 'أ-', 26, 38, 27, 92, 'active'),
  ('ST-2024-003', 'فهد سعد العتيبي', 'CS101', 1, 'ب+', 22, 35, 25, 85, 'active'),
  ('ST-2024-004', 'ريم خالد الشمري', 'CS101', 1, 'ب', 20, 33, 24, 78, 'active'),
  ('ST-2024-005', 'سلطان فيصل المطيري', 'CS101', 1, 'أ+', 30, 45, 30, 98, 'active'),
  ('ST-2024-006', 'لمى أحمد الزهراني', 'CS101', 1, NULL, 18, 25, 20, 60, 'incomplete'),
  -- Semester 1: CS102
  ('ST-2024-001', 'عبدالرحمن محمد السالم', 'CS102', 1, 'ب', 21, 32, 23, 88, 'active'),
  ('ST-2024-002', 'نورة عبدالله الحربي', 'CS102', 1, 'أ', 28, 40, 28, 96, 'active'),
  ('ST-2024-007', 'ماجد ناصر الدوسري', 'CS102', 1, 'ب+', 23, 34, 25, 82, 'active'),
  ('ST-2024-003', 'فهد سعد العتيبي', 'CS102', 1, 'أ-', 27, 37, 26, 90, 'active'),
  ('ST-2024-008', 'هند عادل القحطاني', 'CS102', 1, 'ج+', 18, 28, 22, 70, 'active'),
  -- Semester 1: MATH101
  ('ST-2024-004', 'ريم خالد الشمري', 'MATH101', 1, 'ب-', 20, 30, 22, 80, 'active'),
  ('ST-2024-005', 'سلطان فيصل المطيري', 'MATH101', 1, 'أ', 29, 42, 29, 97, 'active'),
  ('ST-2024-009', 'بدر همام السبيعي', 'MATH101', 1, 'ر', 12, 15, 10, 45, 'active'),
  ('ST-2024-001', 'عبدالرحمن محمد السالم', 'MATH101', 1, 'ب+', 23, 35, 25, 86, 'active'),
  ('ST-2024-007', 'ماجد ناصر الدوسري', 'MATH101', 1, 'ج', 17, 26, 20, 68, 'active'),
  -- Semester 2: CS201
  ('ST-2024-001', 'عبدالرحمن محمد السالم', 'CS201', 2, 'أ-', 27, 38, 27, 93, 'active'),
  ('ST-2024-002', 'نورة عبدالله الحربي', 'CS201', 2, 'ب+', 23, 34, 25, 87, 'active'),
  ('ST-2024-003', 'فهد سعد العتيبي', 'CS201', 2, 'أ', 29, 42, 29, 96, 'active'),
  ('ST-2024-010', 'أسماء طارق البقمي', 'CS201', 2, 'ب', 21, 32, 23, 80, 'active'),
  -- Semester 2: CS202
  ('ST-2024-004', 'ريم خالد الشمري', 'CS202', 2, 'أ+', 30, 45, 30, 99, 'active'),
  ('ST-2024-005', 'سلطان فيصل المطيري', 'CS202', 2, 'ب+', 24, 35, 26, 84, 'active'),
  ('ST-2024-001', 'عبدالرحمن محمد السالم', 'CS202', 2, 'أ', 28, 41, 28, 94, 'active'),
  -- Semester 2: CS205
  ('ST-2024-007', 'ماجد ناصر الدوسري', 'CS205', 2, 'ب', 20, 32, 24, 79, 'active'),
  ('ST-2024-010', 'أسماء طارق البقمي', 'CS205', 2, 'أ-', 26, 38, 27, 91, 'active'),
  -- Semester 3: CS301
  ('ST-2024-001', 'عبدالرحمن محمد السالم', 'CS301', 3, 'أ', 28, 43, 29, 97, 'active'),
  ('ST-2024-002', 'نورة عبدالله الحربي', 'CS301', 3, 'ب+', 23, 34, 25, 86, 'active'),
  ('ST-2024-003', 'فهد سعد العتيبي', 'CS301', 3, 'أ-', 26, 38, 27, 92, 'active'),
  -- Semester 3: CS305
  ('ST-2024-004', 'ريم خالد الشمري', 'CS305', 3, 'أ+', 30, 45, 30, 100, 'active'),
  ('ST-2024-005', 'سلطان فيصل المطيري', 'CS305', 3, 'ب', 21, 33, 23, 81, 'active'),
  ('ST-2024-007', 'ماجد ناصر الدوسري', 'CS305', 3, NULL, 10, NULL, 15, 35, 'withdrawn');

-- --- Professor Requests ---
INSERT INTO public.professor_requests (id, category, target, target_student_id, target_student_name, subject, description, priority, status, response, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000020',
   'academic', 'department', NULL, NULL,
   'طلب تحديث المنهج الدراسي',
   'أطلب تحديث منهج مقرر هياكل البيانات (CS201) لتشمل مواضيع الأشجار AVL والرسوم البيانية الموجهة بشكل أعمق، مع إضافة مشاريع تطبيقية للطلاب.',
   'important', 'in_progress', NULL,
   '2025-01-12T09:00:00.000Z', '2025-01-14T11:30:00.000Z'),
  ('00000000-0000-0000-0000-000000000021',
   'schedule_change', 'department', NULL, NULL,
   'طلب تغيير وقت محاضرة',
   'أطلب تغيير وقت محاضرة مقدمة في علوم الحاسب (CS101) من يوم الأحد الساعة 8 إلى يوم الثلاثاء الساعة 10 لتعارض مع اجتماع المجلس الأكاديمي.',
   'normal', 'pending', NULL,
   '2025-01-15T08:00:00.000Z', NULL),
  ('00000000-0000-0000-0000-000000000022',
   'grade_review', 'student', 'ST-2024-006', 'لمى أحمد الزهراني',
   'طلب مراجعة درجات الطالبة',
   'أطلب مراجعة درجات الطالبة لمى أحمد الزهراني في مقرر CS101 حيث يبدو أن هناك خطأ في احتساب درجة أعمال السنة. مجموع أعمال السنة المسجلة 20 بينما المفترض 25.',
   'important', 'pending', NULL,
   '2025-01-14T14:00:00.000Z', NULL),
  ('00000000-0000-0000-0000-000000000023',
   'technical', 'department', NULL, NULL,
   'طلب صيانة أجهزة المعمل',
   'الأجهزة في معمل البرمجة (معمل 5) تحتاج صيانة عاجلة. 4 أجهزة من أصل 20 متعطلة وأجهزة أخرى بطيئة جداً مما يؤثر على سير العملي.',
   'urgent', 'approved', 'تمت الموافقة على الطلب وإرسال فريق الصيانة.',
   '2025-01-10T10:00:00.000Z', '2025-01-11T15:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000024',
   'administrative', 'student', 'ST-2024-003', 'فهد سعد العتيبي',
   'تنبيه بخصوص الغياب المتكرر',
   'أرسل تنبيه للطالب فهد سعد العتيبي بشأن غيابه المتكرر عن محاضرات هياكل البيانات (CS201) حيث بلغت نسبة غيابه 25% وأقترب من الحد الأقصى المسموح.',
   'normal', 'approved', 'تم إبلاغ الطالب وإرسال إنذار رسمي.',
   '2025-01-08T12:00:00.000Z', '2025-01-09T09:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Enable Realtime for all tables
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.professor_courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrolled_students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.professor_requests;
