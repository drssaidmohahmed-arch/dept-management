'use client';

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Users,
  GraduationCap,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Award,
  ClipboardCheck,
  FileBarChart,
  Clock,
} from "lucide-react";
import {
  useProfessorCourses,
  useEnrolledStudents,
  SEMESTER_NAMES,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  GRADE_TO_POINTS,
  GRADE_COLORS,
} from "@/lib/supabase-store";

// Current logged-in professor (mock)
const CURRENT_PROFESSOR = "د. أحمد محمد الشريف";

export default function CourseStudentsList() {
  const professorCourses = useProfessorCourses();
  const enrolledStudents = useEnrolledStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSemester, setFilterSemester] = useState<number>(1);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<string | null>(null);

  // Filter courses for current professor
  const myCourses = useMemo(() => {
    return professorCourses
      .filter((c) => c.professorName === CURRENT_PROFESSOR)
      .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code));
  }, [professorCourses]);

  // Courses per semester
  const coursesBySemester = useMemo(() => {
    const grouped: Record<number, typeof myCourses> = {};
    myCourses.forEach((c) => {
      if (!grouped[c.semester]) grouped[c.semester] = [];
      grouped[c.semester].push(c);
    });
    return grouped;
  }, [myCourses]);

  // Unique semesters that have courses
  const semesters = useMemo(() => {
    return Object.keys(coursesBySemester)
      .map(Number)
      .sort((a, b) => a - b);
  }, [coursesBySemester]);

  // Students in selected semester courses
  const semesterCourseStudents = useMemo(() => {
    const semesterCourses = coursesBySemester[filterSemester] || [];
    const courseCodes = semesterCourses.map((c) => c.code);
    return enrolledStudents.filter((s) =>
      courseCodes.includes(s.courseCode) && s.semester === filterSemester
    );
  }, [enrolledStudents, coursesBySemester, filterSemester]);

  // Search filter
  const filteredStudents = useMemo(() => {
    if (searchQuery.trim() === "") return semesterCourseStudents;
    return semesterCourseStudents.filter((s) =>
      s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
    );
  }, [semesterCourseStudents, searchQuery]);

  // Stats for current semester
  const semesterStats = useMemo(() => {
    const courses = coursesBySemester[filterSemester] || [];
    const students = semesterCourseStudents;
    const totalEnrollments = students.length;
    const uniqueStudents = new Set(students.map((s) => s.studentId)).size;
    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)
      : 0;
    const gradedStudents = students.filter((s) => s.grade);
    const avgGPA = gradedStudents.length > 0
      ? (gradedStudents.reduce((sum, s) => sum + (GRADE_TO_POINTS[s.grade!] || 0), 0) / gradedStudents.length)
      : 0;
    const withdrawn = students.filter((s) => s.status === "withdrawn").length;
    const incomplete = students.filter((s) => s.status === "incomplete").length;
    const excellent = students.filter((s) => {
      const pts = GRADE_TO_POINTS[s.grade || ""] || 0;
      return pts >= 3.7;
    }).length;

    return {
      totalCourses: courses.length,
      totalEnrollments,
      uniqueStudents,
      avgAttendance,
      avgGPA,
      withdrawn,
      incomplete,
      excellent,
    };
  }, [coursesBySemester, filterSemester, semesterCourseStudents]);

  // Get students for a specific course in the selected semester
  const getCourseStudents = (courseCode: string) => {
    return filteredStudents.filter((s) => s.courseCode === courseCode);
  };

  // Course stats
  const getCourseStats = (courseCode: string) => {
    const students = getCourseStudents(courseCode);
    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)
      : 0;
    const graded = students.filter((s) => s.grade);
    const avgGPA = graded.length > 0
      ? graded.reduce((sum, s) => sum + (GRADE_TO_POINTS[s.grade!] || 0), 0) / graded.length
      : 0;
    return { count: students.length, avgAttendance, avgGPA };
  };

  const attendanceColor = (val: number) => {
    if (val >= 90) return "text-emerald-600";
    if (val >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const attendanceBarColor = (val: number) => {
    if (val >= 90) return "bg-emerald-500";
    if (val >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "مقررات الفصل",
              value: semesterStats.totalCourses,
              icon: BookOpen,
              color: "bg-sky-50 text-sky-700",
            },
            {
              label: "الطلبة المسجلون",
              value: semesterStats.uniqueStudents,
              icon: GraduationCap,
              color: "bg-purple-50 text-purple-700",
            },
            {
              label: "متوسط الحضور",
              value: `${semesterStats.avgAttendance}%`,
              icon: Clock,
              color: semesterStats.avgAttendance >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            },
            {
              label: "متوسط المعدل",
              value: semesterStats.avgGPA.toFixed(2),
              icon: TrendingUp,
              color: semesterStats.avgGPA >= 3.0 ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex flex-row-reverse items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alert Cards */}
        {(semesterStats.withdrawn > 0 || semesterStats.incomplete > 0) && (
          <div className="flex gap-3">
            {semesterStats.withdrawn > 0 && (
              <div className="flex-1 flex flex-row-reverse items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <UserX className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">
                  <strong>{semesterStats.withdrawn}</strong> طالب منسحب في هذا الفصل
                </p>
              </div>
            )}
            {semesterStats.incomplete > 0 && (
              <div className="flex-1 flex flex-row-reverse items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>{semesterStats.incomplete}</strong> طالب حالة غير مكتملة
                </p>
              </div>
            )}
          </div>
        )}

        {/* Semester Selector + Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">الفصل الدراسي:</span>
                <Select
                  value={String(filterSemester)}
                  onValueChange={(v) => {
                    setFilterSemester(Number(v));
                    setExpandedCourse(null);
                    setSelectedStudentDetail(null);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        {SEMESTER_NAMES[sem]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالرقم الجامعي أو اسم الطالب..."
                  className="ps-9"
                />
              </div>

              <Badge variant="outline" className="text-xs shrink-0">
                {CURRENT_PROFESSOR}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Courses List with Expandable Students */}
        {semesters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد مقررات مسندة لك في الفصل الدراسي الحالي</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(coursesBySemester[filterSemester] || []).map((course) => {
              const isExpanded = expandedCourse === course.code;
              const stats = getCourseStats(course.code);
              const courseStudents = getCourseStudents(course.code);

              // Grade distribution for this course
              const gradeDist = useMemo(() => {
                const dist: Record<string, number> = {};
                courseStudents.forEach((s) => {
                  if (s.grade) {
                    dist[s.grade] = (dist[s.grade] || 0) + 1;
                  }
                });
                return Object.entries(dist).sort((a, b) => (GRADE_TO_POINTS[b[0]] || 0) - (GRADE_TO_POINTS[a[0]] || 0));
              }, [courseStudents]);

              return (
                <Card
                  key={course.code}
                  className={`overflow-hidden transition-shadow hover:shadow-md ${isExpanded ? "ring-2 ring-sky-200" : ""}`}
                >
                  {/* Course Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedCourse(isExpanded ? null : course.code)}
                  >
                    <div className="flex flex-row-reverse items-center gap-4">
                      {/* Course Icon */}
                      <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-slate-800">{course.name}</h3>
                          <Badge variant="outline" className="text-xs font-mono">{course.code}</Badge>
                          <Badge variant="secondary" className="text-xs">{course.hours} ساعة</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex flex-row-reverse items-center gap-1">
                            <Users className="w-3 h-3" />
                            {stats.count} طالب
                          </span>
                          <span className={`flex flex-row-reverse items-center gap-1 ${attendanceColor(stats.avgAttendance)}`}>
                            <Clock className="w-3 h-3" />
                            حضور {stats.avgAttendance}%
                          </span>
                          <span className={`flex flex-row-reverse items-center gap-1 ${stats.avgGPA >= 3.0 ? "text-sky-600" : "text-amber-600"}`}>
                            <TrendingUp className="w-3 h-3" />
                            معدل {stats.avgGPA.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Student List */}
                  {isExpanded && (
                    <div className="border-t bg-slate-50/50">
                      {/* Grade Distribution Bar */}
                      {gradeDist.length > 0 && (
                        <div className="px-4 py-3 border-b">
                          <p className="text-xs font-medium text-slate-600 mb-2">توزيع الدرجات</p>
                          <div className="flex items-center gap-1 h-6">
                            {gradeDist.map(([grade, count]) => (
                              <Tooltip key={grade}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`flex items-center justify-center text-xs font-bold rounded-sm ${GRADE_COLORS[grade] || "text-slate-600"}`}
                                    style={{
                                      width: `${(count / courseStudents.length) * 100}%`,
                                      minWidth: "28px",
                                      backgroundColor: (() => {
                                        const pts = GRADE_TO_POINTS[grade] || 0;
                                        if (pts >= 3.7) return "#dcfce7";
                                        if (pts >= 3.0) return "#e0f2fe";
                                        if (pts >= 2.0) return "#fef3c7";
                                        return "#fee2e2";
                                      })(),
                                    }}
                                  >
                                    {count > 1 ? `${grade} (${count})` : grade}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {grade} - {count} طالب
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Students Table */}
                      {courseStudents.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          لا يوجد طلبة مسجلون حالياً
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-slate-100/80">
                                <th className="text-right p-3 font-medium text-xs">#</th>
                                <th className="text-right p-3 font-medium text-xs">الرقم الجامعي</th>
                                <th className="text-right p-3 font-medium text-xs">اسم الطالب</th>
                                <th className="text-center p-3 font-medium text-xs">نصفي</th>
                                <th className="text-center p-3 font-medium text-xs">نهائي</th>
                                <th className="text-center p-3 font-medium text-xs">أعمال</th>
                                <th className="text-center p-3 font-medium text-xs">الحضور</th>
                                <th className="text-center p-3 font-medium text-xs">التقدير</th>
                                <th className="text-center p-3 font-medium text-xs">الحالة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {courseStudents.map((student, idx) => {
                                const totalMark =
                                  (student.midTermMark || 0) +
                                  (student.finalMark || 0) +
                                  (student.assignmentsMark || 0);
                                const isDetailOpen = selectedStudentDetail === student.id;

                                return (
                                  <tr
                                    key={student.id}
                                    className={`border-b transition-colors ${
                                      student.status === "withdrawn"
                                        ? "bg-red-50/50"
                                        : student.status === "incomplete"
                                        ? "bg-amber-50/50"
                                        : "hover:bg-white"
                                    }`}
                                  >
                                    <td className="p-3 text-muted-foreground text-xs">{idx + 1}</td>
                                    <td className="p-3 font-mono text-xs text-slate-600">{student.studentId}</td>
                                    <td className="p-3 font-medium text-slate-800">{student.name}</td>
                                    <td className="p-3 text-center text-xs">{student.midTermMark ?? "—"}</td>
                                    <td className="p-3 text-center text-xs">{student.finalMark ?? "—"}</td>
                                    <td className="p-3 text-center text-xs">{student.assignmentsMark ?? "—"}</td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <div className="w-12 bg-slate-200 rounded-full h-1.5">
                                          <div
                                            className={`h-1.5 rounded-full ${attendanceBarColor(student.attendance)}`}
                                            style={{ width: `${student.attendance}%` }}
                                          />
                                        </div>
                                        <span className={`text-xs font-medium ${attendanceColor(student.attendance)}`}>
                                          {student.attendance}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center">
                                      {student.grade ? (
                                        <span className={`text-base ${GRADE_COLORS[student.grade] || "text-slate-600"}`}>
                                          {student.grade}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">—</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge className={`text-xs ${STUDENT_STATUS_COLORS[student.status]}`}>
                                        {STUDENT_STATUS_LABELS[student.status]}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            {/* Summary Row */}
                            <tfoot>
                              <tr className="border-t-2 border-slate-200 bg-slate-100/60 font-medium">
                                <td colSpan={2} className="p-3 text-xs text-slate-600">
                                  الإجمالي
                                </td>
                                <td className="p-3 text-xs text-slate-600">
                                  {courseStudents.length} طالب
                                </td>
                                <td className="p-3 text-center text-xs">
                                  {courseStudents.reduce((sum, s) => sum + (s.midTermMark || 0), 0) > 0
                                    ? Math.round(
                                        courseStudents.reduce((sum, s) => sum + (s.midTermMark || 0), 0) /
                                        courseStudents.filter((s) => s.midTermMark).length
                                      )
                                    : "—"}
                                </td>
                                <td className="p-3 text-center text-xs">
                                  {courseStudents.reduce((sum, s) => sum + (s.finalMark || 0), 0) > 0
                                    ? Math.round(
                                        courseStudents.reduce((sum, s) => sum + (s.finalMark || 0), 0) /
                                        courseStudents.filter((s) => s.finalMark).length
                                      )
                                    : "—"}
                                </td>
                                <td className="p-3 text-center text-xs">
                                  {courseStudents.reduce((sum, s) => sum + (s.assignmentsMark || 0), 0) > 0
                                    ? Math.round(
                                        courseStudents.reduce((sum, s) => sum + (s.assignmentsMark || 0), 0) /
                                        courseStudents.filter((s) => s.assignmentsMark).length
                                      )
                                    : "—"}
                                </td>
                                <td className="p-3 text-center text-xs">
                                  <span className={attendanceColor(stats.avgAttendance)}>
                                    {stats.avgAttendance}%
                                  </span>
                                </td>
                                <td className="p-3 text-center text-xs">
                                  {stats.avgGPA > 0 ? stats.avgGPA.toFixed(2) : "—"}
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer Summary */}
        <p className="text-xs text-muted-foreground text-center">
          عرض مقررات الفصل {SEMESTER_NAMES[filterSemester]} - {filteredStudents.length} تسجيل في {myCourses.filter((c) => c.semester === filterSemester).length} مقرر
        </p>
      </div>
    </TooltipProvider>
  );
}
