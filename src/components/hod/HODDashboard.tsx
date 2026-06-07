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
import {
  useAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
  getStats,
} from "@/lib/store";
import { useMemo } from "react";

export default function HODDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"urgent" | "important" | "normal">("normal");
  const [targetRole, setTargetRole] = useState<"all" | "professors" | "employees" | "students">("all");

  const announcements = useAnnouncements();
  const stats = useMemo(() => getStats(), [announcements]);

  const handleAddAnnouncement = () => {
    if (!title.trim() || !content.trim()) return;
    addAnnouncement({ title: title.trim(), content: content.trim(), priority, targetRole });
    setTitle("");
    setContent("");
    setPriority("normal");
    setTargetRole("all");
    setDialogOpen(false);
  };

  const statCards = [
    { label: "إجمالي الإعلانات", value: stats.totalAnnouncements, icon: Megaphone, color: "bg-emerald-50 text-emerald-700" },
    { label: "الأساتذة", value: stats.professors, icon: GraduationCap, color: "bg-sky-50 text-sky-700" },
    { label: "الموظفين", value: stats.employees, icon: UserCog, color: "bg-cyan-50 text-cyan-700" },
    { label: "الطلاب", value: stats.students, icon: BookOpen, color: "bg-orange-50 text-orange-700" },
    { label: "الطلبات", value: stats.totalRequests, icon: ClipboardList, color: "bg-purple-50 text-purple-700" },
    { label: "المعدل", value: stats.averageGPA, icon: TrendingUp, color: "bg-rose-50 text-rose-700", isDecimal: true },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {card.isDecimal ? Number(card.value).toFixed(2) : card.value}
                    </p>
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
            {announcements.length > 0 && (
              <Badge variant="secondary" className="ms-1 text-xs">
                {announcements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1 flex-row-reverse">
            <BarChart3 className="w-4 h-4" />
            الإحصائيات
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-1 flex-row-reverse">
            <BookOpen className="w-4 h-4" />
            إدارة المقررات
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-1 flex-row-reverse">
            <Shield className="w-4 h-4" />
            صلاحيات الأعضاء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">إدارة الإعلانات</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse">
                  <Plus className="w-4 h-4" />
                  إضافة إعلان
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة إعلان جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الإعلان</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="أدخل عنوان الإعلان"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">محتوى الإعلان</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="أدخل محتوى الإعلان"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                      <Label>الفئة المستهدفة</Label>
                      <Select value={targetRole} onValueChange={(v) => setTargetRole(v as typeof targetRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">الجميع</SelectItem>
                          <SelectItem value="professors">أعضاء هيئة التدريس</SelectItem>
                          <SelectItem value="employees">الموظفون الإداريون</SelectItem>
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
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    نشر الإعلان
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">إلغاء</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Announcements List */}
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{ann.title}</h3>
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
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteAnnouncement(ann.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات العامة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700">توزيع المستخدمين</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">أعضاء هيئة التدريس</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-100 rounded-full h-2.5">
                          <div
                            className="bg-sky-500 h-2.5 rounded-full"
                            style={{ width: `${(stats.professors / stats.students) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.professors}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">الموظفون الإداريون</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-100 rounded-full h-2.5">
                          <div
                            className="bg-cyan-500 h-2.5 rounded-full"
                            style={{ width: `${(stats.employees / stats.students) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats.employees}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">الطلاب</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-100 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full w-full" />
                        </div>
                        <span className="text-sm font-medium">{stats.students}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700">ملخص</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-slate-800">{stats.totalAnnouncements}</p>
                      <p className="text-xs text-muted-foreground">إعلان</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-slate-800">{stats.totalRequests}</p>
                      <p className="text-xs text-muted-foreground">طلب</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{stats.averageGPA.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">المعدل التراكمي</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-slate-800">{stats.professors + stats.employees + stats.students}</p>
                      <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                إدارة المقررات الدراسية
                <Button size="sm" className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse">
                  <Plus className="w-4 h-4" />
                  إضافة مقرر
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-right p-3 font-medium">رمز المقرر</th>
                      <th className="text-right p-3 font-medium">اسم المقرر</th>
                      <th className="text-right p-3 font-medium">الساعات</th>
                      <th className="text-right p-3 font-medium">الفصل</th>
                      <th className="text-right p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: "CS101", name: "مقدمة في علوم الحاسب", hours: 3, semester: "الأول" },
                      { code: "CS102", name: "مبادئ البرمجة", hours: 3, semester: "الأول" },
                      { code: "CS201", name: "هياكل البيانات", hours: 3, semester: "الثاني" },
                      { code: "CS202", name: "قواعد البيانات", hours: 3, semester: "الثاني" },
                      { code: "CS301", name: "تحليل الخوارزميات", hours: 3, semester: "الثالث" },
                      { code: "CS302", name: "أنظمة التشغيل", hours: 3, semester: "الثالث" },
                    ].map((course) => (
                      <tr key={course.code} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-xs">{course.code}</td>
                        <td className="p-3">{course.name}</td>
                        <td className="p-3 text-center">{course.hours}</td>
                        <td className="p-3">{course.semester}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="text-xs">
                              تعديل
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs text-red-500">
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <PermissionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
