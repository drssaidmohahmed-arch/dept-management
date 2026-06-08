'use client';

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Plus,
  Trash2,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  ClipboardList,
  BarChart3,
  Calendar,
  Megaphone,
  TrendingUp,
  Shield,
  UserCheck,
  UsersRound,
  LayoutList,
  Clock,
  Building2,
  CalendarDays,
  Database,
  CheckCircle2,
  AlertTriangle,
  Crown,
} from "lucide-react";
import DepartmentRequestManager from "@/components/shared/DepartmentRequestManager";
import PermissionsManager from "@/components/hod/PermissionsManager";
import StudentManagement from "@/components/hod/StudentManagement";
import FacultyProfiles from "@/components/faculty/FacultyProfiles";
import TeachingSchedule from "@/components/faculty/TeachingSchedule";
import PerformanceEvaluations from "@/components/faculty/PerformanceEvaluations";
import ProfessionalDevelopment from "@/components/faculty/ProfessionalDevelopment";
import StudentDataManagement from "@/components/student-affairs/StudentDataManagement";
import AcademicAdvising from "@/components/student-affairs/AcademicAdvising";
import TrainingAndProjects from "@/components/student-affairs/TrainingAndProjects";
import StudyPlans from "@/components/courses/StudyPlans";
import CourseDescriptions from "@/components/courses/CourseDescriptions";
import CourseSections from "@/components/courses/CourseSections";
import RoomManagement from "@/components/schedules/RoomManagement";
import ScheduleView from "@/components/schedules/ScheduleView";
import {
  useAnnouncements,
  useCourses,
  addAnnouncement,
  deleteAnnouncement,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
  useStats,
} from "@/lib/supabase-store";

function useMigrationStatus() {
  const [migrated, setMigrated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/migration-status');
        const data = await res.json();
        if (!cancelled) setMigrated(data.migrated);
      } catch {
        if (!cancelled) setMigrated(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { migrated };
}

export default function HODDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"urgent" | "important" | "normal">("normal");
  const [targetRole, setTargetRole] = useState<"all" | "professors" | "employees" | "students">("all");

  const announcements = useAnnouncements();
  const stats = useStats();
  const courses = useCourses();
  const { migrated } = useMigrationStatus();

  const handleAddAnnouncement = async () => {
    if (!title.trim() || !content.trim()) return;
    await addAnnouncement({ title: title.trim(), content: content.trim(), priority, targetRole });
    setTitle("");
    setContent("");
    setPriority("normal");
    setTargetRole("all");
    setDialogOpen(false);
  };

  const statCards = [
    { label: "الإعلانات", value: stats.totalAnnouncements, icon: Megaphone, color: "bg-emerald-50 text-emerald-700" },
    { label: "الأساتذة", value: stats.professors, icon: GraduationCap, color: "bg-sky-50 text-sky-700" },
    { label: "الموظفين", value: stats.employees, icon: UserCog, color: "bg-cyan-50 text-cyan-700" },
    { label: "الطلاب", value: stats.students, icon: BookOpen, color: "bg-orange-50 text-orange-700" },
    { label: "الطلبات", value: stats.totalRequests, icon: ClipboardList, color: "bg-purple-50 text-purple-700" },
    { label: "المعدل", value: stats.averageGPA, icon: TrendingUp, color: "bg-rose-50 text-rose-700", isDecimal: true },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-l from-blue-700 to-blue-900 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Crown className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl md:text-2xl font-bold">لوحة تحكم رئيس القسم</h2>
                <p className="text-blue-200 text-[10px] sm:text-xs">نظرة شاملة على القسم الأكاديمي</p>
              </div>
            </div>
            {/* System Status Badge */}
            <Badge
              className={`text-[9px] sm:text-[10px] px-2 py-1 shrink-0 ${
                migrated === true
                  ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                  : migrated === false
                  ? "bg-amber-500/20 text-amber-100 border border-amber-400/30"
                  : "bg-white/10 text-blue-200 border border-white/20"
              }`}
            >
              {migrated === true ? (
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  قاعدة البيانات: محدثة ✓
                </span>
              ) : migrated === false ? (
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  تحتاج تحديث ⚠
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 animate-pulse" />
                  جاري الفحص...
                </span>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-row-reverse">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                      {card.isDecimal ? Number(card.value).toFixed(2) : card.value}
                    </p>
                    <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm">
          <TabsTrigger value="home" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الرئيسية</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإعلانات</span>
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">هيئة التدريس</span>
          </TabsTrigger>
          <TabsTrigger value="student-affairs" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <UsersRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">شؤون الطلاب</span>
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <LayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">المقررات</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الجداول</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الطلاب</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الطلبات</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الصلاحيات</span>
          </TabsTrigger>
        </TabsList>

        {/* Home / Overview Tab */}
        <TabsContent value="home" className="mt-3 sm:mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 sm:pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                الإحصائيات العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 sm:pt-0 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-slate-700 text-sm sm:text-base">توزيع المستخدمين</h3>
                  <div className="space-y-3">
                    {[
                      { label: "أعضاء هيئة التدريس", value: stats.professors, color: "bg-sky-500" },
                      { label: "الموظفون الإداريون", value: stats.employees, color: "bg-cyan-500" },
                      { label: "الطلاب", value: stats.students, color: "bg-orange-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm truncate">{item.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 sm:w-24 md:w-32 bg-slate-100 rounded-full h-2 sm:h-2.5">
                            <div
                              className={`${item.color} h-2 sm:h-2.5 rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min((item.value / Math.max(stats.students, 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-medium w-6 text-left">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-slate-700 text-sm sm:text-base">ملخص</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { label: "إعلان", value: stats.totalAnnouncements, color: "text-slate-800" },
                      { label: "طلب", value: stats.totalRequests, color: "text-slate-800" },
                      { label: "المعدل التراكمي", value: stats.averageGPA.toFixed(2), color: "text-emerald-600" },
                      { label: "إجمالي المستخدمين", value: stats.professors + stats.employees + stats.students, color: "text-slate-800" },
                    ].map((item) => (
                      <div key={item.label} className="bg-gradient-to-bl from-slate-50 to-white rounded-xl p-2.5 sm:p-3 text-center border border-slate-100">
                        <p className={`text-lg sm:text-2xl font-bold ${item.color}`}>{item.value}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-sm sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              إدارة الإعلانات
            </h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm rounded-lg">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">إضافة إعلان</span>
                  <span className="sm:hidden">إضافة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة إعلان جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4 pt-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="title">عنوان الإعلان</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="أدخل عنوان الإعلان"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="content">محتوى الإعلان</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="أدخل محتوى الإعلان"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label>الأولوية</Label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">عاجل</SelectItem>
                          <SelectItem value="important">مهم</SelectItem>
                          <SelectItem value="normal">عادي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label>الفئة المستهدفة</Label>
                      <Select value={targetRole} onValueChange={(v) => setTargetRole(v as typeof targetRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الجميع</SelectItem>
                          <SelectItem value="professors">أعضاء التدريس</SelectItem>
                          <SelectItem value="employees">الموظفون</SelectItem>
                          <SelectItem value="students">الطلاب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    onClick={handleAddAnnouncement}
                    disabled={!title.trim() || !content.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-sm"
                  >
                    نشر الإعلان
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">إلغاء</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm sm:text-base">لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {announcements.map((ann) => (
                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{ann.title}</h3>
                          <Badge className={`text-[10px] sm:text-xs ${PRIORITY_COLORS[ann.priority]}`}>
                            {PRIORITY_LABELS[ann.priority]}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {TARGET_ROLE_LABELS[ann.targetRole]}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                          {ann.content}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground flex-row-reverse">
                          <Calendar className="w-3 h-3" />
                          {new Date(ann.createdAt).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 sm:w-9 sm:h-9 rounded-lg"
                        onClick={() => deleteAnnouncement(ann.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Faculty Management Tab */}
        <TabsContent value="faculty" className="mt-3 sm:mt-4">
          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm mb-3 sm:mb-4">
              <TabsTrigger value="profiles" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">الملفات الأكاديمية</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">الجداول التدريسية</span>
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">تقييم الأداء</span>
              </TabsTrigger>
              <TabsTrigger value="development" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">التطوير المهني</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profiles">
              <FacultyProfiles />
            </TabsContent>
            <TabsContent value="schedule">
              <TeachingSchedule />
            </TabsContent>
            <TabsContent value="evaluations">
              <PerformanceEvaluations />
            </TabsContent>
            <TabsContent value="development">
              <ProfessionalDevelopment />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Student Affairs Tab */}
        <TabsContent value="student-affairs" className="mt-3 sm:mt-4">
          <Tabs defaultValue="student-data" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm mb-3 sm:mb-4">
              <TabsTrigger value="student-data" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <UsersRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">بيانات الطلاب</span>
              </TabsTrigger>
              <TabsTrigger value="advising" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">الإرشاد الأكاديمي</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <ClipboardList className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">التدريب والمشاريع</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="student-data">
              <StudentDataManagement />
            </TabsContent>
            <TabsContent value="advising">
              <AcademicAdvising />
            </TabsContent>
            <TabsContent value="training">
              <TrainingAndProjects />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Courses & Curriculum Tab */}
        <TabsContent value="curriculum" className="mt-3 sm:mt-4">
          <Tabs defaultValue="study-plans" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm mb-3 sm:mb-4">
              <TabsTrigger value="study-plans" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <LayoutList className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">الخطط الدراسية</span>
              </TabsTrigger>
              <TabsTrigger value="descriptions" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">توصيف المقررات</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">الشعب الدراسية</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="study-plans">
              <StudyPlans />
            </TabsContent>
            <TabsContent value="descriptions">
              <CourseDescriptions />
            </TabsContent>
            <TabsContent value="sections">
              <CourseSections />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Scheduling & Rooms Tab */}
        <TabsContent value="scheduling" className="mt-3 sm:mt-4">
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm mb-3 sm:mb-4">
              <TabsTrigger value="rooms" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">إدارة القاعات</span>
              </TabsTrigger>
              <TabsTrigger value="schedule-view" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg">
                <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">الجدول الدراسي</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rooms">
              <RoomManagement />
            </TabsContent>
            <TabsContent value="schedule-view">
              <ScheduleView />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-3 sm:mt-4">
          <StudentManagement />
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-3 sm:mt-4">
          <DepartmentRequestManager />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-3 sm:mt-4">
          <PermissionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
