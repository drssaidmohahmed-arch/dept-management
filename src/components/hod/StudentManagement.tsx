'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Users,
  Search,
  GraduationCap,
  Award,
  TrendingUp,
  Eye,
  Calculator,
} from 'lucide-react';
import {
  useEnrolledStudents,
  useCourses,
  SEMESTER_NAMES,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  GRADE_TO_POINTS,
  GRADE_COLORS,
} from '@/lib/supabase-store';

interface StudentSummary {
  studentId: string;
  name: string;
  enrollmentsCount: number;
  gpa: number;
  totalHours: number;
  latestSemester: number;
  activeEnrollments: number;
}

export default function StudentManagement() {
  const enrolledStudents = useEnrolledStudents();
  const courses = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Build course lookup
  const courseMap = useMemo(() => {
    const map: Record<string, typeof courses[0]> = {};
    courses.forEach((c) => {
      map[c.code] = c;
    });
    return map;
  }, [courses]);

  // Get unique students with summary
  const studentsSummary = useMemo(() => {
    const studentMap: Record<string, StudentSummary> = {};

    enrolledStudents.forEach((e) => {
      if (!studentMap[e.studentId]) {
        studentMap[e.studentId] = {
          studentId: e.studentId,
          name: e.name,
          enrollmentsCount: 0,
          gpa: 0,
          totalHours: 0,
          latestSemester: 0,
          activeEnrollments: 0,
        };
      }

      const summary = studentMap[e.studentId];
      summary.enrollmentsCount += 1;
      if (e.semester > summary.latestSemester) {
        summary.latestSemester = e.semester;
      }
      if (e.status === 'active') {
        summary.activeEnrollments += 1;
      }
    });

    // Calculate GPA and hours for each student
    Object.values(studentMap).forEach((summary) => {
      const studentEnrollments = enrolledStudents.filter(
        (e) => e.studentId === summary.studentId
      );
      let totalPoints = 0;
      let totalHours = 0;
      studentEnrollments.forEach((e) => {
        if (e.grade && e.status === 'active') {
          const hours = courseMap[e.courseCode]?.hours || 0;
          const points = GRADE_TO_POINTS[e.grade] ?? 0;
          totalPoints += points * hours;
          totalHours += hours;
        }
      });
      summary.gpa = totalHours > 0 ? totalPoints / totalHours : 0;
      summary.totalHours = totalHours;
    });

    return Object.values(studentMap).sort((a, b) =>
      a.studentId.localeCompare(b.studentId)
    );
  }, [enrolledStudents, courseMap]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentsSummary;
    const q = searchQuery.trim();
    return studentsSummary.filter(
      (s) =>
        s.studentId.includes(q) ||
        s.name.includes(q)
    );
  }, [studentsSummary, searchQuery]);

  // Get detailed enrollment data for selected student
  const selectedStudentEnrollments = useMemo(() => {
    if (!selectedStudent) return [];
    return enrolledStudents.filter(
      (e) => e.studentId === selectedStudent.studentId
    );
  }, [enrolledStudents, selectedStudent]);

  // Group enrollments by semester for detail view
  const enrollmentsBySemester = useMemo(() => {
    const grouped: Record<number, typeof selectedStudentEnrollments> = {};
    selectedStudentEnrollments.forEach((e) => {
      if (!grouped[e.semester]) grouped[e.semester] = [];
      grouped[e.semester].push(e);
    });
    return Object.entries(grouped)
      .map(([sem, enrollments]) => ({
        semester: Number(sem),
        enrollments,
      }))
      .sort((a, b) => a.semester - b.semester);
  }, [selectedStudentEnrollments]);

  const handleViewStudent = (student: StudentSummary) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const gpaColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-emerald-600';
    if (gpa >= 3.0) return 'text-sky-600';
    if (gpa >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const gpaBadgeColor = (gpa: number) => {
    if (gpa >= 3.5) return 'bg-emerald-100 text-emerald-800';
    if (gpa >= 3.0) return 'bg-sky-100 text-sky-800';
    if (gpa >= 2.5) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالرقم الجامعي أو اسم الطالب..."
                className="ps-9 text-xs sm:text-sm"
              />
            </div>
            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
              {filteredStudents.length} طالب
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm sm:text-base">لا يوجد طلبة</p>
            <p className="text-xs sm:text-sm mt-1">
              {searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'لا توجد بيانات طلاب حالياً'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {filteredStudents.map((student) => (
            <Card
              key={student.studentId}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewStudent(student)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-row-reverse">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">
                        {student.name}
                      </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-2">
                      {student.studentId}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-1 flex-row-reverse">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {student.enrollmentsCount} مقرر
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-row-reverse">
                        <Calculator className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {student.totalHours} ساعة
                        </span>
                      </div>
                    </div>

                    {/* GPA Badge */}
                    <div className="mt-2 flex items-center gap-2 flex-row-reverse">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <Badge className={`text-[10px] sm:text-xs border-0 ${gpaBadgeColor(student.gpa)}`}>
                        المعدل: {student.gpa.toFixed(2)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs"
                      >
                        {SEMESTER_NAMES[student.latestSemester] || `فصل ${student.latestSemester}`}
                      </Badge>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 text-slate-400 hover:text-sky-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudent(student);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-row-reverse">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  <span>{selectedStudent.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">{selectedStudent.studentId}</span>
                </DialogTitle>
              </DialogHeader>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className={`text-lg sm:text-xl font-bold ${gpaColor(selectedStudent.gpa)}`}>
                    {selectedStudent.gpa.toFixed(2)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">المعدل التراكمي</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {selectedStudent.totalHours}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">الساعات المكتسبة</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {selectedStudent.enrollmentsCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">المقررات المسجلة</p>
                </div>
              </div>

              {/* Semester Details */}
              <div className="space-y-3 sm:space-y-4 mt-4">
                <h4 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2 flex-row-reverse">
                  <Award className="w-4 h-4" />
                  السجل الأكاديمي
                </h4>

                {enrollmentsBySemester.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    لا توجد تسجيلات
                  </p>
                ) : (
                  enrollmentsBySemester.map(({ semester, enrollments }) => {
                    const semHours = enrollments.reduce(
                      (sum, e) => sum + (courseMap[e.courseCode]?.hours || 0),
                      0
                    );
                    let semPoints = 0;
                    let semTotalHours = 0;
                    enrollments.forEach((e) => {
                      if (e.grade && e.status === 'active') {
                        const hours = courseMap[e.courseCode]?.hours || 0;
                        semPoints += (GRADE_TO_POINTS[e.grade] ?? 0) * hours;
                        semTotalHours += hours;
                      }
                    });
                    const semGPA = semTotalHours > 0 ? semPoints / semTotalHours : 0;

                    return (
                      <Card key={semester}>
                        <CardHeader className="p-2.5 sm:p-3 sm:pb-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xs sm:text-sm">
                              {SEMESTER_NAMES[semester] || `الفصل ${semester}`}
                            </CardTitle>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px]">
                                {semHours} ساعة
                              </Badge>
                              <Badge className={`text-[10px] border-0 ${gpaBadgeColor(semGPA)}`}>
                                معدل {semGPA.toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px] sm:text-xs">
                              <thead>
                                <tr className="border-b bg-slate-50">
                                  <th className="text-right p-2 font-medium">الرمز</th>
                                  <th className="text-right p-2 font-medium">المقرر</th>
                                  <th className="text-center p-2 font-medium">ساعة</th>
                                  <th className="text-center p-2 font-medium">التقدير</th>
                                  <th className="text-center p-2 font-medium">الحالة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {enrollments.map((e) => {
                                  const course = courseMap[e.courseCode];
                                  return (
                                    <tr
                                      key={e.id}
                                      className={`border-b ${
                                        e.status === 'withdrawn'
                                          ? 'bg-red-50/50'
                                          : e.status === 'incomplete'
                                          ? 'bg-amber-50/50'
                                          : ''
                                      }`}
                                    >
                                      <td className="p-2 font-mono">{e.courseCode}</td>
                                      <td className="p-2">
                                        {course?.name || e.courseCode}
                                      </td>
                                      <td className="p-2 text-center">
                                        {course?.hours || '—'}
                                      </td>
                                      <td className="p-2 text-center">
                                        {e.grade ? (
                                          <span className={`text-sm ${GRADE_COLORS[e.grade] || 'text-slate-600'}`}>
                                            {e.grade}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400">—</span>
                                        )}
                                      </td>
                                      <td className="p-2 text-center">
                                        <Badge className={`text-[9px] sm:text-[10px] ${STUDENT_STATUS_COLORS[e.status]}`}>
                                          {STUDENT_STATUS_LABELS[e.status]}
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
