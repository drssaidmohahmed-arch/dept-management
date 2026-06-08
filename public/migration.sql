-- =============================================================================
-- Supabase PostgreSQL Database Schema
-- Arabic Academic Department Management System
-- Migration 002: New modules - Students, Faculty, Rooms, Teaching, Evaluations,
--   Professional Development, Advising, Field Training, Graduation Projects,
--   Study Plans, Course Descriptions, Course Sections, Room Bookings
-- =============================================================================

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

CREATE TYPE student_status AS ENUM ('active', 'probation', 'withdrawn', 'graduated', 'suspended');
CREATE TYPE academic_rank AS ENUM ('professor', 'associate_professor', 'assistant_professor', 'lecturer', 'teaching_assistant');
CREATE TYPE room_type AS ENUM ('lecture_hall', 'lab', 'meeting_room', 'office', 'tutorial');
CREATE TYPE session_type AS ENUM ('lecture', 'lab', 'tutorial');
CREATE TYPE day_of_week AS ENUM ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday');
CREATE TYPE evaluation_type AS ENUM ('student_feedback', 'peer_review', 'self_assessment', 'chairman_review');
CREATE TYPE dev_activity_type AS ENUM ('conference', 'workshop', 'training_course', 'seminar', 'certification');
CREATE TYPE dev_status AS ENUM ('planned', 'completed', 'cancelled');
CREATE TYPE advising_type AS ENUM ('academic_plan', 'academic_warning', 'course_guidance', 'career_advice', 'general');
CREATE TYPE training_status AS ENUM ('planned', 'in_progress', 'completed', 'failed');
CREATE TYPE project_type AS ENUM ('research', 'software', 'system', 'theoretical');
CREATE TYPE project_status AS ENUM ('proposed', 'approved', 'in_progress', 'submitted', 'defended', 'passed', 'failed');
CREATE TYPE plan_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE course_type AS ENUM ('required', 'elective', 'university_requirement', 'college_requirement');
CREATE TYPE description_status AS ENUM ('draft', 'approved', 'archived');
CREATE TYPE section_status AS ENUM ('open', 'closed', 'full');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- A. Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  major TEXT NOT NULL DEFAULT 'علوم الحاسب',
  gpa NUMERIC(3,2) DEFAULT 0.00,
  cumulative_hours INTEGER DEFAULT 0,
  status student_status DEFAULT 'active',
  advisor_name TEXT,
  enrollment_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- B. Faculty Profiles table (extended academic profiles linked to members)
CREATE TABLE faculty_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  specialization TEXT,
  rank academic_rank DEFAULT 'lecturer',
  qualification TEXT,
  granting_university TEXT,
  bio TEXT DEFAULT '',
  research_interests TEXT[] DEFAULT '{}',
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- C. Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  building TEXT NOT NULL DEFAULT 'المبنى الرئيسي',
  floor INTEGER DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 30,
  type room_type DEFAULT 'lecture_hall',
  equipment TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- D. Teaching Assignments table
CREATE TABLE teaching_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES members(id) ON DELETE CASCADE,
  professor_name TEXT NOT NULL,
  course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  section INTEGER DEFAULT 1,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  room_name TEXT DEFAULT '',
  day day_of_week NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  session_type session_type DEFAULT 'lecture',
  academic_year TEXT NOT NULL DEFAULT '1446هـ',
  semester INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- E. Performance Evaluations table
CREATE TABLE performance_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES members(id) ON DELETE CASCADE,
  faculty_name TEXT NOT NULL,
  evaluation_type evaluation_type NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '1446هـ',
  semester INTEGER NOT NULL DEFAULT 1,
  teaching_score NUMERIC(3,2) DEFAULT 0,
  research_score NUMERIC(3,2) DEFAULT 0,
  service_score NUMERIC(3,2) DEFAULT 0,
  overall_score NUMERIC(3,2) DEFAULT 0,
  comments TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- F. Professional Development table
CREATE TABLE professional_development (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES members(id) ON DELETE CASCADE,
  faculty_name TEXT NOT NULL,
  title TEXT NOT NULL,
  activity_type dev_activity_type NOT NULL,
  provider TEXT DEFAULT '',
  location TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  hours INTEGER DEFAULT 0,
  status dev_status DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- G. Advising Sessions table
CREATE TABLE advising_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  advisor_id UUID REFERENCES members(id) ON DELETE SET NULL,
  advisor_name TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_type advising_type DEFAULT 'general',
  notes TEXT DEFAULT '',
  action_items TEXT[] DEFAULT '{}',
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Field Training table
CREATE TABLE field_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  supervisor_name TEXT DEFAULT '',
  supervisor_contact TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  training_field TEXT NOT NULL DEFAULT 'تقنية معلومات',
  status training_status DEFAULT 'planned',
  supervisor_rating NUMERIC(3,2),
  advisor_rating NUMERIC(3,2),
  report_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- I. Graduation Projects table
CREATE TABLE graduation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  supervisor_id UUID REFERENCES members(id) ON DELETE SET NULL,
  supervisor_name TEXT NOT NULL,
  project_type project_type DEFAULT 'software',
  status project_status DEFAULT 'proposed',
  grade TEXT,
  submission_date DATE,
  defense_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- J. Study Plans table
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  total_hours INTEGER DEFAULT 18,
  description TEXT DEFAULT '',
  academic_year TEXT NOT NULL DEFAULT '1446هـ',
  status plan_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- J-b. Plan Courses table (junction table)
CREATE TABLE plan_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
  semester_order INTEGER NOT NULL DEFAULT 1,
  course_type course_type DEFAULT 'required',
  prerequisite_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, course_code)
);

-- K. Course Descriptions table
CREATE TABLE course_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL UNIQUE REFERENCES courses(code) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  objectives TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  textbooks TEXT[] DEFAULT '{}',
  references TEXT[] DEFAULT '{}',
  assessment_method TEXT DEFAULT '',
  updated_by TEXT DEFAULT '',
  version INTEGER DEFAULT 1,
  status description_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- L. Course Sections table
CREATE TABLE course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
  section_number INTEGER NOT NULL DEFAULT 1,
  professor_name TEXT NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  room_name TEXT DEFAULT '',
  capacity INTEGER DEFAULT 40,
  enrolled INTEGER DEFAULT 0,
  schedule_days TEXT[] DEFAULT '{}',
  schedule_time TEXT DEFAULT '',
  semester INTEGER NOT NULL DEFAULT 1,
  academic_year TEXT NOT NULL DEFAULT '1446هـ',
  status section_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- M. Room Bookings table
CREATE TABLE room_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  booked_by TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  status booking_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

-- Students indexes
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_level ON students(level);
CREATE INDEX idx_students_major ON students(major);
CREATE INDEX idx_students_gpa ON students(gpa DESC);
CREATE INDEX idx_students_enrollment_year ON students(enrollment_year);

-- Faculty profiles indexes
CREATE INDEX idx_faculty_profiles_member_id ON faculty_profiles(member_id);
CREATE INDEX idx_faculty_profiles_rank ON faculty_profiles(rank);
CREATE INDEX idx_faculty_profiles_specialization ON faculty_profiles(specialization);

-- Rooms indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_building ON rooms(building);
CREATE INDEX idx_rooms_available ON rooms(is_available);

-- Teaching assignments indexes
CREATE INDEX idx_teaching_assignments_professor_id ON teaching_assignments(professor_id);
CREATE INDEX idx_teaching_assignments_course_code ON teaching_assignments(course_code);
CREATE INDEX idx_teaching_assignments_room_id ON teaching_assignments(room_id);
CREATE INDEX idx_teaching_assignments_day ON teaching_assignments(day);
CREATE INDEX idx_teaching_assignments_semester ON teaching_assignments(semester);
CREATE INDEX idx_teaching_assignments_academic_year ON teaching_assignments(academic_year);

-- Performance evaluations indexes
CREATE INDEX idx_perf_evaluations_faculty_id ON performance_evaluations(faculty_id);
CREATE INDEX idx_perf_evaluations_type ON performance_evaluations(evaluation_type);
CREATE INDEX idx_perf_evaluations_academic_year ON performance_evaluations(academic_year);
CREATE INDEX idx_perf_evaluations_semester ON performance_evaluations(semester);
CREATE INDEX idx_perf_evaluations_overall ON performance_evaluations(overall_score DESC);

-- Professional development indexes
CREATE INDEX idx_prof_dev_faculty_id ON professional_development(faculty_id);
CREATE INDEX idx_prof_dev_activity_type ON professional_development(activity_type);
CREATE INDEX idx_prof_dev_status ON professional_development(status);
CREATE INDEX idx_prof_dev_start_date ON professional_development(start_date);

-- Advising sessions indexes
CREATE INDEX idx_advising_student_id ON advising_sessions(student_id);
CREATE INDEX idx_advising_advisor_id ON advising_sessions(advisor_id);
CREATE INDEX idx_advising_session_date ON advising_sessions(session_date DESC);
CREATE INDEX idx_advising_session_type ON advising_sessions(session_type);

-- Field training indexes
CREATE INDEX idx_field_training_student_id ON field_training(student_id);
CREATE INDEX idx_field_training_status ON field_training(status);
CREATE INDEX idx_field_training_organization ON field_training(organization_name);

-- Graduation projects indexes
CREATE INDEX idx_grad_projects_student_id ON graduation_projects(student_id);
CREATE INDEX idx_grad_projects_supervisor_id ON graduation_projects(supervisor_id);
CREATE INDEX idx_grad_projects_status ON graduation_projects(status);
CREATE INDEX idx_grad_projects_project_type ON graduation_projects(project_type);

-- Study plans indexes
CREATE INDEX idx_study_plans_level ON study_plans(level);
CREATE INDEX idx_study_plans_status ON study_plans(status);

-- Plan courses indexes
CREATE INDEX idx_plan_courses_plan_id ON plan_courses(plan_id);
CREATE INDEX idx_plan_courses_course_code ON plan_courses(course_code);
CREATE INDEX idx_plan_courses_semester_order ON plan_courses(semester_order);

-- Course descriptions indexes
CREATE INDEX idx_course_descriptions_course_code ON course_descriptions(course_code);
CREATE INDEX idx_course_descriptions_status ON course_descriptions(status);

-- Course sections indexes
CREATE INDEX idx_course_sections_course_code ON course_sections(course_code);
CREATE INDEX idx_course_sections_professor ON course_sections(professor_name);
CREATE INDEX idx_course_sections_semester ON course_sections(semester);
CREATE INDEX idx_course_sections_status ON course_sections(status);
CREATE INDEX idx_course_sections_academic_year ON course_sections(academic_year);

-- Room bookings indexes
CREATE INDEX idx_room_bookings_room_id ON room_bookings(room_id);
CREATE INDEX idx_room_bookings_booking_date ON room_bookings(booking_date);
CREATE INDEX idx_room_bookings_status ON room_bookings(status);
CREATE INDEX idx_room_bookings_booked_by ON room_bookings(booked_by);

-- =============================================================================
-- 4. UPDATED_AT TRIGGERS
-- =============================================================================

-- Students
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Faculty profiles
CREATE TRIGGER update_faculty_profiles_updated_at BEFORE UPDATE ON faculty_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rooms
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Teaching assignments
CREATE TRIGGER update_teaching_assignments_updated_at BEFORE UPDATE ON teaching_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Performance evaluations
CREATE TRIGGER update_performance_evaluations_updated_at BEFORE UPDATE ON performance_evaluations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Professional development
CREATE TRIGGER update_professional_development_updated_at BEFORE UPDATE ON professional_development
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Field training
CREATE TRIGGER update_field_training_updated_at BEFORE UPDATE ON field_training
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Graduation projects
CREATE TRIGGER update_graduation_projects_updated_at BEFORE UPDATE ON graduation_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Study plans
CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Course descriptions
CREATE TRIGGER update_course_descriptions_updated_at BEFORE UPDATE ON course_descriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Course sections
CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Room bookings
CREATE TRIGGER update_room_bookings_updated_at BEFORE UPDATE ON room_bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_development ENABLE ROW LEVEL SECURITY;
ALTER TABLE advising_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can read)
CREATE POLICY "Students are publicly readable" ON students FOR SELECT USING (true);
CREATE POLICY "Faculty profiles are publicly readable" ON faculty_profiles FOR SELECT USING (true);
CREATE POLICY "Rooms are publicly readable" ON rooms FOR SELECT USING (true);
CREATE POLICY "Teaching assignments are publicly readable" ON teaching_assignments FOR SELECT USING (true);
CREATE POLICY "Performance evaluations are publicly readable" ON performance_evaluations FOR SELECT USING (true);
CREATE POLICY "Professional development are publicly readable" ON professional_development FOR SELECT USING (true);
CREATE POLICY "Advising sessions are publicly readable" ON advising_sessions FOR SELECT USING (true);
CREATE POLICY "Field training are publicly readable" ON field_training FOR SELECT USING (true);
CREATE POLICY "Graduation projects are publicly readable" ON graduation_projects FOR SELECT USING (true);
CREATE POLICY "Study plans are publicly readable" ON study_plans FOR SELECT USING (true);
CREATE POLICY "Plan courses are publicly readable" ON plan_courses FOR SELECT USING (true);
CREATE POLICY "Course descriptions are publicly readable" ON course_descriptions FOR SELECT USING (true);
CREATE POLICY "Course sections are publicly readable" ON course_sections FOR SELECT USING (true);
CREATE POLICY "Room bookings are publicly readable" ON room_bookings FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on faculty_profiles" ON faculty_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on teaching_assignments" ON teaching_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on performance_evaluations" ON performance_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on professional_development" ON professional_development FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on advising_sessions" ON advising_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on field_training" ON field_training FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on graduation_projects" ON graduation_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on study_plans" ON study_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on plan_courses" ON plan_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on course_descriptions" ON course_descriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on course_sections" ON course_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on room_bookings" ON room_bookings FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 6. REALTIME PUBLICATION
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE faculty_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE teaching_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_evaluations;
ALTER PUBLICATION supabase_realtime ADD TABLE professional_development;
ALTER PUBLICATION supabase_realtime ADD TABLE advising_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE field_training;
ALTER PUBLICATION supabase_realtime ADD TABLE graduation_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE study_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE plan_courses;
ALTER PUBLICATION supabase_realtime ADD TABLE course_descriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE course_sections;
ALTER PUBLICATION supabase_realtime ADD TABLE room_bookings;

-- =============================================================================
-- 7. SEED DATA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Students (10 records)
-- -----------------------------------------------------------------------------
INSERT INTO students (id, student_id, name, email, phone, level, major, gpa, cumulative_hours, status, advisor_name, enrollment_year, created_at) VALUES
  ('88880001-0000-0000-0000-000000000001', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'abdulrahman.salem@student.edu', '0551234567', 3, 'علوم الحاسب', 3.75, 72, 'active', 'د. أحمد محمد الشريف', 2022, '2022-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000002', 'ST-2024-002', 'نورة عبدالله الحربي', 'noura.harbi@student.edu', '0552345678', 3, 'علوم الحاسب', 3.55, 69, 'active', 'د. فاطمة علي الحسن', 2022, '2022-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000003', 'ST-2024-003', 'فهد سعد العتيبي', 'fahad.otaibi@student.edu', '0553456789', 3, 'علوم الحاسب', 3.40, 69, 'active', 'د. أحمد محمد الشريف', 2022, '2022-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000004', 'ST-2024-004', 'ريم خالد الشمري', 'reem.shamri@student.edu', '0554567890', 3, 'علوم الحاسب', 3.90, 69, 'active', 'د. فاطمة علي الحسن', 2022, '2022-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000005', 'ST-2024-005', 'سلطان فيصل المطيري', 'sultan.mutairi@student.edu', '0555678901', 3, 'علوم الحاسب', 3.20, 66, 'active', 'د. خالد عبدالله العمري', 2022, '2022-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000006', 'ST-2024-006', 'لمى أحمد الزهراني', 'lama.zahrani@student.edu', '0556789012', 2, 'علوم الحاسب', 2.30, 36, 'probation', 'د. أحمد محمد الشريف', 2023, '2023-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000007', 'ST-2024-007', 'ماجد ناصر الدوسري', 'majed.dosari@student.edu', '0557890123', 3, 'علوم الحاسب', 2.85, 60, 'active', 'د. خالد عبدالله العمري', 2022, '2022-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000008', 'ST-2024-008', 'هند عادل القحطاني', 'hind.qahtani@student.edu', '0558901234', 2, 'علوم الحاسب', 2.90, 39, 'active', 'د. فاطمة علي الحسن', 2023, '2023-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000009', 'ST-2024-009', 'بدر همام السبيعي', 'badr.subaie@student.edu', '0559012345', 2, 'علوم الحاسب', 1.80, 36, 'probation', 'د. أحمد محمد الشريف', 2023, '2023-09-01T00:00:00.000Z'),
  ('88880001-0000-0000-0000-000000000010', 'ST-2024-010', 'أسماء طارق البقمي', 'asma.bagmi@student.edu', '0550123456', 3, 'علوم الحاسب', 3.50, 63, 'active', 'د. فاطمة علي الحسن', 2022, '2022-09-01T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Faculty Profiles (4 records - linked to existing professor members)
-- -----------------------------------------------------------------------------
INSERT INTO faculty_profiles (id, member_id, specialization, rank, qualification, granting_university, bio, research_interests, hire_date, created_at) VALUES
  ('88880002-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'هياكل البيانات والخوارزميات', 'associate_professor', 'دكتوراه في علوم الحاسب', 'جامعة الملك فهد للبترول والمعادن', 'أستاذ مشارك في علوم الحاسب مع خبرة تمتد لأكثر من 10 سنوات في التدريس والبحث العلمي. متخصص في تحليل الخوارزميات وهياكل البيانات المتقدمة.', ARRAY['تحليل الخوارزميات', 'هياكل البيانات', 'التعلم الآلي'], '2018-09-01', '2018-09-01T00:00:00.000Z'),
  ('88880002-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'قواعد البيانات ونظم المعلومات', 'assistant_professor', 'دكتوراه في هندسة البرمجيات', 'جامعة الملك سعود', 'أستاذ مساعد متخصص في قواعد البيانات ونظم المعلومات. حاصلة على درجة الدكتوراه من جامعة الملك سعود وتهتم بتطبيقات البيانات الضخمة.', ARRAY['قواعد البيانات', 'البيانات الضخمة', 'هندسة البرمجيات'], '2020-01-15', '2020-01-15T00:00:00.000Z'),
  ('88880002-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', 'شبكات الحاسب والأمن السيبراني', 'lecturer', 'ماجستير في أمن المعلومات', 'جامعة الأمير سلطان', 'محاضر في قسم علوم الحاسب متخصص في شبكات الحاسب والأمن السيبراني. حاصل على درجة الماجستير مع خبرة عملية في مجال الأمن السيبراني.', ARRAY['شبكات الحاسب', 'الأمن السيبراني', 'الاستجابة للحوادث'], '2021-09-01', '2021-09-01T00:00:00.000Z'),
  ('88880002-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000007', 'الذكاء الاصطناعي ومعالجة اللغات', 'professor', 'دكتوراه في الذكاء الاصطناعي', 'جامعة كارنيجي ميلون', 'أستاذ متفرغ ورئيس القسم السابق. متخصص في الذكاء الاصطناعي ومعالجة اللغة الطبيعية العربية. حاصل على الدكتوراه من جامعة كارنيجي ميلون.', ARRAY['الذكاء الاصطناعي', 'معالجة اللغة الطبيعية', 'التعلم العميق', 'رؤية الحاسوب'], '2015-01-01', '2015-01-01T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Rooms (8 records)
-- -----------------------------------------------------------------------------
INSERT INTO rooms (id, name, code, building, floor, capacity, type, equipment, is_available, created_at) VALUES
  ('88880003-0000-0000-0000-000000000001', 'قاعة المحاضرات الكبرى', 'A101', 'المبنى الرئيسي', 1, 80, 'lecture_hall', ARRAY['جهاز عرض', 'سبورة ذكية', 'نظام صوتي', 'واي فاي'], TRUE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000002', 'قاعة المحاضرات ٢', 'A102', 'المبنى الرئيسي', 1, 50, 'lecture_hall', ARRAY['جهاز عرض', 'سبورة ذكية'], TRUE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000003', 'معمل البرمجة ١', 'B201', 'مبنى المختبرات', 2, 30, 'lab', ARRAY['حاسوب ×30', 'برمجيات تطوير', 'شاشات كبيرة', 'واي فاي'], TRUE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000004', 'معمل البرمجة ٢', 'B202', 'مبنى المختبرات', 2, 30, 'lab', ARRAY['حاسوب ×30', 'برمجيات تطوير', 'واي فاي'], TRUE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000005', 'معمل الشبكات', 'B203', 'مبنى المختبرات', 2, 25, 'lab', ARRAY['أجهزة شبكات', 'أدوات تشخيص', 'خوادم تجريبية'], TRUE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000006', 'قاعة الاجتماعات', 'C101', 'المبنى الرئيسي', 1, 20, 'meeting_room', ARRAY['جهاز عرض', 'نظام مؤتمرات', 'سبورة بيضاء'], TRUE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000007', 'مكتب رئيس القسم', 'D001', 'المبنى الرئيسي', 3, 8, 'office', ARRAY['حاسوب', 'طابعة', 'هاتف'], FALSE, '2024-01-01T00:00:00.000Z'),
  ('88880003-0000-0000-0000-000000000008', 'قاعة التعليم عن بعد', 'A103', 'المبنى الرئيسي', 1, 35, 'tutorial', ARRAY['كاميرات مؤتمرات', 'جهاز عرض', 'مايكروفونات', 'سبورة تفاعلية'], TRUE, '2024-01-01T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Teaching Assignments (8 records)
-- -----------------------------------------------------------------------------
INSERT INTO teaching_assignments (id, professor_id, professor_name, course_code, course_name, section, room_id, room_name, day, start_time, end_time, session_type, academic_year, semester, created_at) VALUES
  ('88880004-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'CS101', 'مقدمة في علوم الحاسب', 1, '88880003-0000-0000-0000-000000000001', 'قاعة المحاضرات الكبرى', 'saturday', '08:00', '09:50', 'lecture', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'CS102', 'مبادئ البرمجة', 1, '88880003-0000-0000-0000-000000000003', 'معمل البرمجة ١', 'sunday', '10:00', '11:50', 'lab', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'MATH101', 'رياضيات متقدمة', 1, '88880003-0000-0000-0000-000000000002', 'قاعة المحاضرات ٢', 'monday', '08:00', '09:50', 'lecture', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'CS201', 'هياكل البيانات', 1, '88880003-0000-0000-0000-000000000004', 'معمل البرمجة ٢', 'tuesday', '10:00', '11:50', 'lab', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'CS202', 'قواعد البيانات', 1, '88880003-0000-0000-0000-000000000003', 'معمل البرمجة ١', 'wednesday', '08:00', '09:50', 'lab', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', 'CS205', 'شبكات الحاسب ١', 1, '88880003-0000-0000-0000-000000000005', 'معمل الشبكات', 'thursday', '10:00', '11:50', 'lab', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000007', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'CS301', 'تحليل الخوارزميات', 1, '88880003-0000-0000-0000-000000000001', 'قاعة المحاضرات الكبرى', 'sunday', '08:00', '09:50', 'lecture', '1446هـ', 1, '2025-01-15T00:00:00.000Z'),
  ('88880004-0000-0000-0000-000000000008', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'CS305', 'ذكاء اصطناعي', 1, '88880003-0000-0000-0000-000000000008', 'قاعة التعليم عن بعد', 'tuesday', '08:00', '09:50', 'lecture', '1446هـ', 1, '2025-01-15T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Performance Evaluations (6 records)
-- -----------------------------------------------------------------------------
INSERT INTO performance_evaluations (id, faculty_id, faculty_name, evaluation_type, academic_year, semester, teaching_score, research_score, service_score, overall_score, comments, created_at) VALUES
  ('88880005-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'student_feedback', '1445هـ', 2, 4.50, 4.20, 4.00, 4.23, 'أداء ممتاز في التدريس وحضور نشط في المؤتمرات العلمية', '2024-06-15T00:00:00.000Z'),
  ('88880005-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'student_feedback', '1445هـ', 2, 4.70, 3.90, 4.30, 4.30, 'أستاذة متميزة في التواصل مع الطلاب وتقديم المحتوى بطريقة مبسطة', '2024-06-15T00:00:00.000Z'),
  ('88880005-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', 'student_feedback', '1445هـ', 2, 4.00, 3.50, 3.80, 3.77, 'أداء جيد مع مجال للتحسين في النشاط البحثي', '2024-06-15T00:00:00.000Z'),
  ('88880005-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'chairman_review', '1445هـ', 2, 4.60, 4.40, 4.10, 4.37, 'إسهامات ملموسة في تطوير المناهج وتحديث المقررات', '2024-06-20T00:00:00.000Z'),
  ('88880005-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'peer_review', '1445هـ', 2, 4.50, 4.10, 4.20, 4.27, 'زملاء يعترفون بجودة بحثها وتعاونها المستمر', '2024-06-18T00:00:00.000Z'),
  ('88880005-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000007', 'د. محمد فيصل الغامدي', 'self_assessment', '1445هـ', 2, 4.30, 4.80, 3.90, 4.33, 'أستاذ متميز أكاديمياً مع إسهامات بحثية كبيرة', '2024-06-10T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Professional Development (6 records)
-- -----------------------------------------------------------------------------
INSERT INTO professional_development (id, faculty_id, faculty_name, title, activity_type, provider, location, start_date, end_date, hours, status, created_at) VALUES
  ('88880006-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'المؤتمر الدولي للذكاء الاصطناعي', 'conference', 'IEEE', 'الرياض', '2025-03-15', '2025-03-18', 24, 'planned', '2025-01-10T00:00:00.000Z'),
  ('88880006-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'ورشة العمل المتقدمة في PostgreSQL', 'workshop', 'أوراكل', 'جدة', '2024-11-10', '2024-11-11', 16, 'completed', '2024-10-20T00:00:00.000Z'),
  ('88880006-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', 'شهادة أمن المعلومات CISSP', 'certification', 'ISC2', 'عن بُعد', '2025-01-01', '2025-03-01', 120, 'planned', '2024-12-01T00:00:00.000Z'),
  ('88880006-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'ندوة التعلم الآلي في التطبيقات الطبية', 'seminar', 'جامعة الملك سعود', 'الرياض', '2024-10-20', '2024-10-20', 4, 'completed', '2024-09-15T00:00:00.000Z'),
  ('88880006-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000007', 'د. محمد فيصل الغامدي', 'دورة المعالجة اللغوية العربية', 'training_course', 'كليokit', 'الرياض', '2024-08-01', '2024-08-15', 40, 'completed', '2024-07-15T00:00:00.000Z'),
  ('88880006-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'المؤتمر العربي لعلوم البيانات', 'conference', 'جمعية الحاسب العربي', 'دبي', '2025-02-10', '2025-02-12', 20, 'planned', '2024-12-20T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Advising Sessions (8 records)
-- -----------------------------------------------------------------------------
INSERT INTO advising_sessions (id, student_id, student_name, advisor_id, advisor_name, session_date, session_type, notes, action_items, follow_up_date, created_at) VALUES
  ('88880007-0000-0000-0000-000000000001', 'ST-2024-001', 'عبدالرحمن محمد السالم', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', '2025-01-12T09:00:00.000Z', 'academic_plan', 'مناقشة الخطة الدراسية للفصل القادم وتحديد المقررات المناسبة', ARRAY['تسجيل CS301', 'تسجيل CS305', 'مراجعة شروط التخرج'], '2025-02-01', '2025-01-12T09:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000002', 'ST-2024-006', 'لمى أحمد الزهراني', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', '2025-01-10T10:00:00.000Z', 'academic_warning', 'تنبيه الطالبة بانخفاض المعدل التراكمي ووضع خطة علاجية لتحسين الأداء', ARRAY['حضور ورطة المهارات الأكاديمية', 'متابعة أسبوعية مع المرشد', 'تقليل عدد الساعات المسجلة'], '2025-01-24', '2025-01-10T10:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000003', 'ST-2024-004', 'ريم خالد الشمري', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', '2025-01-08T11:00:00.000Z', 'course_guidance', 'إرشاد الطالبة حول اختيار المقررات الاختيارية المناسبة لتخصصها', ARRAY['اختيار مقرر الذكاء الاصطناعي', 'استكمال متطلب اللغة الإنجليزية'], '2025-02-08', '2025-01-08T11:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000004', 'ST-2024-009', 'بدر همام السبيعي', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', '2025-01-06T14:00:00.000Z', 'academic_warning', 'نقاش تفصيلي مع الطالب حول صعوباته الأكاديمية ووضع خطة لرفع المعدل', ARRAY['تكرار مقرر رياضيات متقدمة', 'التسجيل في حصص تقوية', 'اجتماع مع الأهل'], '2025-01-20', '2025-01-06T14:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000005', 'ST-2024-005', 'سلطان فيصل المطيري', '33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', '2025-01-14T10:00:00.000Z', 'career_advice', 'مناقشة فرص التدريب والعمل بعد التخرج ومتطلبات سوق العمل', ARRAY['التقديم على برنامج التدريب التعاوني', 'بناء معرض الأعمال', 'حضور فعاليات التوظيف'], '2025-03-01', '2025-01-14T10:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000006', 'ST-2024-003', 'فهد سعد العتيبي', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', '2025-01-15T08:00:00.000Z', 'general', 'استفسار حول عملية التسجيل ومواعيد إسقاط المقررات', ARRAY['مراجعة دليل الطالب', 'التواصل مع مكتب القبول'], '2025-01-22', '2025-01-15T08:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000007', 'ST-2024-007', 'ماجد ناصر الدوسري', '33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', '2025-01-05T12:00:00.000Z', 'academic_plan', 'مراجعة الخطة الدراسية وتحديد المقررات المتبقية للتخرج', ARRAY['تسجيل مقرر الشبكات', 'التحقق من إكمال المتطلبات'], '2025-01-19', '2025-01-05T12:00:00.000Z'),
  ('88880007-0000-0000-0000-000000000008', 'ST-2024-010', 'أسماء طارق البقمي', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', '2025-01-11T09:30:00.000Z', 'course_guidance', 'مناقشة اختيار مسار التخصص الدقيق بين البرمجيات والشبكات', ARRAY['زيارة مكتب التوجيه', 'مقابلة مع أستاذ الشبكات'], '2025-02-11', '2025-01-11T09:30:00.000Z');

-- -----------------------------------------------------------------------------
-- Field Training (5 records)
-- -----------------------------------------------------------------------------
INSERT INTO field_training (id, student_id, student_name, organization_name, supervisor_name, supervisor_contact, start_date, end_date, training_field, status, supervisor_rating, advisor_rating, report_submitted, created_at) VALUES
  ('88880008-0000-0000-0000-000000000001', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'شركة STC Solutions', 'أ. ماجد الراشد', 'majed.rashid@stc.com', '2025-06-01', '2025-08-15', 'تقنية معلومات', 'planned', NULL, NULL, FALSE, '2025-01-10T00:00:00.000Z'),
  ('88880008-0000-0000-0000-000000000002', 'ST-2024-004', 'ريم خالد الشمري', 'شركة أرامكو السعودية', 'أ. سارة المنصور', 'sara.mansour@aramco.com', '2025-06-01', '2025-08-15', 'تقنية معلومات', 'planned', NULL, NULL, FALSE, '2025-01-10T00:00:00.000Z'),
  ('88880008-0000-0000-0000-000000000003', 'ST-2024-002', 'نورة عبدالله الحربي', 'هيئة الحكومة الرقمية', 'أ. عبدالله الفهد', 'abdullah.fahad@dga.gov', '2024-06-01', '2024-08-15', 'تقنية معلومات', 'completed', 4.70, 4.50, TRUE, '2024-05-20T00:00:00.000Z'),
  ('88880008-0000-0000-0000-000000000004', 'ST-2024-005', 'سلطان فيصل المطيري', 'شركة سابك', 'أ. خالد البلوي', 'khaled.balawi@sabic.com', '2024-06-15', '2024-08-30', 'تقنية معلومات', 'completed', 3.90, 4.00, TRUE, '2024-05-25T00:00:00.000Z'),
  ('88880008-0000-0000-0000-000000000005', 'ST-2024-003', 'فهد سعد العتيبي', 'بنك الراجحي', 'أ. ناصر الحربي', 'nasser.harbi@alrajhi.com', '2025-06-01', '2025-08-15', 'تقنية معلومات', 'in_progress', NULL, NULL, FALSE, '2025-01-05T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Graduation Projects (5 records)
-- -----------------------------------------------------------------------------
INSERT INTO graduation_projects (id, student_id, student_name, title, description, supervisor_id, supervisor_name, project_type, status, grade, submission_date, defense_date, created_at) VALUES
  ('88880009-0000-0000-0000-000000000001', 'ST-2024-001', 'عبدالرحمن محمد السالم', 'نظام ذكي لإدارة الجداول الزمنية باستخدام الخوارزميات الجينية', 'تطبيق نظام ذكي لتوليد الجداول الزمنية للمؤسسات التعليمية باستخدام الخوارزميات الجينية مع واجهة ويب تفاعلية.', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'software', 'in_progress', NULL, NULL, NULL, '2025-01-10T00:00:00.000Z'),
  ('88880009-0000-0000-0000-000000000002', 'ST-2024-004', 'ريم خالد الشمري', 'تحليل المشاعر في التغريدات العربية باستخدام التعلم العميق', 'مشروع بحثي لتحليل المشاعر في النصوص العربية على منصة تويتر باستخدام نماذج التعلم العميق والتعامل مع التحديات اللغوية للعربية.', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'research', 'approved', NULL, NULL, NULL, '2025-01-08T00:00:00.000Z'),
  ('88880009-0000-0000-0000-000000000003', 'ST-2024-002', 'نورة عبدالله الحربي', 'نظام إدارة ملفات تعريف الارتباط المتوافق مع سياسات الخصوصية', 'تطوير نظام آمن لإدارة ملفات تعريف الارتباط يتوافق مع سياسات الخصوصية العامة GDPR ويسمح للمستخدمين بالتحكم الكامل ببياناتهم.', '33333333-0000-0000-0000-000000000002', 'د. فاطمة علي الحسن', 'system', 'proposed', NULL, NULL, NULL, '2025-01-15T00:00:00.000Z'),
  ('88880009-0000-0000-0000-000000000004', 'ST-2024-005', 'سلطان فيصل المطيري', 'نظام مراقبة الشبكات باستخدام تقنيات إنترنت الأشياء', 'تصميم وتنفيذ نظام متكامل لمراقبة حالة أجهزة الشبكة باستخدام مستشعرات إنترنت الأشياء مع لوحة تحكم مركزية.', '33333333-0000-0000-0000-000000000003', 'د. خالد عبدالله العمري', 'software', 'approved', NULL, NULL, NULL, '2025-01-12T00:00:00.000Z'),
  ('88880009-0000-0000-0000-000000000005', 'ST-2024-003', 'فهد سعد العتيبي', 'دراسة مقارنة لتقنيات التخزين المؤقت في قواعد البيانات', 'بحث نظري يقارن بين تقنيات التخزين المؤقت المختلفة مثل Redis وMemcached وتأثيرها على أداء تطبيقات الويب.', '33333333-0000-0000-0000-000000000001', 'د. أحمد محمد الشريف', 'theoretical', 'proposed', NULL, NULL, NULL, '2025-01-14T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Study Plans (3 records)
-- -----------------------------------------------------------------------------
INSERT INTO study_plans (id, program_name, level, total_hours, description, academic_year, status, created_at) VALUES
  ('88880010-0000-0000-0000-000000000001', 'خطة بكالوريوس علوم الحاسب', 1, 18, 'الخطة الدراسية للفصل الأول من برنامج بكالوريوس علوم الحاسب', '1446هـ', 'active', '2024-09-01T00:00:00.000Z'),
  ('88880010-0000-0000-0000-000000000002', 'خطة بكالوريوس علوم الحاسب', 2, 18, 'الخطة الدراسية للفصل الثاني من برنامج بكالوريوس علوم الحاسب', '1446هـ', 'active', '2024-09-01T00:00:00.000Z'),
  ('88880010-0000-0000-0000-000000000003', 'خطة بكالوريوس علوم الحاسب', 3, 18, 'الخطة الدراسية للفصل الثالث من برنامج بكالوريوس علوم الحاسب', '1446هـ', 'active', '2024-09-01T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Plan Courses (15 records - courses within each study plan level)
-- -----------------------------------------------------------------------------
INSERT INTO plan_courses (id, plan_id, course_code, semester_order, course_type, prerequisite_codes, created_at) VALUES
  -- Level 1 plan courses
  ('88880011-0000-0000-0000-000000000001', '88880010-0000-0000-0000-000000000001', 'CS101', 1, 'required', '{}', '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000002', '88880010-0000-0000-0000-000000000001', 'MATH101', 1, 'college_requirement', '{}', '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000003', '88880010-0000-0000-0000-000000000001', 'PHYS101', 1, 'university_requirement', '{}', '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000004', '88880010-0000-0000-0000-000000000001', 'ENG101', 1, 'university_requirement', '{}', '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000005', '88880010-0000-0000-0000-000000000001', 'IT101', 1, 'college_requirement', '{}', '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000006', '88880010-0000-0000-0000-000000000001', 'CS102', 1, 'required', ARRAY['CS101'], '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000007', '88880010-0000-0000-0000-000000000001', 'STAT101', 1, 'required', '{}', '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000008', '88880010-0000-0000-0000-000000000001', 'CRIT101', 1, 'university_requirement', '{}', '2024-09-01T00:00:00.000Z'),
  -- Level 2 plan courses
  ('88880011-0000-0000-0000-000000000009', '88880010-0000-0000-0000-000000000002', 'CS201', 1, 'required', ARRAY['CS102'], '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000010', '88880010-0000-0000-0000-000000000002', 'CS202', 1, 'required', ARRAY['CS102'], '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000011', '88880010-0000-0000-0000-000000000002', 'CS205', 1, 'required', ARRAY['CS101'], '2024-09-01T00:00:00.000Z'),
  -- Level 3 plan courses
  ('88880011-0000-0000-0000-000000000012', '88880010-0000-0000-0000-000000000003', 'CS301', 1, 'required', ARRAY['CS201'], '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000013', '88880010-0000-0000-0000-000000000003', 'CS305', 1, 'elective', ARRAY['CS201'], '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000014', '88880010-0000-0000-0000-000000000003', 'CS201', 1, 'required', ARRAY['CS102'], '2024-09-01T00:00:00.000Z'),
  ('88880011-0000-0000-0000-000000000015', '88880010-0000-0000-0000-000000000003', 'CS202', 1, 'required', ARRAY['CS102'], '2024-09-01T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Course Descriptions (8 records - matching existing courses)
-- -----------------------------------------------------------------------------
INSERT INTO course_descriptions (id, course_code, description, objectives, topics, textbooks, references, assessment_method, updated_by, version, status, created_at) VALUES
  ('88880012-0000-0000-0000-000000000001', 'CS101', 'مقرر تأسيسي يقدم مقدمة شاملة في مجال علوم الحاسب، يغطي المفاهيم الأساسية للتقنية والحوسبة وتاريخ تطور علوم الحاسب.', ARRAY['فهم المفاهيم الأساسية لعلوم الحاسب', 'التعرف على أنظمة الأرقام والتحويلات', 'فهم بنية الحاسوب ومكوناته', 'تطبيق مهارات التفكير الحسابي'], ARRAY['تاريخ علوم الحاسب', 'أنظمة الأرقام والتحويلات', 'بنية الحاسوب', 'أنظمة التشغيل', 'الشبكات والإنترنت', 'أمن المعلومات'], ARRAY['Computer Science Illuminated', 'مقدمة في علوم الحاسب - ترجمة عربية'], ARRAY['ACM Computer Science Curricula', 'IEEE Computer Society Standards'], 'مشاريع 20% + وسط 30% + نهائي 50%', 'د. أحمد محمد الشريف', 2, 'approved', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000002', 'CS102', 'مقرر تأسيسي في البرمجة يركز على تعلم أساسيات البرمجة باستخدام لغة Python مع التطبيق العملي من خلال مشاريع.', ARRAY['اكتساب مهارات البرمجة الأساسية', 'فهم المفاهيم البرمجية', 'كتابة برامج صحيحة وكفؤة', 'حل المشكلات باستخدام البرمجة'], ARRAY['متغيرات وأنواع البيانات', 'العمليات الحسابية والمنطقية', 'الجمل الشرطية', 'الحلقات التكرارية', 'الدوال والإجراءات', 'المصفوفات'], ARRAY['Python Crash Course', 'Think Python'], ARRAY['The Python Tutorial - python.org'], 'أعمال 30% + وسط 30% + نهائي 40%', 'د. أحمد محمد الشريف', 3, 'approved', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000003', 'MATH101', 'مقرر في الرياضيات المتقدمة يغطي التفاضل والتكامل والجبر الخطي ومفاهيم الرياضيات الأساسية لطلاب علوم الحاسب.', ARRAY['فهم المفاهيم الأساسية للتفاضل والتكامل', 'تطبيق التقنيات الرياضية في حل المسائل', 'فهم أساسيات الجبر الخطي', 'تطوير التفكير الرياضي والتحليلي'], ARRAY['الدوال والنهايات', 'الاشتقاق والتفاضل', 'التكامل', 'المتتاليات والمتسلسلات', 'الجبر الخطي الأساسي'], ARRAY['Calculus: Early Transcendentals', 'Linear Algebra and Its Applications'], ARRAY['Khan Academy Math Resources', 'MIT OpenCourseWare'], 'واجبات 20% + وسط 30% + نهائي 50%', 'د. فاطمة علي الحسن', 1, 'approved', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000004', 'CS201', 'مقرر متوسط في هياكل البيانات يغطي الهياكل الأساسية والخوارزميات المرتبطة بها وتحليل تعقيد الخوارزميات.', ARRAY['فهم هياكل البيانات الأساسية والمتقدمة', 'تحليل تعقيد الخوارزميات', 'اختيار هيكل البيانات المناسب للمشكلة', 'تنفيذ هياكل البيانات بلغة برمجة'], ARRAY['المصفوفات والقوائم المتصلة', 'المكدسات والطوابير', 'الأشجار الثنائية', 'أشجار BST وAVL', 'الرسوم البيانية', 'جدول التجزئة', 'تحليل التعقيد'], ARRAY['Introduction to Algorithms (CLRS)', 'Data Structures and Algorithms in Python'], ARRAY['Visualgo.net', 'GeeksforGeeks'], 'مشاريع 25% + وسط 35% + نهائي 40%', 'د. أحمد محمد الشريف', 2, 'approved', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000005', 'CS202', 'مقرر في قواعد البيانات يغطي المفاهيم النظرية والعملية لتصميم وتنفيذ قواعد البيانات العلائقية باستخدام SQL.', ARRAY['فهم المفاهيم الأساسية لقواعد البيانات', 'تصميم نماذج قواعد البيانات العلائقية', 'كتابة استعلامات SQL معقدة', 'فهم معالجة المعاملات والتزامن'], ARRAY['نظم قواعد البيانات', 'النموذج العلائقي', 'تصميم قواعد البيانات', 'SQL - لغة الاستعلام', 'التطبيع', 'المعاملات والتزامن', 'إدارة الأمان'], ARRAY['Database System Concepts', 'SQL in 10 Minutes'], ARRAY['PostgreSQL Documentation', 'W3Schools SQL'], 'مشاريع 30% + وسط 30% + نهائي 40%', 'د. فاطمة علي الحسن', 1, 'approved', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000006', 'CS205', 'مقرر في أساسيات شبكات الحاسب يغطي المفاهيم والبروتوكولات الأساسية لشبكات الحاسب والإنترنت.', ARRAY['فهم مفاهيم الشبكات الأساسية', 'التعرف على نماذج الشبكات الطبقية', 'فهم بروتوكولات TCP/IP', 'تصميم شبكات بسيطة'], ARRAY['مقدمة في الشبكات', 'نموذج OSI وTCP/IP', 'عنونة IP والشبكات الفرعية', 'بروتوكولات التوجيه', 'أمن الشبكات', 'التطبيقات الشبكية'], ARRAY['Computer Networking: A Top-Down Approach', 'Network+ Certification Guide'], ARRAY['Cisco Networking Academy', 'RFC Documents'], 'تجارب معملية 30% + وسط 30% + نهائي 40%', 'د. خالد عبدالله العمري', 1, 'draft', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000007', 'CS301', 'مقرر متقدم في تحليل الخوارزميات يركز على تصميم وتحليل كفاءة الخوارزميات وأنماط التصميم الشائعة.', ARRAY['تصميم خوارزميات فعالة', 'تحليل تعقيد الخوارزميات', 'تطبيق استراتيجيات التصميم', 'حل المشكلات المعقدة'], ARRAY['تحليل التعقيد الزمني والمكاني', 'الاستراتيجيات: التقسيم والغزو', 'البرمجة الديناميكية', 'الخوارزميات الجشعة', 'خوارزميات الرسم البياني', 'NP-Completeness'], ARRAY['Introduction to Algorithms (CLRS)', 'The Algorithm Design Manual'], ARRAY('Algorithm Visualizer', 'Competitive Programming Resources'), 'مشاريع 30% + وسط 30% + نهائي 40%', 'د. أحمد محمد الشريف', 1, 'approved', '2024-09-01T00:00:00.000Z'),
  ('88880012-0000-0000-0000-000000000008', 'CS305', 'مقرر في الذكاء الاصطناعي يقدم المفاهيم الأساسية وتطبيقاته في مجالات التعلم الآلي ومعالجة اللغة الطبيعية.', ARRAY['فهم المفاهيم الأساسية للذكاء الاصطناعي', 'التعرف على خوارزميات البحث والاستدلال', 'فهم أساسيات التعلم الآلي', 'تطبيق تقنيات الذكاء الاصطناعي'], ARRAY['تاريخ الذكاء الاصطناعي', 'خوارزميات البحث', 'المنطق والاستدلال', 'التعلم الآلي', 'الشبكات العصبية', 'معالجة اللغة الطبيعية', 'الآلية والتطبيقات'], ARRAY['Artificial Intelligence: A Modern Approach', 'Hands-On Machine Learning'], ARRAY['Google AI Education', 'TensorFlow Tutorials'], 'مشاريع 35% + وسط 30% + نهائي 35%', 'د. فاطمة علي الحسن', 1, 'draft', '2024-09-01T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Course Sections (8 records)
-- -----------------------------------------------------------------------------
INSERT INTO course_sections (id, course_code, section_number, professor_name, room_id, room_name, capacity, enrolled, schedule_days, schedule_time, semester, academic_year, status, created_at) VALUES
  ('88880013-0000-0000-0000-000000000001', 'CS101', 1, 'د. أحمد محمد الشريف', '88880003-0000-0000-0000-000000000001', 'قاعة المحاضرات الكبرى', 60, 45, ARRAY['saturday', 'tuesday'], '08:00-09:50', 1, '1446هـ', 'open', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000002', 'CS102', 1, 'د. أحمد محمد الشريف', '88880003-0000-0000-0000-000000000003', 'معمل البرمجة ١', 35, 30, ARRAY['sunday', 'wednesday'], '10:00-11:50', 1, '1446هـ', 'open', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000003', 'MATH101', 1, 'د. فاطمة علي الحسن', '88880003-0000-0000-0000-000000000002', 'قاعة المحاضرات ٢', 50, 40, ARRAY['monday', 'thursday'], '08:00-09:50', 1, '1446هـ', 'open', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000004', 'CS201', 1, 'د. أحمد محمد الشريف', '88880003-0000-0000-0000-000000000004', 'معمل البرمجة ٢', 35, 35, ARRAY['tuesday', 'thursday'], '10:00-11:50', 1, '1446هـ', 'full', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000005', 'CS202', 1, 'د. فاطمة علي الحسن', '88880003-0000-0000-0000-000000000003', 'معمل البرمجة ١', 35, 28, ARRAY['wednesday', 'saturday'], '08:00-09:50', 1, '1446هـ', 'open', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000006', 'CS205', 1, 'د. خالد عبدالله العمري', '88880003-0000-0000-0000-000000000005', 'معمل الشبكات', 25, 25, ARRAY['thursday'], '10:00-11:50', 1, '1446هـ', 'full', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000007', 'CS301', 1, 'د. أحمد محمد الشريف', '88880003-0000-0000-0000-000000000001', 'قاعة المحاضرات الكبرى', 50, 20, ARRAY['sunday'], '08:00-09:50', 1, '1446هـ', 'open', '2025-01-15T00:00:00.000Z'),
  ('88880013-0000-0000-0000-000000000008', 'CS305', 1, 'د. فاطمة علي الحسن', '88880003-0000-0000-0000-000000000008', 'قاعة التعليم عن بعد', 35, 15, ARRAY['tuesday'], '08:00-09:50', 1, '1446هـ', 'open', '2025-01-15T00:00:00.000Z');

-- -----------------------------------------------------------------------------
-- Room Bookings (6 records)
-- -----------------------------------------------------------------------------
INSERT INTO room_bookings (id, room_id, room_name, booked_by, booking_date, start_time, end_time, purpose, status, created_at) VALUES
  ('88880014-0000-0000-0000-000000000001', '88880003-0000-0000-0000-000000000006', 'قاعة الاجتماعات', 'د. أحمد محمد الشريف', '2025-01-20', '10:00', '12:00', 'اجتماع لجنة المناهج لمناقشة تحديث مقرر CS201', 'approved', '2025-01-15T00:00:00.000Z'),
  ('88880014-0000-0000-0000-000000000002', '88880003-0000-0000-0000-000000000001', 'قاعة المحاضرات الكبرى', 'أ. نورة سعد القحطاني', '2025-01-25', '09:00', '11:00', 'ورشة عمل للطلاب الجدد حول النظام الأكاديمي', 'approved', '2025-01-16T00:00:00.000Z'),
  ('88880014-0000-0000-0000-000000000003', '88880003-0000-0000-0000-000000000008', 'قاعة التعليم عن بعد', 'د. فاطمة علي الحسن', '2025-02-01', '14:00', '16:00', 'محاضرة افتتاحية لندوة الذكاء الاصطناعي', 'pending', '2025-01-17T00:00:00.000Z'),
  ('88880014-0000-0000-0000-000000000004', '88880003-0000-0000-0000-000000000003', 'معمل البرمجة ١', 'أ. هند عبدالرحمن السبيعي', '2025-01-28', '13:00', '16:00', 'اختبار عملي لمقرر مبادئ البرمجة', 'approved', '2025-01-14T00:00:00.000Z'),
  ('88880014-0000-0000-0000-000000000005', '88880003-0000-0000-0000-000000000006', 'قاعة الاجتماعات', 'د. خالد عبدالله العمري', '2025-02-05', '11:00', '12:30', 'اجتماع مشروع التخرج مع فريق الطلاب', 'pending', '2025-01-18T00:00:00.000Z'),
  ('88880014-0000-0000-0000-000000000006', '88880003-0000-0000-0000-000000000002', 'قاعة المحاضرات ٢', 'أ. عمر حسن الدوسري', '2025-01-22', '08:00', '10:00', 'حصة إضافية لمراجعة مقرر الرياضيات', 'approved', '2025-01-13T00:00:00.000Z');

-- =============================================================================
-- END OF MIGRATION 002
-- =============================================================================
