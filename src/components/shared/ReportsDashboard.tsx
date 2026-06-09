'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  FileDown,
  Printer,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface ReportData {
  studentReports: {
    passFailRates: { courseCode: string; courseName: string; totalStudents: number; passRate: number; failRate: number }[];
    gpaDistribution: { range: string; min: number; max: number; count: number }[];
    studentsByLevel: { level: number; count: number }[];
    warningStudents: string[];
  };
  facultyReports: {
    teachingLoad: { name: string; courses: number; hours: number }[];
    performanceScores: { name: string; score: number }[];
    professionalDevelopmentHours: { name: string; hours: number }[];
    totalDevHours: number;
  };
  courseReports: {
    enrollmentPerCourse: { code: string; name: string; count: number }[];
    popularCourses: { code: string; name: string; count: number }[];
    availableSections: { courseCode: string; sectionNumber: number; professorName: string; enrolled: number; capacity: number; status: string }[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-red-100 text-red-800',
  full: 'bg-amber-100 text-amber-800',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'مفتوح',
  closed: 'مغلق',
  full: 'مكتمل',
};

export default function ReportsDashboard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/reports');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>لا تتوفر بيانات التقارير حالياً</p>
      </div>
    );
  }

  const maxStudentsByLevel = Math.max(...data.studentReports.studentsByLevel.map((l) => l.count), 1);
  const maxTeachingLoad = Math.max(...data.facultyReports.teachingLoad.map((t) => t.hours), 1);
  const maxEnrollment = Math.max(...data.courseReports.enrollmentPerCourse.map((c) => c.count), 1);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Export Buttons */}
      <Card className="no-print">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              لوحة التقارير والإحصائيات
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExport} className="text-xs sm:text-sm gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                تصدير PDF
              </Button>
              <Button size="sm" variant="outline" onClick={handleExport} className="text-xs sm:text-sm gap-1.5">
                <FileDown className="w-3.5 h-3.5" />
                تصدير Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm mb-3">
          <TabsTrigger value="students" className="flex-1 min-w-0 flex items-center gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">تقارير الطلبة</span>
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex-1 min-w-0 flex items-center gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 py-1.5 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">تقارير الهيئة التدريسية</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex-1 min-w-0 flex items-center gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 py-1.5 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">تقارير المقررات</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Student Reports ── */}
        <TabsContent value="students" className="space-y-4 mt-3">
          {/* Pass/Fail Rates */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                نسب النجاح والرسوب لكل مقرر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {data.studentReports.passFailRates.map((c) => (
                  <div key={c.courseCode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium">{c.courseName} ({c.courseCode})</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{c.totalStudents} طالب</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${c.passRate}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 w-10 text-center">{c.passRate}%</span>
                    </div>
                  </div>
                ))}
                {data.studentReports.passFailRates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* GPA Distribution */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                توزيع المعدلات التراكمية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-end gap-2 sm:gap-3 h-48">
                {data.studentReports.gpaDistribution.map((b) => {
                  const maxCount = Math.max(...data.studentReports.gpaDistribution.map((g) => g.count), 1);
                  return (
                    <div key={b.range} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] sm:text-xs font-bold">{b.count}</span>
                      <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count > 0 ? 8 : 2 }}>
                        <div className="absolute inset-0 bg-blue-500 rounded-t-md opacity-80" />
                      </div>
                      <span className="text-[8px] sm:text-[10px] text-center text-muted-foreground leading-tight">{b.range}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Students by Level */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                أعداد الطلبة حسب المستوى
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2.5">
                {data.studentReports.studentsByLevel.map((l) => (
                  <div key={l.level} className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm w-20 shrink-0">المستوى {l.level}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-5 rounded-full transition-all flex items-center justify-center"
                        style={{ width: `${(l.count / maxStudentsByLevel) * 100}%` }}
                      >
                        <span className="text-[10px] text-white font-bold">{l.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {data.studentReports.studentsByLevel.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Warning List */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-red-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                قائمة الطلاب على إنذار أكاديمي
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {data.studentReports.warningStudents.length > 0 ? (
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">اسم الطالب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.studentReports.warningStudents.map((name, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{i + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا يوجد طلاب على إنذار أكاديمي</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Faculty Reports ── */}
        <TabsContent value="faculty" className="space-y-4 mt-3">
          {/* Teaching Load Distribution */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                توزيع الحمل التدريسي (ساعات)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {data.facultyReports.teachingLoad.map((t) => (
                  <div key={t.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium truncate max-w-[200px]">{t.name}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{t.courses} مقرر • {t.hours} ساعة</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-4 rounded-full transition-all"
                        style={{ width: `${(t.hours / maxTeachingLoad) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {data.facultyReports.teachingLoad.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Average Performance Scores */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                متوسط تقييمات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {data.facultyReports.performanceScores.map((p) => {
                  const color = p.score >= 85 ? 'bg-emerald-500' : p.score >= 70 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm w-40 sm:w-52 truncate shrink-0">{p.name}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div className={`${color} h-4 rounded-full transition-all`} style={{ width: `${p.score}%` }} />
                      </div>
                      <span className="text-xs font-bold w-10 text-center">{p.score}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Professional Development Summary */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                ساعات التطوير المهني
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.facultyReports.professionalDevelopmentHours.map((d) => (
                  <div key={d.name} className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5">
                    <span className="text-xs sm:text-sm font-medium truncate">{d.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0 mr-2">{d.hours} ساعة</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-bold">الإجمالي</span>
                <Badge className="bg-blue-100 text-blue-800 text-sm">{data.facultyReports.totalDevHours} ساعة</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Course Reports ── */}
        <TabsContent value="courses" className="space-y-4 mt-3">
          {/* Enrollment per Course */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                أعداد المسجلين لكل مقرر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-end gap-2 sm:gap-3 h-48">
                {data.courseReports.enrollmentPerCourse.map((c) => (
                  <div key={c.code} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold">{c.count}</span>
                    <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: `${(c.count / maxEnrollment) * 100}%`, minHeight: c.count > 0 ? 8 : 2 }}>
                      <div className="absolute inset-0 bg-blue-500 rounded-t-md opacity-80" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] text-center text-muted-foreground leading-tight truncate w-full">{c.code}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Popular Courses */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                المقررات الأكثر طلباً
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2">
                {data.courseReports.popularCourses.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 bg-slate-50 rounded-lg p-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{c.code}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{c.count} طالب</Badge>
                  </div>
                ))}
                {data.courseReports.popularCourses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Sections */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                الشعب الدراسية المتاحة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {data.courseReports.availableSections.length > 0 ? (
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">المقرر</TableHead>
                        <TableHead className="text-xs">الشعبة</TableHead>
                        <TableHead className="text-xs">المدرس</TableHead>
                        <TableHead className="text-xs text-center">المسجلين</TableHead>
                        <TableHead className="text-xs text-center">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.courseReports.availableSections.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{s.courseCode}</TableCell>
                          <TableCell className="text-xs">شعبة {s.sectionNumber}</TableCell>
                          <TableCell className="text-xs">{s.professorName}</TableCell>
                          <TableCell className="text-xs text-center">{s.enrolled}/{s.capacity}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`text-[10px] ${STATUS_COLORS[s.status] || 'bg-slate-100'}`}>
                              {STATUS_LABELS[s.status] || s.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد شعب متاحة حالياً</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}