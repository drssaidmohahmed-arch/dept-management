'use client';

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutGrid,
  Users,
  DoorOpen,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { CourseSection, SectionStatus } from "@/lib/store";
import {
  SECTION_STATUS_LABELS,
  SECTION_STATUS_COLORS,
} from "@/lib/store";

const STATUS_BADGE_COLORS: Record<SectionStatus, string> = {
  open: "bg-green-100 text-green-800",
  closed: "bg-red-100 text-red-800",
  full: "bg-amber-100 text-amber-800",
};

const DAY_LABELS: Record<string, string> = {
  sat: "السبت",
  sun: "الأحد",
  mon: "الاثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

// Mock data
const mockSections: CourseSection[] = [
  { id: "sec-1", courseCode: "CS101", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomId: "room-1", roomName: "قاعة A101", capacity: 40, enrolled: 35, scheduleDays: ["sat", "tue"], scheduleTime: "08:00-09:30", semester: 1, academicYear: "2024-2025", status: "open", createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "sec-2", courseCode: "CS101", sectionNumber: 2, professorName: "د. أحمد محمد الشريف", roomId: "room-2", roomName: "قاعة A102", capacity: 35, enrolled: 35, scheduleDays: ["sun", "wed"], scheduleTime: "10:00-11:30", semester: 1, academicYear: "2024-2025", status: "full", createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "sec-3", courseCode: "CS201", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomId: "room-3", roomName: "قاعة B201", capacity: 45, enrolled: 28, scheduleDays: ["sat", "tue"], scheduleTime: "10:00-11:30", semester: 2, academicYear: "2024-2025", status: "open", createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "sec-4", courseCode: "CS201", sectionNumber: 2, professorName: "د. خالد عبدالله العمري", roomId: "room-1", roomName: "قاعة A101", capacity: 40, enrolled: 40, scheduleDays: ["mon", "thu"], scheduleTime: "08:00-09:30", semester: 2, academicYear: "2024-2025", status: "closed", createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "sec-5", courseCode: "CS202", sectionNumber: 1, professorName: "د. فاطمة علي الحسن", roomId: "room-4", roomName: "معمل 1", capacity: 30, enrolled: 18, scheduleDays: ["sun", "wed"], scheduleTime: "12:00-13:30", semester: 2, academicYear: "2024-2025", status: "open", createdAt: "2024-08-22T00:00:00.000Z" },
  { id: "sec-6", courseCode: "CS301", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomId: "room-3", roomName: "قاعة B201", capacity: 45, enrolled: 42, scheduleDays: ["sat", "tue"], scheduleTime: "12:00-13:30", semester: 3, academicYear: "2024-2025", status: "open", createdAt: "2024-09-01T00:00:00.000Z" },
  { id: "sec-7", courseCode: "CS305", sectionNumber: 1, professorName: "د. فاطمة علي الحسن", roomId: "room-5", roomName: "قاعة C301", capacity: 35, enrolled: 33, scheduleDays: ["mon", "thu"], scheduleTime: "10:00-11:30", semester: 3, academicYear: "2024-2025", status: "open", createdAt: "2024-09-01T00:00:00.000Z" },
];

const COURSE_NAMES: Record<string, string> = {
  CS101: "مقدمة في علوم الحاسب",
  CS102: "مبادئ البرمجة",
  CS201: "هياكل البيانات",
  CS202: "قواعد البيانات",
  CS301: "تحليل الخوارزميات",
  CS305: "ذكاء اصطناعي",
};

export default function CourseSections() {
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterProfessor, setFilterProfessor] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [enrollCount, setEnrollCount] = useState(0);

  const [form, setForm] = useState({
    courseCode: "",
    sectionNumber: 1,
    professorName: "",
    roomName: "",
    capacity: 40,
    enrolled: 0,
    scheduleDays: [] as string[],
    scheduleTime: "",
    semester: 1,
    academicYear: "2024-2025",
    status: "open" as SectionStatus,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/course-sections");
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      } else {
        setSections(mockSections);
      }
    } catch {
      setSections(mockSections);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courseOptions = [...new Set(sections.map((s) => s.courseCode))];
  const professorOptions = [...new Set(sections.map((s) => s.professorName))];

  const filtered = sections.filter((s) => {
    if (filterCourse !== "all" && s.courseCode !== filterCourse) return false;
    if (filterProfessor !== "all" && s.professorName !== filterProfessor) return false;
    if (filterSemester !== "all" && s.semester !== Number(filterSemester)) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.courseCode.toLowerCase().includes(q) || s.professorName.includes(searchQuery) || (COURSE_NAMES[s.courseCode] || "").includes(searchQuery);
    }
    return true;
  });

  const getCapacityColor = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity;
    if (ratio >= 1) return "bg-red-500";
    if (ratio >= 0.9) return "bg-amber-500";
    if (ratio >= 0.7) return "bg-yellow-400";
    return "bg-emerald-500";
  };

  const isNearCapacity = (enrolled: number, capacity: number) => (enrolled / capacity) >= 0.9;

  // ========== CRUD ==========

  const handleSave = async () => {
    if (!form.courseCode.trim()) return;
    try {
      const method = editingSection ? "PUT" : "POST";
      const body = editingSection ? { ...form, id: editingSection.id } : form;
      const res = await fetch("/api/course-sections", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingSection ? "تم تحديث الشعبة بنجاح" : "تم إنشاء الشعبة بنجاح");
        setDialogOpen(false);
        setEditingSection(null);
        resetForm();
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleDelete = async (section: CourseSection) => {
    try {
      const res = await fetch(`/api/course-sections?id=${section.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الشعبة بنجاح");
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleEnrollUpdate = async () => {
    if (!selectedSection) return;
    try {
      const res = await fetch("/api/course-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedSection, enrolled: enrollCount }),
      });
      if (res.ok) {
        toast.success("تم تحديث عدد المسجلين");
        setEnrollDialogOpen(false);
        setSelectedSection(null);
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء التحديث");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const openEdit = (section: CourseSection) => {
    setEditingSection(section);
    setForm({
      courseCode: section.courseCode,
      sectionNumber: section.sectionNumber,
      professorName: section.professorName,
      roomName: section.roomName,
      capacity: section.capacity,
      enrolled: section.enrolled,
      scheduleDays: [...section.scheduleDays],
      scheduleTime: section.scheduleTime,
      semester: section.semester,
      academicYear: section.academicYear,
      status: section.status,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setForm({
      courseCode: "",
      sectionNumber: 1,
      professorName: "",
      roomName: "",
      capacity: 40,
      enrolled: 0,
      scheduleDays: [],
      scheduleTime: "",
      semester: 1,
      academicYear: "2024-2025",
      status: "open",
    });
  };

  const toggleDay = (day: string) => {
    if (form.scheduleDays.includes(day)) {
      setForm({ ...form, scheduleDays: form.scheduleDays.filter((d) => d !== day) });
    } else {
      setForm({ ...form, scheduleDays: [...form.scheduleDays, day] });
    }
  };

  // ========== Render ==========

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
          <LayoutGrid className="w-5 h-5 text-emerald-600" />
          إدارة الشعب الدراسية
        </h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingSection(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
              <Plus className="w-4 h-4" />
              إضافة شعبة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingSection ? "تعديل الشعبة" : "إضافة شعبة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>رمز المقرر</Label>
                  <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="CS101" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>رقم الشعبة</Label>
                  <Input type="number" value={form.sectionNumber} onChange={(e) => setForm({ ...form, sectionNumber: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>اسم الدكتور</Label>
                <Input value={form.professorName} onChange={(e) => setForm({ ...form, professorName: e.target.value })} placeholder="د. أحمد محمد الشريف" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>القاعة</Label>
                  <Input value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value })} placeholder="قاعة A101" />
                </div>
                <div className="space-y-1.5">
                  <Label>السعة</Label>
                  <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>الأيام ({form.scheduleDays.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DAY_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={form.scheduleDays.includes(key) ? "default" : "outline"}
                      onClick={() => toggleDay(key)}
                      className="text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>الوقت</Label>
                <Input value={form.scheduleTime} onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })} placeholder="08:00-09:30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>الفصل</Label>
                  <Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map((s) => (
                        <SelectItem key={s} value={String(s)}>الفصل {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>الحالة</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SectionStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">مفتوح</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                      <SelectItem value="full">مكتمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>السنة الأكاديمية</Label>
                <Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2024-2025" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button onClick={handleSave} disabled={!form.courseCode.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-sm">حفظ</Button>
              <DialogClose asChild>
                <Button variant="outline" size="sm">إلغاء</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[180px]">
              <Input placeholder="بحث بالمقرر أو الدكتور..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-xs" />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="المقرر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {courseOptions.map((c) => (
                  <SelectItem key={c} value={c} className="font-mono text-xs">{c} - {COURSE_NAMES[c] || c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProfessor} onValueChange={setFilterProfessor}>
              <SelectTrigger className="w-36 text-xs"><SelectValue placeholder="الدكتور" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {professorOptions.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-24 text-xs"><SelectValue placeholder="الفصل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {[1,2,3,4,5,6].map((s) => (
                  <SelectItem key={s} value={String(s)}>الفصل {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-24 text-xs"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="open">مفتوح</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
                <SelectItem value="full">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد شعب دراسية</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((section) => {
            const capacityPercent = Math.round((section.enrolled / section.capacity) * 100);
            return (
              <Card key={section.id} className={`hover:shadow-md transition-shadow ${isNearCapacity(section.enrolled, section.capacity) ? "border-amber-200" : ""}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="font-mono text-sm font-bold text-slate-700">{section.courseCode}</span>
                        <span className="text-sm font-semibold text-slate-800">{COURSE_NAMES[section.courseCode] || section.courseCode}</span>
                        <Badge variant="outline" className="text-[10px]">شعبة {section.sectionNumber}</Badge>
                        <Badge className={`text-[10px] ${STATUS_BADGE_COLORS[section.status]}`}>
                          {SECTION_STATUS_LABELS[section.status]}
                        </Badge>
                      </div>

                      {/* Info row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                        <div className="flex items-center gap-1.5 flex-row-reverse text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{section.professorName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-row-reverse text-muted-foreground">
                          <DoorOpen className="w-3.5 h-3.5" />
                          <span>{section.roomName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-row-reverse text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{section.scheduleDays.map((d) => DAY_LABELS[d] || d).join("، ")} {section.scheduleTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-row-reverse text-muted-foreground">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>فصل {section.semester}</span>
                        </div>
                      </div>

                      {/* Capacity bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground">السعة</span>
                            <span className="text-[10px] font-medium">
                              {section.enrolled}/{section.capacity}
                              <span className="text-muted-foreground mr-1">({capacityPercent}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getCapacityColor(section.enrolled, section.capacity)}`}
                              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                        {isNearCapacity(section.enrolled, section.capacity) && section.status === "open" && (
                          <div className="flex items-center gap-1 text-amber-600 text-[10px] shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>قارب على الاكتمال</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        title="تحديث عدد المسجلين"
                        onClick={() => {
                          setSelectedSection(section);
                          setEnrollCount(section.enrolled);
                          setEnrollDialogOpen(true);
                        }}
                      >
                        <Users className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => openEdit(section)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(section)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={(open) => { setEnrollDialogOpen(open); if (!open) setSelectedSection(null); }}>
        <DialogContent className="sm:max-w-sm w-[calc(100vw-2rem)]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تحديث عدد المسجلين</DialogTitle>
          </DialogHeader>
          {selectedSection && (
            <div className="space-y-3 pt-2">
              <p className="text-sm">
                <span className="font-mono font-bold">{selectedSection.courseCode}</span> - شعبة {selectedSection.sectionNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                السعة: {selectedSection.capacity} | الحالي: {selectedSection.enrolled}
              </p>
              <div className="space-y-1.5">
                <Label>عدد المسجلين الجديد</Label>
                <Input
                  type="number"
                  value={enrollCount}
                  onChange={(e) => setEnrollCount(Number(e.target.value))}
                  min={0}
                  max={selectedSection.capacity}
                  className="text-center font-bold text-lg"
                />
              </div>
              {enrollCount > selectedSection.capacity && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>العدد يتجاوز السعة المحددة</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button onClick={handleEnrollUpdate} className="bg-emerald-600 hover:bg-emerald-700 text-sm">تحديث</Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm">إلغاء</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
