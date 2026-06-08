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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  BookMarked,
  GitBranch as Version,
  CheckCircle,
  Printer,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { CourseDescription, DescriptionStatus } from "@/lib/store";
import {
  DESCRIPTION_STATUS_LABELS,
  DESCRIPTION_STATUS_COLORS,
} from "@/lib/store";

const STATUS_BADGE_COLORS: Record<DescriptionStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

// Mock data
const mockDescriptions: CourseDescription[] = [
  {
    id: "cd-1",
    courseCode: "CS101",
    description: "يقدم هذا المقرر مقدمة شاملة لمفاهيم علوم الحاسب الأساسية بما في ذلك تاريخ الحاسوب، أنظمة الأعداد، تمثيل البيانات، والمنطق الرقمي. يهدف إلى بناء أساس قوي للطلاب في مجال علوم الحاسب.",
    objectives: [
      "فهم المفاهيم الأساسية لعلوم الحاسب",
      "التعرف على أنظمة الأعداد المختلفة وتحويلاتها",
      "تمثيل البيانات داخل الحاسوب",
      "تطبيق المنطق الرقمي والبوابات المنطقية",
      "كتابة خوارزميات بسيطة",
    ],
    topics: [
      "مقدمة في علوم الحاسب وتاريخها",
      "أنظمة الأعداد (ثنائي، ثماني، عشري، سداسي عشري)",
      "تمثيل البيانات: الأعداد الصحيحة والعشرية",
      "العمليات الحسابية الثنائية",
      "المنطق الرقمي والبوابات المنطقية",
      "الجبر البوليني والمبسط",
      "مقدمة في الخوارزميات",
    ],
    textbooks: ["مقدمة في علوم الحاسب - د. أحمد الشريف"],
    references: [
      "Computer Science Illuminated - Nell Dale",
      "Structured Computer Organization - Andrew Tanenbaum",
    ],
    assessmentMethod: "40% أعمال فصلية، 60% نهائي",
    updatedBy: "د. أحمد محمد الشريف",
    version: 3,
    status: "approved",
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-08-15T00:00:00.000Z",
  },
  {
    id: "cd-2",
    courseCode: "CS201",
    description: "يدرس هذا المقرر هياكل البيانات الأساسية والمتقدمة مع التركيز على تحليل كفاءة الخوارزميات. يشمل المصفوفات، القوائم المترابطة، الأكوام، الطوابير، الأشجار، والرسوم البيانية.",
    objectives: [
      "فهم هياكل البيانات الأساسية والمتقدمة",
      "تحليل كفاءة الخوارزميات",
      "تطبيق هياكل البيانات في حل المشكلات",
      "مقارنة بين هياكل البيانات المختلفة",
    ],
    topics: [
      "تحليل الخوارزميات والتدوين O",
      "المصفوفات والقوائم المترابطة",
      "الأكوام والطوابير",
      "الأشجار الثنائية وأشجار البحث",
      "الأشجار المتوازنة AVL",
      "جداول التجزئة",
      "الرسوم البيانية وتمثيلها",
      "خوارزميات البحث والترتيب",
    ],
    textbooks: ["هياكل البيانات وتحليل الخوارزميات - د. فاطمة الحسن"],
    references: [
      "Introduction to Algorithms - Cormen et al.",
      "Data Structures and Algorithms in Java - Robert Lafore",
    ],
    assessmentMethod: "30% أعمال فصلية، 20% مشاريع، 50% نهائي",
    updatedBy: "د. فاطمة علي الحسن",
    version: 2,
    status: "approved",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-07-20T00:00:00.000Z",
  },
  {
    id: "cd-3",
    courseCode: "CS305",
    description: "مقرر اختياري في الذكاء الاصطناعي يغطي المفاهيم الأساسية والتطبيقات العملية.",
    objectives: ["فهم مفاهيم الذكاء الاصطناعي", "تطبيق خوارزميات البحث", "بناء نماذج تعلم بسيطة"],
    topics: ["مقدمة في الذكاء الاصطناعي", "خوارزميات البحث", "شبكات عصبية بسيطة"],
    textbooks: ["Artificial Intelligence: A Modern Approach"],
    references: [],
    assessmentMethod: "40% أعمال فصلية، 60% مشروع",
    updatedBy: "د. خالد العمري",
    version: 1,
    status: "draft",
    createdAt: "2024-09-01T00:00:00.000Z",
  },
];

const COURSE_NAMES: Record<string, string> = {
  CS101: "مقدمة في علوم الحاسب",
  CS201: "هياكل البيانات",
  CS305: "ذكاء اصطناعي",
};

export default function CourseDescriptions() {
  const [descriptions, setDescriptions] = useState<CourseDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesc, setSelectedDesc] = useState<CourseDescription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [printMode, setPrintMode] = useState(false);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDesc, setEditingDesc] = useState<CourseDescription | null>(null);

  // Form with array inputs
  const [form, setForm] = useState({
    courseCode: "",
    description: "",
    objectives: [] as string[],
    objectiveInput: "",
    topics: [] as string[],
    topicInput: "",
    textbooks: [] as string[],
    textbookInput: "",
    references: [] as string[],
    referenceInput: "",
    assessmentMethod: "",
    updatedBy: "",
    status: "draft" as DescriptionStatus,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/course-descriptions");
      if (res.ok) {
        const data = await res.json();
        setDescriptions(data);
      } else {
        setDescriptions(mockDescriptions);
      }
    } catch {
      setDescriptions(mockDescriptions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = descriptions.filter((d) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.courseCode.toLowerCase().includes(q) || (COURSE_NAMES[d.courseCode] || "").includes(searchQuery);
    }
    return true;
  });

  // ========== CRUD ==========

  const handleSave = async () => {
    if (!form.courseCode.trim()) return;
    try {
      const method = editingDesc ? "PUT" : "POST";
      const body = editingDesc ? { ...form, id: editingDesc.id, version: editingDesc.version } : form;
      const res = await fetch("/api/course-descriptions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingDesc ? "تم تحديث الوصف بنجاح" : "تم إنشاء الوصف بنجاح");
        setDialogOpen(false);
        setEditingDesc(null);
        resetForm();
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleDelete = async (desc: CourseDescription) => {
    try {
      const res = await fetch(`/api/course-descriptions?id=${desc.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("تم حذف الوصف بنجاح");
        if (selectedDesc?.id === desc.id) setSelectedDesc(null);
        fetchData();
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const openEdit = (desc: CourseDescription) => {
    setEditingDesc(desc);
    setForm({
      courseCode: desc.courseCode,
      description: desc.description,
      objectives: [...desc.objectives],
      objectiveInput: "",
      topics: [...desc.topics],
      topicInput: "",
      textbooks: [...desc.textbooks],
      textbookInput: "",
      references: [...desc.references],
      referenceInput: "",
      assessmentMethod: desc.assessmentMethod,
      updatedBy: desc.updatedBy,
      status: desc.status,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setForm({
      courseCode: "",
      description: "",
      objectives: [],
      objectiveInput: "",
      topics: [],
      topicInput: "",
      textbooks: [],
      textbookInput: "",
      references: [],
      referenceInput: "",
      assessmentMethod: "",
      updatedBy: "",
      status: "draft",
    });
  };

  // Array field helpers
  const addToArray = (field: "objectives" | "topics" | "textbooks" | "references", inputField: string) => {
    const inputKey = `${field === "objectives" ? "objectiveInput" : field === "topics" ? "topicInput" : field === "textbooks" ? "textbookInput" : "referenceInput"}` as keyof typeof form;
    const val = (form[inputKey] as string).trim();
    if (val && !form[field].includes(val)) {
      setForm({ ...form, [field]: [...form[field], val], [inputKey]: "" });
    }
  };

  const removeFromArray = (field: "objectives" | "topics" | "textbooks" | "references", index: number) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 200);
  };

  // ========== Render ==========

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      {/* Print-only wrapper */}
      {printMode && selectedDesc && (
        <div className="hidden print:block print:p-8 print:text-black">
          <h1 className="text-2xl font-bold text-center mb-1">وصف المقرر الدراسي</h1>
          <h2 className="text-lg font-bold text-center mb-4">{COURSE_NAMES[selectedDesc.courseCode] || selectedDesc.courseCode} ({selectedDesc.courseCode})</h2>
          <p className="mb-4">{selectedDesc.description}</p>
          <h3 className="font-bold text-lg mb-2">الأهداف</h3>
          <ul className="list-disc list-inside mb-4">{selectedDesc.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <h3 className="font-bold text-lg mb-2">المواضيع</h3>
          <ol className="list-decimal list-inside mb-4">{selectedDesc.topics.map((t, i) => <li key={i}>{t}</li>)}</ol>
          <h3 className="font-bold text-lg mb-2">الكتب المقررة</h3>
          <ul className="list-disc list-inside mb-4">{selectedDesc.textbooks.map((t, i) => <li key={i}>{t}</li>)}</ul>
          {selectedDesc.references.length > 0 && (
            <>
              <h3 className="font-bold text-lg mb-2">المراجع</h3>
              <ul className="list-disc list-inside mb-4">{selectedDesc.references.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </>
          )}
          <h3 className="font-bold text-lg mb-2">طريقة التقييم</h3>
          <p>{selectedDesc.assessmentMethod}</p>
          <div className="mt-6 text-sm text-gray-500 flex justify-between">
            <span>آخر تحديث: {selectedDesc.updatedAt ? new Date(selectedDesc.updatedAt).toLocaleDateString("ar-SA") : "-"}</span>
            <span>المحدث: {selectedDesc.updatedBy}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
          <FileText className="w-5 h-5 text-emerald-600" />
          إدارة وصف المقررات
        </h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingDesc(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
              <Plus className="w-4 h-4" />
              إضافة وصف
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingDesc ? "تعديل وصف المقرر" : "إضافة وصف جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>رمز المقرر</Label>
                  <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="CS101" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>الحالة</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DescriptionStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                      <SelectItem value="archived">مؤرشف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>الوصف</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="وصف شامل للمقرر" />
              </div>
              <div className="space-y-1.5">
                <Label>الأهداف ({form.objectives.length})</Label>
                <div className="flex gap-2">
                  <Input value={form.objectiveInput} onChange={(e) => setForm({ ...form, objectiveInput: e.target.value })} placeholder="أدخل الهدف ثم اضغط إضافة" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToArray("objectives", "objectiveInput"); } }} />
                  <Button variant="outline" size="sm" onClick={() => addToArray("objectives", "objectiveInput")}>إضافة</Button>
                </div>
                {form.objectives.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {form.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1 text-xs">
                        <span className="flex-1">{i + 1}. {obj}</span>
                        <button onClick={() => removeFromArray("objectives", i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>المواضيع ({form.topics.length})</Label>
                <div className="flex gap-2">
                  <Input value={form.topicInput} onChange={(e) => setForm({ ...form, topicInput: e.target.value })} placeholder="أدخل الموضوع ثم اضغط إضافة" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToArray("topics", "topicInput"); } }} />
                  <Button variant="outline" size="sm" onClick={() => addToArray("topics", "topicInput")}>إضافة</Button>
                </div>
                {form.topics.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {form.topics.map((topic, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded px-2 py-1 text-xs">
                        <span className="flex-1">{i + 1}. {topic}</span>
                        <button onClick={() => removeFromArray("topics", i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>الكتب المقررة ({form.textbooks.length})</Label>
                <div className="flex gap-2">
                  <Input value={form.textbookInput} onChange={(e) => setForm({ ...form, textbookInput: e.target.value })} placeholder="اسم الكتاب" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToArray("textbooks", "textbookInput"); } }} />
                  <Button variant="outline" size="sm" onClick={() => addToArray("textbooks", "textbookInput")}>إضافة</Button>
                </div>
                {form.textbooks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.textbooks.map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                        <BookMarked className="w-3 h-3" />
                        {t}
                        <button onClick={() => removeFromArray("textbooks", i)} className="hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>المراجع ({form.references.length})</Label>
                <div className="flex gap-2">
                  <Input value={form.referenceInput} onChange={(e) => setForm({ ...form, referenceInput: e.target.value })} placeholder="المرجع" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToArray("references", "referenceInput"); } }} />
                  <Button variant="outline" size="sm" onClick={() => addToArray("references", "referenceInput")}>إضافة</Button>
                </div>
                {form.references.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.references.map((r, i) => (
                      <Badge key={i} variant="outline" className="text-xs flex items-center gap-1">
                        {r}
                        <button onClick={() => removeFromArray("references", i)} className="hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>طريقة التقييم</Label>
                <Input value={form.assessmentMethod} onChange={(e) => setForm({ ...form, assessmentMethod: e.target.value })} placeholder="40% أعمال فصلية، 60% نهائي" />
              </div>
              <div className="space-y-1.5">
                <Label>آخر تحديث بواسطة</Label>
                <Input value={form.updatedBy} onChange={(e) => setForm({ ...form, updatedBy: e.target.value })} placeholder="اسم المحرر" />
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
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="بحث بالرمز أو الاسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-xs" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Detail View or List */}
      {selectedDesc ? (
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setSelectedDesc(null)} className="flex items-center gap-1 text-xs">
              <ChevronLeft className="w-4 h-4" />
              العودة
            </Button>
            <h3 className="text-base font-bold text-slate-800">{COURSE_NAMES[selectedDesc.courseCode] || selectedDesc.courseCode}</h3>
            <Badge className={`font-mono text-xs ${STATUS_BADGE_COLORS[selectedDesc.status]}`}>{selectedDesc.courseCode}</Badge>
            <Badge className={`text-xs ${DESCRIPTION_STATUS_COLORS[selectedDesc.status]}`}>{DESCRIPTION_STATUS_LABELS[selectedDesc.status]}</Badge>
            <div className="flex items-center gap-1 mr-auto">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5" />
                طباعة
              </Button>
            </div>
          </div>

          {/* Version tracking */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1 flex-row-reverse">
                  <Version className="w-3.5 h-3.5" />
                  الإصدار {selectedDesc.version}
                </span>
                <span>|</span>
                <span>آخر تحديث: {selectedDesc.updatedAt ? new Date(selectedDesc.updatedAt).toLocaleDateString("ar-SA") : "-"}</span>
                <span>|</span>
                <span>المحدث: {selectedDesc.updatedBy}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Description */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
                  <FileText className="w-4 h-4" />
                  الوصف
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm leading-relaxed text-slate-700">{selectedDesc.description}</p>
              </CardContent>
            </Card>

            {/* Assessment */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
                  <CheckCircle className="w-4 h-4" />
                  طريقة التقييم
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-slate-700">{selectedDesc.assessmentMethod}</p>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">الأهداف التعليمية</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ol className="space-y-2">
                  {selectedDesc.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm flex-row-reverse">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Topics */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">المواضيع</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ol className="space-y-1.5">
                  {selectedDesc.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm flex-row-reverse">
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Textbooks */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
                  <BookMarked className="w-4 h-4" />
                  الكتب المقررة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ul className="space-y-1.5">
                  {selectedDesc.textbooks.map((t, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2 flex-row-reverse">
                      <BookMarked className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* References */}
            {selectedDesc.references.length > 0 && (
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">المراجع</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ul className="space-y-1.5">
                    {selectedDesc.references.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{i + 1}. {r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد وصفوص مقررات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((desc) => (
                <Card key={desc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="font-mono text-sm font-bold text-slate-700">{desc.courseCode}</span>
                          <span className="text-sm font-semibold text-slate-800">{COURSE_NAMES[desc.courseCode] || desc.courseCode}</span>
                          <Badge className={`text-[10px] ${STATUS_BADGE_COLORS[desc.status]}`}>{DESCRIPTION_STATUS_LABELS[desc.status]}</Badge>
                          <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
                            <Version className="w-2.5 h-2.5" />
                            v{desc.version}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{desc.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span>الأهداف: {desc.objectives.length}</span>
                          <span>المواضيع: {desc.topics.length}</span>
                          <span>آخر تحديث: {desc.updatedAt ? new Date(desc.updatedAt).toLocaleDateString("ar-SA") : "-"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => setSelectedDesc(desc)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => openEdit(desc)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(desc)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
