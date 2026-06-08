'use client';

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  UsersRound,
  GraduationCap,
  ClipboardList,
  UserCheck,
  Building2,
  UserCog,
  ListChecks,
} from "lucide-react";
import {
  useAnnouncements,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from "@/lib/supabase-store";
import StudentDataManagement from "@/components/student-affairs/StudentDataManagement";
import AcademicAdvising from "@/components/student-affairs/AcademicAdvising";
import TrainingAndProjects from "@/components/student-affairs/TrainingAndProjects";
import CourseSections from "@/components/courses/CourseSections";
import RoomManagement from "@/components/schedules/RoomManagement";

export default function EmployeeDashboard() {
  const announcements = useAnnouncements();

  const employeeAnnouncements = useMemo(
    () => announcements.filter((a) => a.targetRole === "all" || a.targetRole === "employees"),
    [announcements]
  );

  const tasks = [
    { id: 1, title: "تحديث سجلات الطلاب", status: "completed", dueDate: "2025-01-15" },
    { id: 2, title: "إعداد تقرير الفصل الدراسي", status: "pending", dueDate: "2025-01-20" },
    { id: 3, title: "مراجعة جداول المحاضرات", status: "pending", dueDate: "2025-01-18" },
    { id: 4, title: "تنظيم ملفات القسم", status: "completed", dueDate: "2025-01-12" },
    { id: 5, title: "إعداد استمارات التسجيل", status: "pending", dueDate: "2025-01-22" },
    { id: 6, title: "متابعة صيانة المعامل", status: "pending", dueDate: "2025-01-25" },
    { id: 7, title: "أرشفة الوثائق القديمة", status: "completed", dueDate: "2025-01-10" },
    { id: 8, title: "تحديث بيانات المقررات", status: "pending", dueDate: "2025-01-28" },
  ];

  const statCards = [
    { label: "الإعلانات", value: employeeAnnouncements.length, icon: Bell, color: "bg-cyan-50 text-cyan-700" },
    { label: "مكتملة", value: tasks.filter((t) => t.status === "completed").length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    { label: "معلقة", value: tasks.filter((t) => t.status === "pending").length, icon: Clock, color: "bg-amber-50 text-amber-700" },
    { label: "الإجمالي", value: tasks.length, icon: ClipboardCheck, color: "bg-purple-50 text-purple-700" },
  ];

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    return <Circle className="w-4 h-4 text-amber-500" />;
  };

  const statusBadgeClass = (status: string) => {
    return status === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Gradient Header */}
      <div className="bg-gradient-to-l from-cyan-600 to-cyan-800 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCog className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold">لوحة تحكم الموظف الإداري</h2>
              <p className="text-cyan-200 text-[10px] sm:text-xs">إدارة المهام والعمليات الإدارية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{card.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm">
          <TabsTrigger value="announcements" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإعلانات</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">المهام</span>
          </TabsTrigger>
          <TabsTrigger value="student-data" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <UsersRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">بيانات الطلاب</span>
          </TabsTrigger>
          <TabsTrigger value="advising" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإرشاد الأكاديمي</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">التدريب والمشاريع</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الشعب الدراسية</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">إدارة القاعات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-3 sm:mt-4">
          {employeeAnnouncements.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm sm:text-base">لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {employeeAnnouncements.map((ann) => (
                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base">{ann.title}</h3>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-3 sm:mt-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 sm:pb-2 bg-gradient-to-l from-slate-50 to-white">
              <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                قائمة المهام
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 sm:pt-0">
              <div className="space-y-2 sm:space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-colors flex-row-reverse ${
                      task.status === "completed"
                        ? "bg-emerald-50/50 border-emerald-100"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {statusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-medium truncate ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5 flex-row-reverse">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] sm:text-xs shrink-0 ${statusBadgeClass(task.status)}`}>
                      {task.status === "completed" ? "مكتمل" : "معلق"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-data" className="mt-3 sm:mt-4">
          <StudentDataManagement />
        </TabsContent>

        <TabsContent value="advising" className="mt-3 sm:mt-4">
          <AcademicAdvising />
        </TabsContent>

        <TabsContent value="training" className="mt-3 sm:mt-4">
          <TrainingAndProjects />
        </TabsContent>

        <TabsContent value="sections" className="mt-3 sm:mt-4">
          <CourseSections />
        </TabsContent>

        <TabsContent value="rooms" className="mt-3 sm:mt-4">
          <RoomManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
