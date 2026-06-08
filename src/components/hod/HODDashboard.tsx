'use client';

import { useState } from "react";
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
} from "lucide-react";
import PermissionsManager from "@/components/hod/PermissionsManager";
import StudentManagement from "@/components/hod/StudentManagement";
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

export default function HODDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"urgent" | "important" | "normal">("normal");
  const [targetRole, setTargetRole] = useState<"all" | "professors" | "employees" | "students">("all");

  const announcements = useAnnouncements();
  const stats = useStats();
  const courses = useCourses();

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
      {/* Statistics Cards - 3 cols on mobile, 6 on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="overflow-hidden">
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
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="announcements" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإعلانات</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإحصائيات</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">المقررات</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الطلبة</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الصلاحيات</span>
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-3 sm:mt-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-sm sm:text-lg font-bold text-slate-800">إدارة الإعلانات</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm">
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

          {/* Announcements List */}
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
                        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 sm:w-9 sm:h-9"
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

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="mt-3 sm:mt-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-sm sm:text-base md:text-lg">الإحصائيات العامة</CardTitle>
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
                              className={`${item.color} h-2 sm:h-2.5 rounded-full`}
                              style={{ width: `${(item.value / stats.students) * 100}%` }}
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
                      <div key={item.label} className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
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

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-3 sm:mt-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardTitle className="flex items-center justify-between text-sm sm:text-base md:text-lg">
                <span>إدارة المقررات الدراسية</span>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  {courses.length} مقرر
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 sm:pt-0">
              {courses.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm sm:text-base">لا توجد مقررات حالياً</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-right p-2 sm:p-3 font-medium">الرمز</th>
                        <th className="text-right p-2 sm:p-3 font-medium">اسم المقرر</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-center">الساعات</th>
                        <th className="text-right p-2 sm:p-3 font-medium">الفصل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="p-2 sm:p-3 font-mono text-[10px] sm:text-xs">{course.code}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm">{course.name}</td>
                          <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">{course.hours}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm">الفصل {course.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-3 sm:mt-4">
          <StudentManagement />
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-3 sm:mt-4">
          <PermissionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
