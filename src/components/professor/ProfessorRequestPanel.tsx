'use client';

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Send,
  Plus,
  Trash2,
  Clock,
  Calendar,
  ArrowUpDown,
  Building2,
  GraduationCap,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";
import {
  useProfessorRequests,
  useEnrolledStudents,
  addProfessorRequest,
  deleteProfessorRequest,
  PROF_REQ_CATEGORY_LABELS,
  PROF_REQ_CATEGORY_COLORS,
  PROF_REQ_TARGET_LABELS,
  PROF_REQ_TARGET_COLORS,
  PROF_REQ_STATUS_LABELS,
  PROF_REQ_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  type ProfessorRequestCategory,
  type ProfessorRequestTarget,
} from "@/lib/store";

// ============ New Request Dialog ============

function NewRequestDialog({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ProfessorRequestTarget>("department");
  const [category, setCategory] = useState<ProfessorRequestCategory>("academic");
  const [priority, setPriority] = useState<"urgent" | "important" | "normal">("normal");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [targetStudentId, setTargetStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enrolledStudents = useEnrolledStudents();

  // Unique students list
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    enrolledStudents.forEach((s) => {
      if (!map.has(s.studentId)) {
        map.set(s.studentId, { id: s.studentId, name: s.name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [enrolledStudents]);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const targetStudent = target === "student" && targetStudentId
      ? uniqueStudents.find((s) => s.id === targetStudentId)
      : undefined;

    addProfessorRequest({
      category,
      target,
      targetStudentId: targetStudent?.id,
      targetStudentName: targetStudent?.name,
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubject("");
      setDescription("");
      setTargetStudentId("");
      setTarget("department");
      setCategory("academic");
      setPriority("normal");
      setOpen(false);
      onClose();
    }, 500);
  };

  const isValid = subject.trim().length >= 3 && description.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700">
          <Plus className="w-4 h-4" />
          تقديم طلب جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-600" />
            تقديم طلب جديد
          </DialogTitle>
          <DialogDescription>
            اختر نوع الوجهة والتفاصيل لإرسال طلبك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Target Direction */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              وجهة الطلب
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  target === "department"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-border hover:border-indigo-300"
                }`}
                onClick={() => setTarget("department")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">موجه للقسم</p>
                    <p className="text-xs text-muted-foreground">
                      إرسال الطلب لإدارة القسم
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  target === "student"
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                    : "border-border hover:border-orange-300"
                }`}
                onClick={() => setTarget("student")}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">موجه لطالب</p>
                    <p className="text-xs text-muted-foreground">
                      إرسال الطلب لطالب محدد
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Student Selection (if target is student) */}
          {target === "student" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Label>اختر الطالب</Label>
              <Select value={targetStudentId} onValueChange={setTargetStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="ابحث واختر الطالب..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} — {student.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تصنيف الطلب</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ProfessorRequestCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROF_REQ_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as "urgent" | "important" | "normal")}
              >
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
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>موضوع الطلب</Label>
            <Input
              placeholder="أدخل موضوع الطلب..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>تفاصيل الطلب</Label>
            <Textarea
              placeholder="اكتب تفاصيل الطلب بشكل كامل..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting || (target === "student" && !targetStudentId)}
              className="flex-1 bg-sky-600 hover:bg-sky-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال الطلب
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Request Card ============

function RequestCard({
  request,
  onDelete,
}: {
  request: ReturnType<typeof useProfessorRequests>[number];
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const TargetIcon = request.target === "department" ? Building2 : GraduationCap;

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 border">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs ${PROF_REQ_CATEGORY_COLORS[request.category]}`}>
                {PROF_REQ_CATEGORY_LABELS[request.category]}
              </Badge>
              <Badge className={`text-xs ${PROF_REQ_TARGET_COLORS[request.target]} flex items-center gap-1`}>
                <TargetIcon className="w-3 h-3" />
                {PROF_REQ_TARGET_LABELS[request.target]}
              </Badge>
              <Badge className={`text-xs ${PROF_REQ_STATUS_COLORS[request.status]}`}>
                {PROF_REQ_STATUS_LABELS[request.status]}
              </Badge>
              <Badge className={`text-xs ${PRIORITY_COLORS[request.priority]}`}>
                {PRIORITY_LABELS[request.priority]}
              </Badge>
            </div>
            {request.status === "pending" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Student info if targeted */}
          {request.target === "student" && request.targetStudentName && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-orange-50 rounded-lg">
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {request.targetStudentName}
              </span>
              {request.targetStudentId && (
                <span className="text-xs text-orange-600">
                  ({request.targetStudentId})
                </span>
              )}
            </div>
          )}

          {/* Subject */}
          <h3 className="font-semibold text-base mb-1">{request.subject}</h3>

          {/* Description (toggle) */}
          <p className={`text-muted-foreground text-sm leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {request.description}
          </p>
          {request.description.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sky-600 text-xs mt-1 flex items-center gap-1 hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  عرض أقل
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  عرض المزيد
                </>
              )}
            </button>
          )}

          {/* Response (if exists) */}
          {request.response && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-semibold text-emerald-800">الرد:</span>
              </div>
              <p className="text-sm text-emerald-700 leading-relaxed">{request.response}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(request.createdAt).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {request.updatedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                آخر تحديث:{" "}
                {new Date(request.updatedAt).toLocaleDateString("ar-SA", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(request.id)}
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============ Stats Cards ============

function StatsCards({ requests }: { requests: ReturnType<typeof useProfessorRequests> }) {
  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const toDepartment = requests.filter((r) => r.target === "department").length;
  const toStudent = requests.filter((r) => r.target === "student").length;

  const stats = [
    { label: "إجمالي الطلبات", value: requests.length, icon: Send, color: "bg-sky-50 text-sky-700" },
    { label: "قيد الانتظار", value: pending, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
    { label: "مقبولة", value: approved, icon: CheckCircle2, color: "bg-green-50 text-green-700" },
    { label: "قيد المعالجة", value: inProgress, icon: Loader2, color: "bg-blue-50 text-blue-700" },
    { label: "موجهة للقسم", value: toDepartment, icon: Building2, color: "bg-indigo-50 text-indigo-700" },
    { label: "موجهة لطلاب", value: toStudent, icon: GraduationCap, color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============ Main Component ============

export default function ProfessorRequestPanel() {
  const requests = useProfessorRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTarget, setFilterTarget] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.targetStudentName && r.targetStudentName.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus);
    }

    // Target filter
    if (filterTarget !== "all") {
      result = result.filter((r) => r.target === filterTarget);
    }

    // Category filter
    if (filterCategory !== "all") {
      result = result.filter((r) => r.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [requests, searchQuery, filterStatus, filterTarget, filterCategory, sortBy]);

  const handleDelete = (id: string) => {
    deleteProfessorRequest(id);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-600" />
            إدارة الطلبات
          </h2>
          <p className="text-sm text-muted-foreground">
            تقديم ومتابعة الطلبات الموجهة للقسم أو للطلاب
          </p>
        </div>
        <NewRequestDialog onClose={() => {}} />
      </div>

      {/* Stats */}
      <StatsCards requests={requests} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الطلبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>

            {/* Target Filter */}
            <Select value={filterTarget} onValueChange={setFilterTarget}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="الوجهة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الوجهات</SelectItem>
                <SelectItem value="department">موجه للقسم</SelectItem>
                <SelectItem value="student">موجه لطالب</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {Object.entries(PROF_REQ_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1 shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === "newest" ? "الأحدث أولاً" : "الأقدم أولاً"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          عرض {filteredRequests.length} من {requests.length} طلب
        </p>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">لا توجد طلبات</p>
          <p className="text-sm">
            {requests.length === 0
              ? "لم تقم بتقديم أي طلب بعد. اضغط على \"تقديم طلب جديد\" للبدء."
              : "لا توجد طلبات تطابق معايير البحث."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
