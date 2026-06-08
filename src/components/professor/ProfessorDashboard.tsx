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
  BookOpen,
  Users,
  ClipboardList,
  Calendar,
  Clock,
  GraduationCap,
  UserCheck,
  Send,
  TrendingUp,
  BarChart3,
  FileUser,
} from "lucide-react";
import {
  useAnnouncements,
  useProfessorCourses,
  useEnrolledStudents,
  useProfessorRequests,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from "@/lib/supabase-store";
import CourseStudentsList from "@/components/professor/CourseStudentsList";
import ProfessorRequestPanel from "@/components/professor/ProfessorRequestPanel";
import FacultyProfiles from "@/components/faculty/FacultyProfiles";
import TeachingSchedule from "@/components/faculty/TeachingSchedule";
import ProfessionalDevelopment from "@/components/faculty/ProfessionalDevelopment";
import PerformanceEvaluations from "@/components/faculty/PerformanceEvaluations";

export default function ProfessorDashboard() {
  const announcements = useAnnouncements();
  const professorCourses = useProfessorCourses();
  const enrolledStudents = useEnrolledStudents();

  const requests = useProfessorRequests();
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === "pending").length, [requests]);

  const professorAnnouncements = useMemo(
    () => announcements.filter((a) => a.targetRole === "all" || a.targetRole === "professors"),
    [announcements]
  );

  const urgentAnnouncements = useMemo(
    () => professorAnnouncements.filter((a) => a.priority === "urgent"),
    [professorAnnouncements]
  );

  const uniqueStudents = useMemo(() => {
    return new Set(
      enrolledStudents
        .filter((s) => professorCourses.some((c) => c.code === s.courseCode))
        .map((s) => s.studentId)
    ).size;
  }, [enrolledStudents, professorCourses]);

  const statCards = [
    { label: "الإعلانات", value: professorAnnouncements.length, icon: Bell, color: "bg-sky-50 text-sky-700" },
    { label: "المقررات", value: professorCourses.length, icon: BookOpen, color: "bg-emerald-50 text-emerald-700" },
    { label: "الطلبة", value: uniqueStudents, icon: Users, color: "bg-orange-50 text-orange-700" },
    { label: "العاجلة", value: urgentAnnouncements.length, icon: ClipboardList, color: "bg-red-50 text-red-700" },
  ];

  const schedule = [
    { day: "الأحد", time: "08:00 - 09:30", course: "مقدمة في علوم الحاسب", room: "قاعة 101", type: "محاضرة" },
    { day: "الأحد", time: "10:00 - 11:30", course: "هياكل البيانات", room: "قاعة 203", type: "محاضرة" },
    { day: "الأحد", time: "13:00 - 14:00", course: "مقدمة في علوم الحاسب", room: "معمل 5", type: "معمل" },
    { day: "الاثنين", time: "08:00 - 09:30", course: "قواعد البيانات", room: "قاعة 105", type: "محاضرة" },
    { day: "الاثنين", time: "10:00 - 11:30", course: "تحليل الخوارزميات", room: "قاعة 301", type: "محاضرة" },
    { day: "الثلاثاء", time: "08:00 - 09:30", course: "هياكل البيانات", room: "معمل 3", type: "معمل" },
    { day: "الثلاثاء", time: "13:00 - 14:30", course: "قواعد البيانات", room: "معمل 2", type: "معمل" },
    { day: "الأربعاء", time: "08:00 - 09:30", course: "مقدمة في علوم الحاسب", room: "قاعة 101", type: "محاضرة" },
    { day: "الأربعاء", time: "10:00 - 11:30", course: "تحليل الخوارزميات", room: "قاعة 301", type: "محاضرة" },
    { day: "الخميس", time: "08:00 - 09:30", course: "هياكل البيانات", room: "قاعة 203", type: "محاضرة" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Urgent */}
      {urgentAnnouncements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <h3 className="text-red-800 font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            إعلانات عاجلة
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {urgentAnnouncements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-red-900 text-sm sm:text-base">{ann.title}</h4>
                  <Badge variant="destructive" className="shrink-0 text-[10px] sm:text-xs">عاجل</Badge>
                </div>
                <p className="text-red-700 text-xs sm:text-sm mt-1">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards - 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
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
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="announcements" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإعلانات</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">جدولي التدريسي</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الطلبة</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الطلبات</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <FileUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الملف الأكاديمي</span>
          </TabsTrigger>
          <TabsTrigger value="development" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">التطوير المهني</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">تقييم الأداء</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-3 sm:mt-4">
          {professorAnnouncements.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm sm:text-base">لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {professorAnnouncements.map((ann) => (
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

        {/* Teaching Schedule Tab */}
        <TabsContent value="schedule" className="mt-3 sm:mt-4">
          <TeachingSchedule />
        </TabsContent>

        <TabsContent value="students" className="mt-3 sm:mt-4">
          <CourseStudentsList />
        </TabsContent>

        <TabsContent value="requests" className="mt-3 sm:mt-4">
          <ProfessorRequestPanel />
        </TabsContent>

        {/* Academic Profile Tab */}
        <TabsContent value="profile" className="mt-3 sm:mt-4">
          <FacultyProfiles />
        </TabsContent>

        {/* Professional Development Tab */}
        <TabsContent value="development" className="mt-3 sm:mt-4">
          <ProfessionalDevelopment />
        </TabsContent>

        {/* Performance Evaluations Tab */}
        <TabsContent value="evaluations" className="mt-3 sm:mt-4">
          <PerformanceEvaluations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
