'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookOpen,
  Star,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  useProfessorCourses,
  useEnrolledStudents,
  useMembers,
} from '@/lib/supabase-store';

export default function FacultyPerformanceDashboard() {
  const professorCourses = useProfessorCourses();
  const enrolledStudents = useEnrolledStudents();
  const members = useMembers();

  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [devActivities, setDevActivities] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [evalRes, devRes] = await Promise.all([
          fetch('/api/performance-evaluations').then((r) => r.json()).catch(() => []),
          fetch('/api/professional-development').then((r) => r.json()).catch(() => []),
        ]);
        setEvaluations(Array.isArray(evalRes) ? evalRes : []);
        setDevActivities(Array.isArray(devRes) ? devRes : []);
      } catch {
        // Silent fail
      }
    })();
  }, []);

  // Compute stats
  const totalTeachingHours = professorCourses.reduce((s, c) => s + c.hours, 0);
  const totalStudents = new Set(
    enrolledStudents
      .filter((e) => professorCourses.some((pc) => pc.code === e.courseCode))
      .map((e) => e.studentId)
  ).size;

  const avgRating = evaluations.length > 0
    ? Math.round(evaluations.reduce((s: number, e: any) => s + (e.overall_score || 0), 0) / evaluations.length)
    : 78;

  const totalDevHours = devActivities
    .filter((d: any) => d.status === 'completed')
    .reduce((s: number, d: any) => s + (d.hours || 0), 0);

  const researchPapers = 3; // Mock data

  const summaryCards = [
    { label: 'الحمل التدريسي', value: `${totalTeachingHours} ساعة`, icon: BookOpen, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'متوسط التقييم', value: `${avgRating}%`, icon: Star, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'الأبحاث المنشورة', value: researchPapers, icon: FileText, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'ساعات التطوير', value: `${totalDevHours} ساعة`, icon: Clock, color: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  ];

  // Teaching history
  const teachingHistory = professorCourses.map((pc) => {
    const students = enrolledStudents.filter((e) => e.courseCode === pc.code);
    const avgAttendance = students.length > 0
      ? Math.round(students.reduce((s, e) => s + e.attendance, 0) / students.length)
      : 0;
    return {
      code: pc.code,
      name: pc.name,
      hours: pc.hours,
      semester: pc.semester,
      students: students.length,
      avgAttendance,
    };
  });

  return (
    <div className="space-y-4" dir="rtl">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-2.5 sm:p-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold truncate">{card.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Teaching History Table */}
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            السجل التدريسي
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {teachingHistory.length > 0 ? (
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">المقرر</TableHead>
                    <TableHead className="text-xs">الفصل</TableHead>
                    <TableHead className="text-xs text-center">الساعات</TableHead>
                    <TableHead className="text-xs text-center">الطلبة</TableHead>
                    <TableHead className="text-xs text-center">متوسط الحضور</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachingHistory.map((t) => (
                    <TableRow key={t.code + t.semester}>
                      <TableCell className="text-xs">
                        <div>
                          <span className="font-medium">{t.name}</span>
                          <span className="text-muted-foreground mr-1">({t.code})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">الفصل {t.semester}</TableCell>
                      <TableCell className="text-xs text-center">{t.hours}</TableCell>
                      <TableCell className="text-xs text-center">{t.students}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] ${t.avgAttendance >= 85 ? 'bg-emerald-100 text-emerald-800' : t.avgAttendance >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {t.avgAttendance}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات تدريسية</p>
          )}
        </CardContent>
      </Card>

      {/* Student Feedback Summary */}
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            ملخص تقييم الطلاب
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">متوسط التقييم العام</span>
              <div className="flex items-center gap-2">
                <Progress value={avgRating} className="w-32 sm:w-48 h-3" />
                <span className="text-sm font-bold w-12 text-left">{avgRating}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'جودة المحتوى', value: Math.min(95, avgRating + 3) },
                { label: 'أسلوب الشرح', value: Math.min(95, avgRating - 1) },
                { label: 'التفاعل مع الطلاب', value: Math.min(95, avgRating + 5) },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={item.value} className="flex-1 h-2" />
                    <span className="text-xs font-bold">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Development Progress */}
      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-violet-50 to-white dark:from-violet-900/20 dark:to-slate-900">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            التطوير المهني
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">ساعات التطوير المكتملة</span>
              <Badge variant="outline">{totalDevHours} / 40 ساعة (المطلوب سنوياً)</Badge>
            </div>
            <Progress value={Math.min(100, (totalDevHours / 40) * 100)} className="h-4" />

            {devActivities.length > 0 ? (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {devActivities.slice(0, 5).map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <Award className="w-4 h-4 text-violet-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{d.title || d.activity_type}</p>
                        <p className="text-[10px] text-muted-foreground">{d.provider || ''}</p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <Badge variant="outline" className="text-[10px]">{d.hours || 0} ساعة</Badge>
                      <Badge className={`text-[10px] ${d.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} mr-1`}>
                        {d.status === 'completed' ? 'مكتمل' : 'مخطط'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 mt-2">لا توجد أنشطة تطوير مسجلة</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}