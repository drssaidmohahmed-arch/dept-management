'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  CalendarCheck,
  BookOpen,
  AlertTriangle,
  Clock,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  PieChart,
  Activity,
  Bell,
} from 'lucide-react';
import {
  useStats,
  useStudentRequests,
  useEnrolledStudents,
  useCourses,
  useProfessorCourses,
  useMembers,
  GRADE_TO_POINTS,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  SEMESTER_NAMES,
} from '@/lib/supabase-store';

// ============ KPI Card Component ============

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  trend?: { value: number; label: string };
  trendType?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

function KPICard({ title, value, subtitle, icon: Icon, gradient, iconBg, trend, trendType, onClick }: KPICardProps) {
  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${onClick ? 'ring-1 ring-transparent hover:ring-blue-200' : ''}`}
      onClick={onClick}
    >
      <div className={`h-1.5 ${gradient}`} />
      <CardContent className="p-3 sm:p-4 pt-3">
        <div className="flex items-center justify-between gap-2 flex-row-reverse">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-1">{title}</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              {value}
            </p>
            {subtitle && (
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs ${
                trendType === 'up' ? 'text-emerald-600' : trendType === 'down' ? 'text-red-500' : 'text-slate-500'
              }`}>
                {trendType === 'up' && <ArrowUpRight className="w-3 h-3" />}
                {trendType === 'down' && <ArrowDownRight className="w-3 h-3" />}
                {trendType === 'neutral' && <Minus className="w-3 h-3" />}
                <span>{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Simple Horizontal Bar Chart ============

interface HorizontalBarData {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

function HorizontalBarChart({ data, title, icon: Icon }: { data: HorizontalBarData[]; title: string; icon: React.ElementType }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {data.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[11px] sm:text-xs text-slate-600 truncate">{item.label}</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-800 shrink-0">{item.value}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                  style={{ width: `${item.maxValue > 0 ? (item.value / item.maxValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Vertical Bar Chart (CSS) ============

interface BarData {
  label: string;
  value: number;
  color: string;
}

function VerticalBarChart({ data, title, icon: Icon }: { data: BarData[]; title: string; icon: React.ElementType }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-2">
        <div className="flex items-end justify-around gap-1 sm:gap-2 h-40 sm:h-48">
          {data.map((item) => (
            <div key={item.label} className="flex flex-col items-center flex-1 min-w-0">
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700 mb-1">{item.value}</span>
              <div className="w-full max-w-10 sm:max-w-14 rounded-t-md overflow-hidden flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ease-out ${item.color}`}
                  style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? '8px' : '0' }}
                />
              </div>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1.5 text-center truncate w-full">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Simple Pie Chart (CSS conic gradient) ============

interface PieData {
  label: string;
  value: number;
  color: string;
}

function SimplePieChart({ data, title, icon: Icon }: { data: PieData[]; title: string; icon: React.ElementType }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Build conic gradient segments
  let currentAngle = 0;
  const gradientParts: string[] = [];
  data.forEach((item) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    gradientParts.push(`${item.color} ${currentAngle}% ${currentAngle + percent}%`);
    currentAngle += percent;
  });

  const conicGradient = total > 0
    ? `conic-gradient(${gradientParts.join(', ')})`
    : 'conic-gradient(#e2e8f0 0% 100%)';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-l from-slate-50 to-white">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-2">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Pie Circle */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0">
            <div
              className="w-full h-full rounded-full transition-all duration-500"
              style={{ background: conicGradient }}
            />
            <div className="absolute inset-3 sm:inset-4 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-slate-800">{total}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">الإجمالي</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 w-full sm:w-auto">
            {data.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${item.color.replace('bg-', 'bg-').split(' ')[0]}`} style={{ backgroundColor: 'currentColor' }}>
                    <span className={`block w-3 h-3 rounded-full ${item.color}`} />
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-600 truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800">{item.value}</span>
                  <span className="text-[9px] text-muted-foreground">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Alert Card ============

interface AlertItem {
  icon: React.ElementType;
  title: string;
  description: string;
  count: number;
  color: string;
  bgColor: string;
}

function AlertCard({ alert }: { alert: AlertItem }) {
  const Icon = alert.icon;
  return (
    <div className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border ${alert.bgColor} transition-colors`}>
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${alert.color}`}>
        <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-800">{alert.title}</h4>
          <Badge className="text-[9px] px-1.5 py-0 bg-red-100 text-red-700">{alert.count}</Badge>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
      </div>
    </div>
  );
}

// ============ Main KPI Dashboard ============

export default function KPIDashboard() {
  const stats = useStats();
  const studentRequests = useStudentRequests();
  const enrolledStudents = useEnrolledStudents();
  const courses = useCourses();
  const professorCourses = useProfessorCourses();
  const members = useMembers();

  // Calculate KPIs
  const kpiData = useMemo(() => {
    // 1. Total Students
    const uniqueStudents = new Set(enrolledStudents.map(e => e.studentId));
    const totalStudents = uniqueStudents.size;

    // 2. Success Rate - students who passed (grade not 'ر')
    const graded = enrolledStudents.filter(e => e.grade);
    const passed = graded.filter(e => e.grade !== 'ر');
    const successRate = graded.length > 0 ? Math.round((passed.length / graded.length) * 100) : 0;

    // 3. Average GPA
    let totalPoints = 0;
    graded.forEach(e => {
      totalPoints += GRADE_TO_POINTS[e.grade || ''] || 0;
    });
    const avgGPA = graded.length > 0 ? Math.round((totalPoints / graded.length) * 100) / 100 : 0;

    // 4. Pending Requests
    const pendingRequests = studentRequests.filter(r => r.status === 'pending').length +
      (professorCourses.length > 0 ? 0 : 0); // Could add professor requests

    // 5. Attendance Rate
    const totalAttendance = enrolledStudents.length > 0
      ? Math.round(enrolledStudents.reduce((sum, e) => sum + e.attendance, 0) / enrolledStudents.length)
      : 0;

    // 6. Active Courses
    const uniqueCourseCodes = new Set(professorCourses.map(c => c.code));
    const activeCourses = uniqueCourseCodes.size;

    // Student Status Distribution
    const statusDistribution: HorizontalBarData[] = [
      {
        label: STUDENT_STATUS_LABELS['active'] || 'نشط',
        value: enrolledStudents.filter(e => e.status === 'active').length,
        maxValue: enrolledStudents.length || 1,
        color: 'bg-emerald-500',
      },
      {
        label: STUDENT_STATUS_LABELS['withdrawn'] || 'منسحب',
        value: enrolledStudents.filter(e => e.status === 'withdrawn').length,
        maxValue: enrolledStudents.length || 1,
        color: 'bg-red-400',
      },
      {
        label: STUDENT_STATUS_LABELS['incomplete'] || 'غير مكتمل',
        value: enrolledStudents.filter(e => e.status === 'incomplete').length,
        maxValue: enrolledStudents.length || 1,
        color: 'bg-amber-400',
      },
    ];

    // Course Performance
    const coursePerformance: BarData[] = professorCourses.slice(0, 8).map(pc => {
      const courseEnrolled = enrolledStudents.filter(e => e.courseCode === pc.code);
      const courseGraded = courseEnrolled.filter(e => e.grade);
      const coursePassed = courseGraded.filter(e => e.grade !== 'ر');
      const rate = courseGraded.length > 0 ? Math.round((coursePassed.length / courseGraded.length) * 100) : 0;
      return {
        label: pc.code,
        value: rate,
        color: rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-400' : 'bg-red-400',
      };
    });

    // Enrollment by Semester
    const semesterEnrollment: BarData[] = [1, 2, 3, 4, 5, 6]
      .map(sem => ({
        label: SEMESTER_NAMES[sem] || `${sem}`,
        value: enrolledStudents.filter(e => e.semester === sem).length,
        color: sem % 2 === 1 ? 'bg-blue-500' : 'bg-indigo-500',
      }));

    // Enrollment Status Pie
    const enrollmentPie: PieData[] = [
      { label: 'نشط', value: enrolledStudents.filter(e => e.status === 'active').length, color: '#10b981' },
      { label: 'منسحب', value: enrolledStudents.filter(e => e.status === 'withdrawn').length, color: '#ef4444' },
      { label: 'غير مكتمل', value: enrolledStudents.filter(e => e.status === 'incomplete').length, color: '#f59e0b' },
    ];

    // Alerts
    const lowAttendanceStudents = enrolledStudents.filter(e => e.attendance < 60 && e.status === 'active').length;
    const todayBookings = Math.floor(Math.random() * 5) + 2; // Simulated

    return {
      totalStudents,
      successRate,
      avgGPA,
      pendingRequests,
      totalAttendance,
      activeCourses,
      statusDistribution,
      coursePerformance,
      semesterEnrollment,
      enrollmentPie,
      lowAttendanceStudents,
      todayBookings,
    };
  }, [stats, studentRequests, enrolledStudents, courses, professorCourses, members]);

  const alerts: AlertItem[] = [
    {
      icon: AlertTriangle,
      title: 'طلاب على إنذار أكاديمي',
      description: 'يوجد طلاب بمعدل حضور أقل من 60% يحتاجون متابعة فورية.',
      count: kpiData.lowAttendanceStudents,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100',
    },
    {
      icon: ClipboardList,
      title: 'طلبات بانتظار المراجعة',
      description: 'طلبات طلاب وأساتذة معلقة وتحتاج مراجعة رئيس القسم.',
      count: kpiData.pendingRequests,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 border-violet-100',
    },
    {
      icon: Building2,
      title: 'قاعات محجوزة اليوم',
      description: 'قاعات محجوزة للاجتماعات والمحاضرات خلال اليوم الحالي.',
      count: kpiData.todayBookings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        <KPICard
          title="إجمالي الطلبة"
          value={kpiData.totalStudents}
          subtitle="طالب مسجّل"
          icon={Users}
          gradient="bg-gradient-to-l from-blue-500 to-blue-600"
          iconBg="bg-blue-50 text-blue-600"
          trend={{ value: 12, label: '+12 عن الفصل السابق' }}
          trendType="up"
        />
        <KPICard
          title="معدل النجاح"
          value={`${kpiData.successRate}%`}
          subtitle="من إجمالي المفروزين"
          icon={TrendingUp}
          gradient="bg-gradient-to-l from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-50 text-emerald-600"
          trend={{ value: kpiData.successRate, label: kpiData.successRate >= 75 ? 'ممتاز' : 'يحتاج تحسين' }}
          trendType={kpiData.successRate >= 75 ? 'up' : 'down'}
        />
        <KPICard
          title="المعدل التراكمي المتوسط"
          value={kpiData.avgGPA.toFixed(2)}
          subtitle="من 4.00"
          icon={GraduationCap}
          gradient="bg-gradient-to-l from-violet-500 to-violet-600"
          iconBg="bg-violet-50 text-violet-600"
          trend={{ value: kpiData.avgGPA, label: kpiData.avgGPA >= 3.0 ? 'جيد جداً' : 'مقبول' }}
          trendType={kpiData.avgGPA >= 3.0 ? 'up' : 'neutral'}
        />
        <KPICard
          title="الطلبات المعلقة"
          value={kpiData.pendingRequests}
          subtitle="بانتظار المراجعة"
          icon={ClipboardList}
          gradient="bg-gradient-to-l from-amber-500 to-amber-600"
          iconBg="bg-amber-50 text-amber-600"
          trend={{ value: kpiData.pendingRequests, label: kpiData.pendingRequests > 0 ? 'تحتاج مراجعة' : 'لا توجد طلبات' }}
          trendType={kpiData.pendingRequests > 0 ? 'neutral' : 'up'}
        />
        <KPICard
          title="نسبة الحضور"
          value={`${kpiData.totalAttendance}%`}
          subtitle="متوسط الحضور العام"
          icon={CalendarCheck}
          gradient="bg-gradient-to-l from-teal-500 to-teal-600"
          iconBg="bg-teal-50 text-teal-600"
          trend={{ value: kpiData.totalAttendance, label: kpiData.totalAttendance >= 80 ? 'جيد' : 'يحتاج متابعة' }}
          trendType={kpiData.totalAttendance >= 80 ? 'up' : 'down'}
        />
        <KPICard
          title="المقررات النشطة"
          value={kpiData.activeCourses}
          subtitle="مقرر هذا الفصل"
          icon={BookOpen}
          gradient="bg-gradient-to-l from-sky-500 to-sky-600"
          iconBg="bg-sky-50 text-sky-600"
          trend={{ value: kpiData.activeCourses, label: `${professorCourses.length} شعبة` }}
          trendType="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Student Status Distribution */}
        <SimplePieChart
          data={kpiData.enrollmentPie}
          title="توزيع حالات الطلبة"
          icon={PieChart}
        />

        {/* Course Performance */}
        <VerticalBarChart
          data={kpiData.coursePerformance}
          title="أداء المقررات (نسبة النجاح)"
          icon={BarChart3}
        />

        {/* Student Status Horizontal Bar */}
        <HorizontalBarChart
          data={kpiData.statusDistribution}
          title="تفاصيل حالة الطلبة"
          icon={Activity}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Enrollment by Level */}
        <VerticalBarChart
          data={kpiData.semesterEnrollment}
          title="نسبة التسجيل حسب المستوى"
          icon={GraduationCap}
        />

        {/* Important Alerts */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-4 bg-gradient-to-l from-slate-50 to-white">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              تنبيهات هامة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.title} alert={alert} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-gradient-to-bl from-blue-50 to-white rounded-xl border border-blue-100">
              <p className="text-lg sm:text-2xl font-bold text-blue-700">{stats.professors}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">أعضاء هيئة التدريس</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-bl from-cyan-50 to-white rounded-xl border border-cyan-100">
              <p className="text-lg sm:text-2xl font-bold text-cyan-700">{stats.employees}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">الموظفون الإداريون</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-bl from-emerald-50 to-white rounded-xl border border-emerald-100">
              <p className="text-lg sm:text-2xl font-bold text-emerald-700">{stats.totalAnnouncements}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">الإعلانات المنشورة</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-bl from-purple-50 to-white rounded-xl border border-purple-100">
              <p className="text-lg sm:text-2xl font-bold text-purple-700">{stats.totalRequests}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">إجمالي الطلبات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
