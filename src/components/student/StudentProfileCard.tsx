'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Award,
  Mail,
  Phone,
  User,
  BookOpen,
  Calculator,
  TrendingUp,
  GraduationCap,
  Clock,
  FileText,
  ClipboardList,
  Send,
  Star,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  useEnrolledStudents,
  useCourses,
  GRADE_TO_POINTS,
  GRADE_COLORS,
  SEMESTER_NAMES,
} from '@/lib/supabase-store';
import { calculateGPA, getAcademicStatus } from '@/lib/gpa-calculator';

// Current student
const CURRENT_STUDENT_ID = 'ST-2024-001';
const CURRENT_STUDENT_NAME = 'عبدالرحمن محمد السالم';
const CURRENT_STUDENT_EMAIL = 'abdulrahman.salem@univ.edu';
const CURRENT_STUDENT_PHONE = '+966 5X XXX XXXX';

export default function StudentProfileCard() {
  const enrolledStudents = useEnrolledStudents();
  const courses = useCourses();

  // Build course hours map
  const courseHoursMap = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((c) => {
      map[c.code] = c.hours;
    });
    return map;
  }, [courses]);

  // Build course name map
  const courseNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c) => {
      map[c.code] = c.name;
    });
    return map;
  }, [courses]);

  // Get student's enrollments
  const myEnrollments = useMemo(() => {
    return enrolledStudents.filter((e) => e.studentId === CURRENT_STUDENT_ID);
  }, [enrolledStudents]);

  // Get semesters
  const studentSemesters = useMemo(() => {
    return [...new Set(myEnrollments.map((e) => e.semester))].sort((a, b) => a - b);
  }, [myEnrollments]);

  const currentSemester = studentSemesters.length > 0 ? studentSemesters[studentSemesters.length - 1] : 3;

  // Calculate GPA
  const gpaResult = useMemo(() => {
    return calculateGPA(myEnrollments, courseHoursMap);
  }, [myEnrollments, courseHoursMap]);

  const academicStatus = getAcademicStatus(gpaResult.cumulativeGPA);

  // Current semester enrollments
  const currentEnrollments = useMemo(() => {
    return myEnrollments.filter((e) => e.semester === currentSemester);
  }, [myEnrollments, currentSemester]);

  const currentSemesterHours = currentEnrollments.reduce(
    (sum, e) => sum + (courseHoursMap[e.courseCode] || 0),
    0
  );

  return (
    <div dir="rtl" className="space-y-4">
      {/* ===== Personal Info Card ===== */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-l from-slate-800 to-slate-900 text-white p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold">{CURRENT_STUDENT_NAME}</h2>
                <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs border-0">
                  {academicStatus.label}
                </Badge>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm font-mono mt-1">{CURRENT_STUDENT_ID}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 flex-row-reverse">
                  <Mail className="w-3.5 h-3.5" />
                  {CURRENT_STUDENT_EMAIL}
                </span>
                <span className="flex items-center gap-1 flex-row-reverse">
                  <Phone className="w-3.5 h-3.5" />
                  {CURRENT_STUDENT_PHONE}
                </span>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">المرحلة</p>
              <p className="text-sm sm:text-lg font-bold text-slate-800">
                {Math.ceil(currentSemester / 2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">الفصل الحالي</p>
              <p className="text-sm sm:text-lg font-bold text-slate-800">
                {SEMESTER_NAMES[currentSemester] || `الفصل ${currentSemester}`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">عدد الفصول</p>
              <p className="text-sm sm:text-lg font-bold text-slate-800">{studentSemesters.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">الحالة</p>
              <Badge className={`mt-1 ${academicStatus.bgColor} ${academicStatus.textColor} text-[10px] sm:text-xs border-0`}>
                <span className="flex items-center gap-1">
                  {academicStatus.icon === 'excellent' && <Star className="w-3 h-3" />}
                  {academicStatus.icon === 'warning' && <AlertTriangle className="w-3 h-3" />}
                  {academicStatus.icon === 'good' && <CheckCircle className="w-3 h-3" />}
                  {academicStatus.icon === 'danger' && <AlertTriangle className="w-3 h-3" />}
                  {academicStatus.label}
                </span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Academic Summary ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-t-4 border-t-emerald-500">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المعدل التراكمي</span>
            </div>
            <p className={`text-xl sm:text-3xl font-bold ${academicStatus.textColor}`}>
              {gpaResult.cumulativeGPA.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">من 4.00</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-sky-500">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">الساعات المكتسبة</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-slate-800">{gpaResult.totalCredits}</p>
            <p className="text-[10px] text-muted-foreground mt-1">ساعة معتمدة</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المقررات المكتملة</span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-slate-800">{gpaResult.passedCourses}</p>
            <p className="text-[10px] text-muted-foreground mt-1">مقرر</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-violet-500">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المقررات الراسب فيها</span>
            </div>
            <p className={`text-xl sm:text-3xl font-bold ${gpaResult.failedCourses > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {gpaResult.failedCourses}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">مقرر</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== Academic Status Visual Indicator ===== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center shrink-0" style={{ borderColor: academicStatus.color.includes('emerald') ? '#10b981' : academicStatus.color.includes('sky') ? '#0ea5e9' : academicStatus.color.includes('amber') ? '#f59e0b' : '#ef4444' }}>
              <span className={`text-xl sm:text-2xl font-bold ${academicStatus.textColor}`}>
                {gpaResult.cumulativeGPA.toFixed(1)}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base text-slate-800">الحالة الأكاديمية</h4>
              <p className={`text-xs sm:text-sm ${academicStatus.textColor} font-medium`}>
                {academicStatus.label}
              </p>
              {/* GPA Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((gpaResult.cumulativeGPA / 4.0) * 100, 100)}%`,
                    backgroundColor: academicStatus.color.includes('emerald') ? '#10b981' : academicStatus.color.includes('sky') ? '#0ea5e9' : academicStatus.color.includes('amber') ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0.00</span>
                <span>معدل الإنذار: 2.00</span>
                <span>التميز: 3.50</span>
                <span>4.00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Current Enrolled Courses ===== */}
      <Card>
        <CardHeader className="p-3 sm:p-4 sm:pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              المقررات المسجل بها - {SEMESTER_NAMES[currentSemester] || `الفصل ${currentSemester}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                <Clock className="w-3 h-3 ml-1" />
                {currentSemesterHours} ساعة
              </Badge>
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                {currentEnrollments.length} مقرر
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentEnrollments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs sm:text-sm">لا توجد مقررات مسجل بها لهذا الفصل</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right p-2 sm:p-3 text-[10px] sm:text-xs">رمز</TableHead>
                    <TableHead className="text-right p-2 sm:p-3 text-[10px] sm:text-xs">المقرر</TableHead>
                    <TableHead className="text-center p-2 sm:p-3 text-[10px] sm:text-xs">ساعات</TableHead>
                    <TableHead className="text-center p-2 sm:p-3 text-[10px] sm:text-xs">التقدير</TableHead>
                    <TableHead className="text-center p-2 sm:p-3 text-[10px] sm:text-xs">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEnrollments.map((enrollment) => {
                    const gradeClass = enrollment.grade
                      ? GRADE_COLORS[enrollment.grade] || 'text-muted-foreground'
                      : 'text-muted-foreground';
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="p-2 sm:p-3 font-mono text-[10px] sm:text-xs">
                          {enrollment.courseCode}
                        </TableCell>
                        <TableCell className="p-2 sm:p-3 text-[10px] sm:text-xs">
                          {courseNameMap[enrollment.courseCode] || enrollment.courseCode}
                        </TableCell>
                        <TableCell className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">
                          {courseHoursMap[enrollment.courseCode] || '—'}
                        </TableCell>
                        <TableCell className="p-2 sm:p-3 text-center">
                          {enrollment.grade ? (
                            <span className={`text-sm sm:text-lg ${gradeClass}`}>
                              {enrollment.grade}
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="p-2 sm:p-3 text-center">
                          {enrollment.status === 'active' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs border-0">
                              {enrollment.grade ? 'مكتمل' : 'جاري'}
                            </Badge>
                          ) : enrollment.status === 'withdrawn' ? (
                            <Badge className="bg-red-100 text-red-800 text-[10px] sm:text-xs border-0">
                              منسحب
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs border-0">
                              غير مكتمل
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== Semester GPA Trend ===== */}
      {gpaResult.semesterGPAs.length > 0 && (
        <Card>
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              تطور المعدل الفصلي
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2">
              {gpaResult.semesterGPAs.map((sem) => {
                const pct = Math.min((sem.gpa / 4.0) * 100, 100);
                const status = getAcademicStatus(sem.gpa);
                return (
                  <div key={sem.semester} className="flex items-center gap-3">
                    <span className="text-[10px] sm:text-xs text-muted-foreground w-20 shrink-0 text-left">
                      {SEMESTER_NAMES[sem.semester]?.replace('الفصل ', '') || `ف${sem.semester}`}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: status.color.includes('emerald') ? '#10b981' : status.color.includes('sky') ? '#0ea5e9' : status.color.includes('amber') ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold w-10 text-left ${status.textColor}`}>
                      {sem.gpa.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] w-10 justify-center shrink-0">
                      {sem.credits}س
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Quick Actions ===== */}
      <Card>
        <CardHeader className="p-3 sm:p-4 sm:pb-2">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm h-auto py-3"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('app-notification', {
                    detail: { message: 'سيتم فتح كشف الدرجات قريباً', isError: false },
                  })
                );
              }}
            >
              <FileText className="w-4 h-4" />
              <span>عرض كشف الدرجات</span>
            </Button>
            <Button
              className="flex items-center justify-center gap-2 text-xs sm:text-sm h-auto py-3 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('app-notification', {
                    detail: { message: 'سيتم فتح التسجيل قريباً', isError: false },
                  })
                );
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>تسجيل المقررات</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm h-auto py-3"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('app-notification', {
                    detail: { message: 'سيتم فتح الطلبات قريباً', isError: false },
                  })
                );
              }}
            >
              <Send className="w-4 h-4" />
              <span>تقديم طلب</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
