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
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
} from "lucide-react";
import {
  useAnnouncements,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from "@/lib/store";

export default function EmployeeDashboard() {
  const announcements = useAnnouncements();

  const employeeAnnouncements = useMemo(
    () => announcements.filter((a) => a.targetRole === "all" || a.targetRole === "employees"),
    [announcements]
  );

  const statCards = [
    { label: "الإعلانات", value: employeeAnnouncements.length, icon: Bell, color: "bg-cyan-50 text-cyan-700" },
    { label: "المهام المكتملة", value: 12, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    { label: "المهام المعلقة", value: 5, icon: Clock, color: "bg-amber-50 text-amber-700" },
    { label: "الإجمالي", value: 17, icon: ClipboardCheck, color: "bg-purple-50 text-purple-700" },
  ];

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

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    return <Circle className="w-4 h-4 text-amber-500" />;
  };

  const statusLabel = (status: string) => {
    return status === "completed" ? "مكتمل" : "معلق";
  };

  const statusBadgeClass = (status: string) => {
    return status === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 flex-row-reverse">
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
          <TabsTrigger value="announcements" className="flex items-center gap-1 flex-row-reverse">
            <Bell className="w-4 h-4" />
            الإعلانات
            {employeeAnnouncements.length > 0 && (
              <Badge variant="secondary" className="ms-1 text-xs">
                {employeeAnnouncements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1 flex-row-reverse">
            <ClipboardCheck className="w-4 h-4" />
            المهام
            <Badge variant="secondary" className="ms-1 text-xs">
              {tasks.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          {employeeAnnouncements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employeeAnnouncements.map((ann) => (
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
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground flex-row-reverse">
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

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة المهام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors flex-row-reverse ${
                      task.status === "completed"
                        ? "bg-emerald-50/50 border-emerald-100"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {statusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1 flex-row-reverse">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${statusBadgeClass(task.status)}`}>
                      {statusLabel(task.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
