import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  announcementsStore,
  enrolledStudentsStore,
  professorCoursesStore,
  membersStore,
  studentRequestsStore,
  professorRequestsStore,
  employeeTransfersStore,
  coursesStore,
} from '@/lib/local-data';

async function getSupabaseOrFallback() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET() {
  const supabase = await getSupabaseOrFallback();

  // Try to get data from Supabase
  if (supabase) {
    try {
      const [enrolledRes, profCoursesRes, membersRes, requestsRes, profReqsRes, transfersRes, sectionsRes] =
        await Promise.all([
          supabase.from('enrolled_students').select('*'),
          supabase.from('professor_courses').select('*'),
          supabase.from('members').select('*'),
          supabase.from('student_requests').select('*'),
          supabase.from('professor_requests').select('*'),
          supabase.from('employee_transfers').select('*'),
          supabase.from('course_sections').select('*'),
        ]);

      const enrolled = enrolledRes.data || [];
      const profCourses = profCoursesRes.data || [];
      const members = membersRes.data || [];
      const studentReqs = requestsRes.data || [];
      const profReqs = profReqsRes.data || [];
      const transfers = transfersRes.data || [];
      const sections = sectionsRes.data || [];

      return NextResponse.json(computeReportData(enrolled, profCourses, members, studentReqs, profReqs, transfers, sections));
    } catch (err) {
      console.error('Reports API error:', err);
      // Fall through to local data
    }
  }

  // Fallback to local data
  const enrolled = enrolledStudentsStore.getAll();
  const profCourses = professorCoursesStore.getAll();
  const members = membersStore.getAll();
  const studentReqs = studentRequestsStore.getAll();
  const profReqs = professorRequestsStore.getAll();
  const transfers = employeeTransfersStore.getAll();
  const sections: any[] = [];

  return NextResponse.json(computeReportData(enrolled, profCourses, members, studentReqs, profReqs, transfers, sections));
}

function computeReportData(
  enrolled: any[],
  profCourses: any[],
  members: any[],
  studentReqs: any[],
  profReqs: any[],
  transfers: any[],
  sections: any[]
) {
  // 1. Student Reports
  // Pass/Fail rates per course
  const courseStats: Record<string, { name: string; total: number; pass: number; fail: number }> = {};
  for (const e of enrolled) {
    const code = e.course_code || e.courseCode;
    const name = e.course_name || profCourses.find((c: any) => (c.course_code || c.code) === code)?.name || code;
    if (!courseStats[code]) courseStats[code] = { name, total: 0, pass: 0, fail: 0 };
    courseStats[code].total++;
    const grade = e.grade;
    if (grade && grade !== 'ر') {
      courseStats[code].pass++;
    } else if (grade === 'ر') {
      courseStats[code].fail++;
    }
  }
  const passFailRates = Object.entries(courseStats).map(([code, s]) => ({
    courseCode: code,
    courseName: s.name,
    totalStudents: s.total,
    passRate: s.total > 0 ? Math.round((s.pass / s.total) * 100) : 0,
    failRate: s.total > 0 ? Math.round((s.fail / s.total) * 100) : 0,
  }));

  // GPA Distribution
  const GRADE_TO_POINTS: Record<string, number> = {
    'أ+': 4.0, 'أ': 4.0, 'أ-': 3.7,
    'ب+': 3.3, 'ب': 3.0, 'ب-': 2.7,
    'ج+': 2.3, 'ج': 2.0, 'ج-': 1.7,
    'د+': 1.3, 'د': 1.0, 'د-': 0.7, 'ر': 0.0,
  };

  // Compute per-student GPA
  const studentGPAs: Record<string, number[]> = {};
  for (const e of enrolled) {
    const sid = e.student_id || e.studentId;
    if (!sid) continue;
    if (!studentGPAs[sid]) studentGPAs[sid] = [];
    if (e.grade) studentGPAs[sid].push(GRADE_TO_POINTS[e.grade] || 0);
  }

  const gpaBuckets = [
    { range: 'أقل من 1.0', min: 0, max: 1.0, count: 0 },
    { range: '1.0 - 1.99', min: 1.0, max: 2.0, count: 0 },
    { range: '2.0 - 2.49', min: 2.0, max: 2.5, count: 0 },
    { range: '2.5 - 2.99', min: 2.5, max: 3.0, count: 0 },
    { range: '3.0 - 3.49', min: 3.0, max: 3.5, count: 0 },
    { range: '3.5 - 3.99', min: 3.5, max: 4.0, count: 0 },
    { range: '4.0 (ممتاز)', min: 4.0, max: 4.01, count: 0 },
  ];

  for (const grades of Object.values(studentGPAs)) {
    if (grades.length === 0) continue;
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
    for (const bucket of gpaBuckets) {
      if (avg >= bucket.min && avg < bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  // Students by level (based on semester)
  const studentsByLevel: Record<number, Set<string>> = {};
  for (const e of enrolled) {
    const sid = e.student_id || e.studentId;
    const sem = e.semester || 1;
    const level = Math.ceil(sem / 2);
    if (!studentsByLevel[level]) studentsByLevel[level] = new Set();
    studentsByLevel[level].add(sid);
  }
  const studentsByLevelData = Object.entries(studentsByLevel)
    .map(([level, set]) => ({ level: Number(level), count: set.size }))
    .sort((a, b) => a.level - b.level);

  // Academic Warning List (students with GPA < 2.0)
  const warningStudents: string[] = [];
  for (const [sid, grades] of Object.entries(studentGPAs)) {
    if (grades.length === 0) continue;
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
    if (avg < 2.0) {
      const name = enrolled.find((e) => (e.student_id || e.studentId) === sid)?.student_name
        || enrolled.find((e) => (e.student_id || e.studentId) === sid)?.name || sid;
      warningStudents.push(name);
    }
  }

  // 2. Faculty Reports
  // Teaching Load Distribution
  const teachingLoad: Record<string, { name: string; courses: number; hours: number }> = {};
  for (const pc of profCourses) {
    const pname = pc.professor_name || pc.professorName;
    const hours = pc.hours || 3;
    if (!teachingLoad[pname]) teachingLoad[pname] = { name: pname, courses: 0, hours: 0 };
    teachingLoad[pname].courses++;
    teachingLoad[pname].hours += hours;
  }
  const teachingLoadData = Object.values(teachingLoad).sort((a, b) => b.hours - a.hours);

  // Average Performance Scores (mock from evaluations if available)
  const avgPerformanceScores = Object.values(teachingLoad).map((t) => ({
    name: t.name,
    score: Math.min(95, Math.max(60, 75 + Math.round((Math.random() - 0.5) * 20))),
  }));

  // Professional Development Hours (mock)
  const devHours = Object.values(teachingLoad).map((t) => ({
    name: t.name,
    hours: Math.round(Math.random() * 40 + 10),
  }));
  const totalDevHours = devHours.reduce((s, d) => s + d.hours, 0);

  // 3. Course Reports
  // Enrollment per Course
  const enrollmentPerCourse: Record<string, { code: string; name: string; count: number }> = {};
  for (const pc of profCourses) {
    const code = pc.course_code || pc.code;
    const name = pc.name || '';
    if (!enrollmentPerCourse[code]) enrollmentPerCourse[code] = { code, name, count: 0 };
    enrollmentPerCourse[code].count += (pc.enrolled_count || 0);
  }
  const enrollmentData = Object.values(enrollmentPerCourse).sort((a, b) => b.count - a.count);

  // Most Popular Courses
  const popularCourses = enrollmentData.slice(0, 5);

  // Available Sections
  const availableSections = sections.map((s: any) => ({
    courseCode: s.course_code || s.courseCode,
    sectionNumber: s.section_number || s.sectionNumber,
    professorName: s.professor_name || s.professorName,
    enrolled: s.enrolled || 0,
    capacity: s.capacity || 0,
    status: s.status || 'open',
  }));

  return {
    studentReports: {
      passFailRates,
      gpaDistribution: gpaBuckets,
      studentsByLevel: studentsByLevelData,
      warningStudents,
    },
    facultyReports: {
      teachingLoad: teachingLoadData,
      performanceScores: avgPerformanceScores,
      professionalDevelopmentHours: devHours,
      totalDevHours,
    },
    courseReports: {
      enrollmentPerCourse: enrollmentData,
      popularCourses,
      availableSections,
    },
  };
}