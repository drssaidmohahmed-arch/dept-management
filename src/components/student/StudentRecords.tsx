'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calculator, TrendingUp, Award } from 'lucide-react';
import {
  useEnrolledStudents,
  useCourses,
  SEMESTER_NAMES,
  GRADE_TO_POINTS,
  GRADE_COLORS,
} from '@/lib/supabase-store';
import { calculateGPA, getAcademicStatus } from '@/lib/gpa-calculator';

// Current student (hardcoded since no auth)
const CURRENT_STUDENT_ID = 'ST-2024-001';
const CURRENT_STUDENT_NAME = 'عبدالرحمن محمد السالم';

export default function StudentRecords() {
  const enrolledStudents = useEnrolledStudents();
  const courses = useCourses();
  const [activeSemester, setActiveSemester] = useState<number | null>(null);

  // Filter enrollments for current student
  const myEnrollments = useMemo(() => {
    return enrolledStudents.filter((e) => e.studentId === CURRENT_STUDENT_ID);
  }, [enrolledStudents]);

  // Build course lookup map
  const courseMap = useMemo(() => {
    const map: Record<string, typeof courses[0]> = {};
    courses.forEach((c) => {
      map[c.code] = c;
    });
    return map;
  }, [courses]);

  // Get unique semesters from enrollments
  const studentSemesters = useMemo(() => {
    const sems = [...new Set(myEnrollments.map((e) => e.semester))].sort((a, b) => a - b);
    return sems;
  }, [myEnrollments]);

  // Set initial active semester to latest
  const activeSem = activeSemester ?? (studentSemesters.length > 0 ? studentSemesters[studentSemesters.length - 1] : 1);

  // Enrollments for active semester
  const semesterEnrollments = useMemo(() => {
    return myEnrollments.filter((e) => e.semester === activeSem);
  }, [myEnrollments, activeSem]);

  // Auto-calculated GPA from GPA calculator library
  const gpaResult = useMemo(() => {
    const courseHoursMap: Record<string, number> = {};
    courses.forEach((c) => { courseHoursMap[c.code] = c.hours; });
    return calculateGPA(myEnrollments, courseHoursMap);
  }, [myEnrollments, courses]);

  // Calculate total hours earned from auto-calculated result
  const totalHoursEarned = gpaResult.totalCredits;

  const currentSemesterGPA = gpaResult.semesterGPAs.length > 0
    ? gpaResult.semesterGPAs[gpaResult.semesterGPAs.length - 1].gpa
    : 0;
  const cumulativeGPA = gpaResult.cumulativeGPA;

  const gpaColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-emerald-600';
    if (gpa >= 3.0) return 'text-sky-600';
    if (gpa >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const academicStatus = getAcademicStatus(cumulativeGPA);

  // Calculate hours for active semester
  const semesterHours = semesterEnrollments.reduce((sum, e) => {
    return sum + (courseMap[e.courseCode]?.hours || 0);
  }, 0);

  // Per-semester GPA for display from auto-calculated result
  const semesterGPA = (sem: number) => {
    const found = gpaResult.semesterGPAs.find((s) => s.semester === sem);
    return found ? found.gpa : 0;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Student Info */}
      <Card className="bg-gradient-to-l from-slate-800 to-slate-900 text-white border-0">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-row-reverse">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">{CURRENT_STUDENT_NAME}</h3>
              <p className="text-slate-300 text-[10px] sm:text-xs font-mono">{CURRENT_STUDENT_ID}</p>
            </div>
            <div className="mr-auto">
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs border-0">
                {studentSemesters.length} فصل
              </Badge>
              <Badge className={`${academicStatus.bgColor} ${academicStatus.textColor} text-[10px] sm:text-xs border-0 mr-1`}>
                معدل {cumulativeGPA.toFixed(2)} - {academicStatus.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPA Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المعدل الفصلي</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${gpaColor(currentSemesterGPA)}`}>
              {currentSemesterGPA.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المعدل التراكمي</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${gpaColor(cumulativeGPA)}`}>
              {cumulativeGPA.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">الساعات المكتسبة</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{totalHoursEarned}</p>
          </CardContent>
        </Card>
      </div>

      {/* No data state */}
      {studentSemesters.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm sm:text-base">لا توجد سجلات أكاديمية حالياً</p>
            <p className="text-xs sm:text-sm mt-1">قم بالتسجيل في المقررات أولاً</p>
          </CardContent>
        </Card>
      ) : (
        /* Semester Tabs */
        <Tabs
          value={String(activeSem)}
          onValueChange={(v) => setActiveSemester(Number(v))}
        >
          <TabsList className="flex w-full overflow-x-auto h-auto">
            {studentSemesters.map((sem) => (
              <TabsTrigger
                key={sem}
                value={String(sem)}
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 shrink-0 min-w-[80px] sm:min-w-auto"
              >
                <span className="sm:hidden">
                  {SEMESTER_NAMES[sem]?.replace('الفصل ', '') || `ف${sem}`}
                </span>
                <span className="hidden sm:inline">
                  {SEMESTER_NAMES[sem] || `الفصل ${sem}`}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {studentSemesters.map((sem) => {
            const semEnroll = myEnrollments.filter((e) => e.semester === sem);
            const semHours = semEnroll.reduce((sum, e) => sum + (courseMap[e.courseCode]?.hours || 0), 0);
            const semGPA = semesterGPA(sem);

            return (
              <TabsContent key={sem} value={String(sem)} className="mt-3 sm:mt-4">
                <Card>
                  <CardHeader className="p-3 sm:p-4 sm:pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-base">
                        {SEMESTER_NAMES[sem] || `الفصل ${sem}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {semHours} ساعة
                        </Badge>
                        <Badge
                          className={`text-[10px] sm:text-xs ${
                            semGPA >= 3.5
                              ? 'bg-emerald-100 text-emerald-800'
                              : semGPA >= 3.0
                              ? 'bg-sky-100 text-sky-800'
                              : semGPA >= 2.5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          معدل {semGPA.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <table className="w-full text-xs sm:text-sm min-w-[450px]">
                        <thead>
                          <tr className="border-b bg-slate-50">
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs">#</th>
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs">رمز المقرر</th>
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs">اسم المقرر</th>
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs text-center">الساعات</th>
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs text-center">التقدير</th>
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs text-center">النقاط</th>
                            <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs text-center">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semEnroll.map((enrollment, j) => {
                            const course = courseMap[enrollment.courseCode];
                            const points = enrollment.grade ? (GRADE_TO_POINTS[enrollment.grade] ?? 0) : null;
                            const gradeClass = enrollment.grade ? (GRADE_COLORS[enrollment.grade] || 'text-muted-foreground') : 'text-muted-foreground';

                            return (
                              <tr
                                key={enrollment.id}
                                className={`border-b hover:bg-slate-50 transition-colors ${
                                  enrollment.status === 'withdrawn'
                                    ? 'bg-red-50/50'
                                    : enrollment.status === 'incomplete'
                                    ? 'bg-amber-50/50'
                                    : ''
                                }`}
                              >
                                <td className="p-2 sm:p-3 text-muted-foreground text-[10px] sm:text-xs">{j + 1}</td>
                                <td className="p-2 sm:p-3 font-mono text-[10px] sm:text-xs">{enrollment.courseCode}</td>
                                <td className="p-2 sm:p-3 text-[10px] sm:text-xs">
                                  {course?.name || enrollment.courseCode}
                                </td>
                                <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">
                                  {course?.hours || '—'}
                                </td>
                                <td className="p-2 sm:p-3 text-center">
                                  {enrollment.grade ? (
                                    <span className={`text-sm sm:text-lg ${gradeClass}`}>
                                      {enrollment.grade}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-[10px] sm:text-xs">—</span>
                                  )}
                                </td>
                                <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">
                                  {points !== null ? points.toFixed(1) : '—'}
                                </td>
                                <td className="p-2 sm:p-3 text-center">
                                  {enrollment.status === 'active' ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs border-0">
                                      مكتمل
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
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t bg-slate-50 font-medium">
                            <td colSpan={3} className="p-2 sm:p-3 text-[10px] sm:text-xs">
                              إجمالي الساعات
                            </td>
                            <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">{semHours}</td>
                            <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">
                              <span className={gpaColor(semGPA)}>{semGPA.toFixed(2)}</span>
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
