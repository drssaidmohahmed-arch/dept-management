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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Layers,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Eye,
  ChevronLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type {
  StudyPlan,
  PlanCourse,
  PlanStatus,
  CourseType,
} from "@/lib/store";
import {
  PLAN_STATUS_LABELS,
  PLAN_STATUS_COLORS,
  COURSE_TYPE_LABELS,
  COURSE_TYPE_COLORS,
} from "@/lib/store";

const COURSE_TYPE_BADGE_COLORS: Record<CourseType, string> = {
  required: "bg-blue-100 text-blue-800",
  elective: "bg-purple-100 text-purple-800",
  university_requirement: "bg-green-100 text-green-800",
  college_requirement: "bg-amber-100 text-amber-800",
};

const SEMESTER_ORDER_LABELS: Record<number, string> = {
  1: "الفصل الأول",
  2: "الفصل الثاني",
  3: "الفصل الثالث",
  4: "الفصل الرابع",
  5: "الفصل الخامس",
  6: "الفصل السادس",
  7: "الفصل السابع",
  8: "الفصل الثامن",
};

// Mock data for fallback
const mockPlans: StudyPlan[] = [
  {
    id: "sp-1",
    programName: "بكالوريوس علوم الحاسب",
    level: 4,
    totalHours: 132,
    description: "خطة البكالوريوس في علوم الحاسب تتضمن مقررات أساسية وتخصصية واختيارية",
    academicYear: "2024-2025",
    status: "active",
    createdAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "sp-2",
    programName: "بكالوريوس هندسة برمجيات",
    level: 4,
    totalHours: 138,
    description: "خطة بكالوريوس هندسة البرمجيات مع التركيز على التصميم والتطوير",
    academicYear: "2024-2025",
    status: "draft",
    createdAt: "2024-07-15T00:00:00.000Z",
  },
  {
    id: "sp-3",
    programName: "ماجستير علوم الحاسب",
    level: 5,
    totalHours: 36,
    description: "برنامج الماجستير في علوم الحاسب - مسار البحث العلمي",
    academicYear: "2023-2024",
    status: "archived",
    createdAt: "2023-05-20T00:00:00.000Z",
  },
];

const mockPlanCourses: PlanCourse[] = [
  { id: "pc-1", planId: "sp-1", courseCode: "CS101", semesterOrder: 1, courseType: "required", prerequisiteCodes: [], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-2", planId: "sp-1", courseCode: "CS102", semesterOrder: 1, courseType: "required", prerequisiteCodes: [], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-3", planId: "sp-1", courseCode: "MATH101", semesterOrder: 1, courseType: "college_requirement", prerequisiteCodes: [], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-4", planId: "sp-1", courseCode: "ENG101", semesterOrder: 1, courseType: "university_requirement", prerequisiteCodes: [], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-5", planId: "sp-1", courseCode: "CS201", semesterOrder: 2, courseType: "required", prerequisiteCodes: ["CS101"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-6", planId: "sp-1", courseCode: "CS202", semesterOrder: 2, courseType: "required", prerequisiteCodes: ["CS102"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-7", planId: "sp-1", courseCode: "MATH201", semesterOrder: 2, courseType: "required", prerequisiteCodes: ["MATH101"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-8", planId: "sp-1", courseCode: "CS301", semesterOrder: 3, courseType: "required", prerequisiteCodes: ["CS201"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-9", planId: "sp-1", courseCode: "CS305", semesterOrder: 3, courseType: "elective", prerequisiteCodes: ["CS201"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-10", planId: "sp-1", courseCode: "CS401", semesterOrder: 4, courseType: "elective", prerequisiteCodes: ["CS301"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-11", planId: "sp-1", courseCode: "CS402", semesterOrder: 4, courseType: "required", prerequisiteCodes: ["CS301", "CS202"], createdAt: "2024-06-01T00:00:00.000Z" },
  { id: "pc-12", planId: "sp-1", courseCode: "CS602", semesterOrder: 6, courseType: "required", prerequisiteCodes: ["CS401", "CS402"], createdAt: "2024-06-01T00:00:00.000Z" },
];

const COURSE_NAMES: Record<string, string> = {
  CS101: "مقدمة في علوم الحاسب",
  CS102: "مبادئ البرمجة",
  CS201: "هياكل البيانات",
  CS202: "قواعد البيانات",
  CS301: "تحليل الخوارزميات",
  CS305: "ذكاء اصطناعي",
  CS401: "تعلم آلي",
  CS402: "أمن معلومات",
  CS602: "مشروع تخرج ٢",
  MATH101: "رياضيات متقدمة",
  MATH201: "رياضيات متقدمة ٢",
  ENG101: "لغة إنجليزية",
};

export default function StudyPlans() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [planCourses, setPlanCourses] = useState<PlanCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  // Dialog states
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PlanCourse | null>(null);

  // Form states
  const [planForm, setPlanForm] = useState({
    programName: "",
    level: 4,
    totalHours: 132,
    description: "",
    academicYear: "2024-2025",
    status: "draft" as PlanStatus,
  });
  const [courseForm, setCourseForm] = useState({
    courseCode: "",
    semesterOrder: 1,
    courseType: "required" as CourseType,
    prerequisiteCodes: [] as string[],
    prerequisiteInput: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, coursesRes] = await Promise.all([
        fetch("/api/study-plans"),
        fetch("/api/plan-courses"),
      ]);
      if (plansRes.ok && coursesRes.ok) {
        const plansData = await plansRes.json();
        const coursesData = await coursesRes.json();
        setPlans(plansData);
        setPlanCourses(coursesData);
      } else {
        setPlans(mockPlans);
        setPlanCourses(mockPlanCourses);
      }
    } catch {
      setPlans(mockPlans);
      setPlanCourses(mockPlanCourses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPlans = plans.filter((p) => {
    if (filterLevel !== "all" && p.level !== Number(filterLevel)) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterYear !== "all" && p.academicYear !== filterYear) return false;
    if (searchQuery && !p.programName.includes(searchQuery)) return false;
    return true;
  });

  const selectedPlanCourses = selectedPlan
    ? planCourses
        .filter((pc) => pc.planId === selectedPlan.id)
        .sort((a, b) => a.semesterOrder - b.semesterOrder)
    : [];

  const semesters = [...new Set(selectedPlanCourses.map((pc) => pc.semesterOrder))].sort();

  // ========== Plan CRUD ==========

  const handleSavePlan = async () => {
    if (!planForm.programName.trim()) return;
    try {
      const method = editingPlan ? "PUT" : "POST";
      const body = editingPlan ? { ...planForm, id: editingPlan.id } : planForm;
      const res = await fetch("/api/study-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingPlan ? "تم تحديث الخطة بنجاح" : "تم إنشاء الخطة بنجاح");
        setPlanDialogOpen(false);
        setEditingPlan(null);
        resetPlanForm();
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleDeletePlan = async (plan: StudyPlan) => {
    try {
      const res = await fetch(`/api/study-plans?id=${plan.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الخطة بنجاح");
        if (selectedPlan?.id === plan.id) setSelectedPlan(null);
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const openEditPlan = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      programName: plan.programName,
      level: plan.level,
      totalHours: plan.totalHours,
      description: plan.description,
      academicYear: plan.academicYear,
      status: plan.status,
    });
    setPlanDialogOpen(true);
  };

  const resetPlanForm = () => {
    setPlanForm({
      programName: "",
      level: 4,
      totalHours: 132,
      description: "",
      academicYear: "2024-2025",
      status: "draft",
    });
  };

  // ========== Course CRUD ==========

  const handleSaveCourse = async () => {
    if (!courseForm.courseCode.trim() || !selectedPlan) return;
    try {
      const method = editingCourse ? "PUT" : "POST";
      const body = editingCourse
        ? { ...courseForm, planId: selectedPlan.id, id: editingCourse.id }
        : { ...courseForm, planId: selectedPlan.id };
      const res = await fetch("/api/plan-courses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingCourse ? "تم تحديث المقرر بنجاح" : "تم إضافة المقرر بنجاح");
        setCourseDialogOpen(false);
        setEditingCourse(null);
        resetCourseForm();
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleDeleteCourse = async (pc: PlanCourse) => {
    try {
      const res = await fetch(`/api/plan-courses?id=${pc.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف المقرر من الخطة");
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const openAddCourse = () => {
    setEditingCourse(null);
    resetCourseForm();
    setCourseDialogOpen(true);
  };

  const openEditCourse = (pc: PlanCourse) => {
    setEditingCourse(pc);
    setCourseForm({
      courseCode: pc.courseCode,
      semesterOrder: pc.semesterOrder,
      courseType: pc.courseType,
      prerequisiteCodes: pc.prerequisiteCodes,
      prerequisiteInput: pc.prerequisiteCodes.join(", "),
    });
    setCourseDialogOpen(true);
  };

  const resetCourseForm = () => {
    setCourseForm({
      courseCode: "",
      semesterOrder: 1,
      courseType: "required",
      prerequisiteCodes: [],
      prerequisiteInput: "",
    });
  };

  const addPrerequisite = () => {
    const input = courseForm.prerequisiteInput.trim();
    if (input && !courseForm.prerequisiteCodes.includes(input)) {
      setCourseForm({
        ...courseForm,
        prerequisiteCodes: [...courseForm.prerequisiteCodes, input],
        prerequisiteInput: "",
      });
    }
  };

  const removePrerequisite = (code: string) => {
    setCourseForm({
      ...courseForm,
      prerequisiteCodes: courseForm.prerequisiteCodes.filter((c) => c !== code),
    });
  };

  // ========== Render ==========

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      {/* Header & Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          إدارة الخطط الدراسية
        </h2>
        <Dialog open={planDialogOpen} onOpenChange={(open) => { setPlanDialogOpen(open); if (!open) { setEditingPlan(null); resetPlanForm(); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
              <Plus className="w-4 h-4" />
              إضافة خطة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "تعديل الخطة الدراسية" : "إضافة خطة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label>اسم البرنامج</Label>
                <Input value={planForm.programName} onChange={(e) => setPlanForm({ ...planForm, programName: e.target.value })} placeholder="مثال: بكالوريوس علوم الحاسب" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>المستوى</Label>
                  <Input type="number" value={planForm.level} onChange={(e) => setPlanForm({ ...planForm, level: Number(e.target.value) })} min={1} max={8} />
                </div>
                <div className="space-y-1.5">
                  <Label>الساعات الإجمالية</Label>
                  <Input type="number" value={planForm.totalHours} onChange={(e) => setPlanForm({ ...planForm, totalHours: Number(e.target.value) })} min={1} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>السنة الأكاديمية</Label>
                <Input value={planForm.academicYear} onChange={(e) => setPlanForm({ ...planForm, academicYear: e.target.value })} placeholder="2024-2025" />
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={planForm.status} onValueChange={(v) => setPlanForm({ ...planForm, status: v as PlanStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الوصف</Label>
                <Textarea value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} rows={3} placeholder="وصف الخطة الدراسية" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button onClick={handleSavePlan} disabled={!planForm.programName.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-sm">حفظ</Button>
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
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="بحث باسم البرنامج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="المستوى" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="3">بكالوريوس</SelectItem>
                <SelectItem value="4">بكالوريوس 4</SelectItem>
                <SelectItem value="5">ماجستير</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-32 text-xs"><SelectValue placeholder="السنة الأكاديمية" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plan List / Detail View */}
      {selectedPlan ? (
        /* ===== Detail View ===== */
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedPlan(null)} className="flex items-center gap-1 text-xs">
              <ChevronLeft className="w-4 h-4" />
              العودة للقائمة
            </Button>
            <h3 className="text-base font-bold text-slate-800">{selectedPlan.programName}</h3>
            <Badge className={`text-xs ${PLAN_STATUS_COLORS[selectedPlan.status]}`}>{PLAN_STATUS_LABELS[selectedPlan.status]}</Badge>
          </div>

          {/* Plan Info */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">الساعات الإجمالية</p>
                  <p className="text-xl font-bold text-slate-800">{selectedPlan.totalHours}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">المستوى</p>
                  <p className="text-xl font-bold text-slate-800">{selectedPlan.level}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">عدد الفصول</p>
                  <p className="text-xl font-bold text-slate-800">{semesters.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">عدد المقررات</p>
                  <p className="text-xl font-bold text-slate-800">{selectedPlanCourses.length}</p>
                </div>
              </div>
              {selectedPlan.description && (
                <p className="text-sm text-muted-foreground mt-3 border-t pt-3">{selectedPlan.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Add Course Button */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 flex-row-reverse">
              <Layers className="w-4 h-4" />
              المخطط الدراسي
            </span>
            <Button size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={openAddCourse}>
              <Plus className="w-3.5 h-3.5" />
              إضافة مقرر
            </Button>
          </div>

          {/* Visual Plan Diagram - Semesters as columns */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-[800px]">
              {semesters.map((sem) => {
                const semCourses = selectedPlanCourses.filter((pc) => pc.semesterOrder === sem);
                return (
                  <div key={sem} className="flex-1 min-w-[140px]">
                    <div className="bg-slate-800 text-white text-center py-2 rounded-t-lg text-xs font-bold sticky top-0 z-5">
                      {SEMESTER_ORDER_LABELS[sem] || `الفصل ${sem}`}
                    </div>
                    <div className="bg-slate-50 rounded-b-lg p-2 space-y-2 min-h-[100px]">
                      {semCourses.map((pc) => (
                        <div key={pc.id} className="bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <Badge className={`text-[9px] px-1.5 py-0 ${COURSE_TYPE_BADGE_COLORS[pc.courseType]}`}>
                              {COURSE_TYPE_LABELS[pc.courseType]}
                            </Badge>
                            <div className="flex items-center gap-0.5">
                              <button onClick={() => openEditCourse(pc)} className="p-0.5 hover:bg-slate-100 rounded">
                                <Edit className="w-3 h-3 text-slate-400" />
                              </button>
                              <button onClick={() => handleDeleteCourse(pc)} className="p-0.5 hover:bg-red-50 rounded">
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                          <p className="font-mono text-[10px] font-bold text-slate-700">{pc.courseCode}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{COURSE_NAMES[pc.courseCode] || pc.courseCode}</p>
                          {pc.prerequisiteCodes.length > 0 && (
                            <div className="flex items-center gap-0.5 mt-1 flex-wrap">
                              <span className="text-[9px] text-muted-foreground">مسبق:</span>
                              {pc.prerequisiteCodes.map((prereq) => (
                                <span key={prereq} className="font-mono text-[9px] bg-amber-50 text-amber-700 px-1 rounded">
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {semCourses.length === 0 && (
                        <p className="text-[10px] text-muted-foreground text-center py-4">لا توجد مقررات</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prerequisite Chain View */}
          {selectedPlanCourses.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
                  <ArrowRight className="w-4 h-4" />
                  سلاسل المتطلبات السابقة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {selectedPlanCourses.filter((pc) => pc.prerequisiteCodes.length > 0).map((pc) => (
                    <div key={pc.id} className="flex items-center gap-1.5 flex-wrap text-xs flex-row-reverse">
                      {pc.prerequisiteCodes.map((prereq, idx) => (
                        <span key={prereq} className="flex items-center gap-1.5">
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{prereq}</span>
                        </span>
                      ))}
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{pc.courseCode}</span>
                      <span className="text-muted-foreground">({COURSE_NAMES[pc.courseCode] || pc.courseCode})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* ===== Plan List ===== */
        <>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد خطط دراسية</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPlans.map((plan) => {
                const planCourseCount = planCourses.filter((pc) => pc.planId === plan.id).length;
                return (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-bold text-slate-800 truncate">{plan.programName}</CardTitle>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{plan.academicYear}</p>
                        </div>
                        <Badge className={`text-[10px] shrink-0 ${PLAN_STATUS_COLORS[plan.status]}`}>
                          {PLAN_STATUS_LABELS[plan.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center bg-slate-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-slate-800">{plan.totalHours}</p>
                          <p className="text-[10px] text-muted-foreground">ساعة</p>
                        </div>
                        <div className="text-center bg-slate-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-slate-800">{plan.level}</p>
                          <p className="text-[10px] text-muted-foreground">مستوى</p>
                        </div>
                        <div className="text-center bg-slate-50 rounded-lg p-2">
                          <p className="text-lg font-bold text-slate-800">{planCourseCount}</p>
                          <p className="text-[10px] text-muted-foreground">مقرر</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{plan.description}</p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs flex items-center justify-center gap-1"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض الخطة
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => openEditPlan(plan)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeletePlan(plan)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={(open) => { setCourseDialogOpen(open); if (!open) { setEditingCourse(null); resetCourseForm(); } }}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "تعديل المقرر في الخطة" : "إضافة مقرر للخطة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label>رمز المقرر</Label>
              <Input value={courseForm.courseCode} onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })} placeholder="مثال: CS101" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>رقم الفصل</Label>
                <Select value={String(courseForm.semesterOrder)} onValueChange={(v) => setCourseForm({ ...courseForm, semesterOrder: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map((s) => (
                      <SelectItem key={s} value={String(s)}>{SEMESTER_ORDER_LABELS[s] || `الفصل ${s}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>نوع المقرر</Label>
                <Select value={courseForm.courseType} onValueChange={(v) => setCourseForm({ ...courseForm, courseType: v as CourseType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">إجباري</SelectItem>
                    <SelectItem value="elective">اختياري</SelectItem>
                    <SelectItem value="university_requirement">متطلب جامعي</SelectItem>
                    <SelectItem value="college_requirement">متطلب كلية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>المتطلبات السابقة</Label>
              <div className="flex gap-2">
                <Input
                  value={courseForm.prerequisiteInput}
                  onChange={(e) => setCourseForm({ ...courseForm, prerequisiteInput: e.target.value })}
                  placeholder="أدخل رمز المقرر ثم اضغط إضافة"
                  className="font-mono text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPrerequisite(); } }}
                />
                <Button variant="outline" size="sm" onClick={addPrerequisite}>إضافة</Button>
              </div>
              {courseForm.prerequisiteCodes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {courseForm.prerequisiteCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="text-xs flex items-center gap-1">
                      {code}
                      <button onClick={() => removePrerequisite(code)} className="hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={handleSaveCourse} disabled={!courseForm.courseCode.trim() || !selectedPlan} className="bg-emerald-600 hover:bg-emerald-700 text-sm">حفظ</Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm">إلغاء</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
