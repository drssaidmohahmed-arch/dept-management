'use client';

import { useState, useMemo } from "react";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ArrowRightLeft,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  BookOpen,
  Send,
  History,
} from "lucide-react";
import {
  useTransfers,
  useMembers,
  useCourses,
  addTransferRequest,
  cancelTransfer,
  TRANSFER_STATUS_LABELS,
  TRANSFER_STATUS_COLORS,
  ACADEMIC_RANK_OPTIONS,
} from "@/lib/supabase-store";
import type { EmployeeTransfer } from "@/lib/supabase-store";

// Simulated current employee (for demo purposes, using first employee)
export default function EmployeeTransferRequest() {
  const transfers = useTransfers();
  const members = useMembers();
  const courses = useCourses();

  // Find current employee (demo: use first employee member)
  const currentEmployee = useMemo(
    () => members.find((m) => m.role === "employee"),
    [members]
  );

  const employeeTransfers = useMemo(
    () =>
      currentEmployee
        ? transfers.filter((t) => t.employeeId === currentEmployee.id)
        : [],
    [transfers, currentEmployee]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestedRank, setRequestedRank] = useState("lecturer");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [coursesInput, setCoursesInput] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    transfer: EmployeeTransfer | null;
  }>({ open: false, transfer: null });

  const handleSubmit = async () => {
    if (!currentEmployee || !reason.trim() || !specialization.trim()) return;
    setIsSubmitting(true);
    try {
      await addTransferRequest({
        employee_id: currentEmployee.id,
        employee_name: currentEmployee.name,
        current_position: currentEmployee.position,
        requested_rank: requestedRank,
        requested_specialization: specialization.trim(),
        requested_qualification: qualification.trim(),
        courses_to_teach: selectedCourses.length > 0
          ? selectedCourses
          : coursesInput
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
        reason: reason.trim(),
      });
      setDialogOpen(false);
      setRequestedRank("lecturer");
      setSpecialization("");
      setQualification("");
      setCoursesInput("");
      setSelectedCourses([]);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (transferId: string) => {
    await cancelTransfer(transferId);
  };

  const getRankLabel = (rank: string) => {
    const option = ACADEMIC_RANK_OPTIONS.find((o) => o.value === rank);
    return option?.label || rank;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasPendingRequest = employeeTransfers.some(
    (t) => t.status === "pending" || t.status === "under_review"
  );

  const statCards = [
    { label: "إجمالي الطلبات", value: employeeTransfers.length, icon: History, color: "bg-slate-50 text-slate-700" },
    { label: "قيد الانتظار", value: employeeTransfers.filter((t) => t.status === "pending").length, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
    { label: "مقبول", value: employeeTransfers.filter((t) => t.status === "approved").length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    { label: "مرفوض", value: employeeTransfers.filter((t) => t.status === "rejected").length, icon: XCircle, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-2.5 sm:p-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-xl font-bold truncate">{card.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Request Button */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          طلبات التحويل
        </h3>
        <Button
          size="sm"
          className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm rounded-lg"
          onClick={() => setDialogOpen(true)}
          disabled={hasPendingRequest}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">طلب تحويل جديد</span>
          <span className="sm:hidden">طلب جديد</span>
        </Button>
      </div>
      {hasPendingRequest && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">لديك طلب قيد الانتظار. لا يمكنك تقديم طلب جديد حتى يتم البت في الطلب الحالي.</p>
        </div>
      )}

      {/* Transfer Requests History */}
      {employeeTransfers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لم تقم بتقديم أي طلب تحويل بعد</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {employeeTransfers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((transfer) => (
            <Card key={transfer.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status Badge */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-2">
                      <Badge className={`text-[10px] sm:text-xs border ${TRANSFER_STATUS_COLORS[transfer.status]}`}>
                        {TRANSFER_STATUS_LABELS[transfer.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 flex-row-reverse">
                        <Calendar className="w-3 h-3" />
                        {formatDate(transfer.createdAt)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-row-reverse">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>الرتبة المطلوبة: <span className="text-slate-700 font-medium">{getRankLabel(transfer.requestedRank)}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-row-reverse">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>التخصص: <span className="text-slate-700 font-medium">{transfer.requestedSpecialization || 'غير محدد'}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-row-reverse">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>المؤهل: <span className="text-slate-700 font-medium">{transfer.requestedQualification || 'غير محدد'}</span></span>
                      </div>
                    </div>

                    {/* Courses */}
                    {transfer.coursesToTeach.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {transfer.coursesToTeach.map((course) => (
                          <Badge key={course} variant="outline" className="text-[10px] px-1.5 py-0">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Reason */}
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mt-1.5 line-clamp-2">
                      {transfer.reason}
                    </p>

                    {/* Review Notes */}
                    {transfer.reviewNotes && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">ملاحظات: {transfer.reviewedByName}</p>
                        <p className="text-xs text-slate-700">{transfer.reviewNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-600 border-slate-200 hover:bg-slate-50 text-[10px] sm:text-xs px-2 sm:px-3"
                      onClick={() => setDetailDialog({ open: true, transfer })}
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                      <span className="hidden sm:inline">التفاصيل</span>
                    </Button>
                    {(transfer.status === "pending" || transfer.status === "under_review") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-[10px] sm:text-xs px-2 sm:px-3"
                        onClick={() => handleCancel(transfer.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                        <span className="hidden sm:inline">إلغاء</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              تقديم طلب تحويل
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rank">الرتبة الأكاديمية المطلوبة *</Label>
              <Select value={requestedRank} onValueChange={setRequestedRank}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الرتبة" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_RANK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialization">التخصص المطلوب *</Label>
              <Input
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="مثال: علوم الحاسب، هندسة البرمجيات"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qualification">المؤهل العلمي *</Label>
              <Input
                id="qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="مثال: ماجستير في تقنية المعلومات"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="courses">المقررات المقترحة للتدريس</Label>
              {courses.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  <p className="text-[10px] text-muted-foreground">اختر من المقررات المتاحة أو أدخل رموز يدوياً:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((course) => {
                      const isSelected = selectedCourses.includes(course.code);
                      return (
                        <button
                          key={course.code}
                          type="button"
                          onClick={() =>
                            setSelectedCourses((prev) =>
                              isSelected
                                ? prev.filter((c) => c !== course.code)
                                : [...prev, course.code]
                            )
                          }
                          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-mono">{course.code}</span>
                          <span>{course.name}</span>
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <Input
                id="courses"
                value={coursesInput}
                onChange={(e) => setCoursesInput(e.target.value)}
                placeholder="أو أدخل رموز المقررات مفصولة بفاصلة، مثال: CS101, CS201"
              />
              <p className="text-[10px] text-muted-foreground">افصل بين رموز المقررات بفاصلة (,)</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">سبب طلب التحويل *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اشرح أسباب رغبتك في الانتقال للعمل الأكاديمي..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim() || !specialization.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              تقديم الطلب
            </Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm">إلغاء</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto" dir="rtl">
          {detailDialog.transfer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  تفاصيل طلب التحويل
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">الحالة:</span>
                  <Badge className={`border ${TRANSFER_STATUS_COLORS[detailDialog.transfer.status]}`}>
                    {TRANSFER_STATUS_LABELS[detailDialog.transfer.status]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">الرتبة المطلوبة</p>
                    <p className="text-sm font-medium">{getRankLabel(detailDialog.transfer.requestedRank)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">التخصص</p>
                    <p className="text-sm font-medium">{detailDialog.transfer.requestedSpecialization || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">المؤهل</p>
                    <p className="text-sm font-medium">{detailDialog.transfer.requestedQualification || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">تاريخ التقديم</p>
                    <p className="text-sm font-medium">{formatDate(detailDialog.transfer.createdAt)}</p>
                  </div>
                </div>
                {detailDialog.transfer.coursesToTeach.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">المقررات المقترحة</p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailDialog.transfer.coursesToTeach.map((course) => (
                        <Badge key={course} variant="outline" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">السبب</p>
                  <p className="text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {detailDialog.transfer.reason}
                  </p>
                </div>
                {detailDialog.transfer.reviewNotes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ملاحظات المراجعة ({detailDialog.transfer.reviewedByName})</p>
                    <p className="text-sm leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
                      {detailDialog.transfer.reviewNotes}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">إغلاق</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
