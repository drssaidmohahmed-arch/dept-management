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
} from "lucide-react";
import {
  useAnnouncements,
  useProfessorCourses,
  useEnrolledStudents,
  useProfessorRequests,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from "@/lib/store";
import CourseStudentsList from "@/components/professor/CourseStudentsList";
import ProfessorRequestPanel from "@/components/professor/ProfessorRequestPanel";

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
    { label: "طلباتي", value: requests.length, icon: Send, color: "bg-indigo-50 text-indigo-700" },
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
    <div className="space-y-6">
      {/* Urgent */}
      {urgentAnnouncements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-red-800 font-bold text-lg mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            إعلانات عاجلة
          </h3>
          <div className="space-y-2">
            {urgentAnnouncements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-red-900">{ann.title}</h4>
                  <Badge variant="destructive" className="shrink-0">عاجل</Badge>
                </div>
                <p className="text-red-700 text-sm mt-1">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList>
          <TabsTrigger value="announcements" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            الإعلانات
            {professorAnnouncements.length > 0 && (
              <Badge variant="secondary" className="mr-1 text-xs">
                {professorAnnouncements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            الجدول الأسبوعي
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-1">
            <UserCheck className="w-4 h-4" />
            قوائم الطلبة
            <Badge variant="secondary" className="mr-1 text-xs">
              {uniqueStudents}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <Send className="w-4 h-4" />
            تقديم طلب
            {pendingRequests > 0 && (
              <Badge variant="secondary" className="mr-1 text-xs bg-yellow-100 text-yellow-800">
                {pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          {professorAnnouncements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {professorAnnouncements.map((ann) => (
                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold">{ann.title}</h3>
                      <Badge className={`text-xs ${PRIORITY_COLORS[ann.priority]}`}>
                        {PRIORITY_LABELS[ann.priority]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {TARGET_ROLE_LABELS[ann.targetRole]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
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

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>الجدول الأسبوعي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-right p-3 font-medium">اليوم</th>
                      <th className="text-right p-3 font-medium">الوقت</th>
                      <th className="text-right p-3 font-medium">المقرر</th>
                      <th className="text-right p-3 font-medium">القاعة</th>
                      <th className="text-right p-3 font-medium">النوع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item, i) => (
                      <tr key={i} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium">{item.day}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        </td>
                        <td className="p-3">{item.course}</td>
                        <td className="p-3">{item.room}</td>
                        <td className="p-3">
                          <Badge
                            variant={item.type === "معمل" ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {item.type}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <CourseStudentsList />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <ProfessorRequestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
