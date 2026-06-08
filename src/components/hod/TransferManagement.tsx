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
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  UserCheck,
  Calendar,
  BookOpen,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import {
  useTransfers,
  updateTransferStatus,
  TRANSFER_STATUS_LABELS,
  TRANSFER_STATUS_COLORS,
  ACADEMIC_RANK_OPTIONS,
} from "@/lib/supabase-store";

export default function TransferManagement() {
  const transfers = useTransfers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "under_review";
    transferId: string;
  }>({ open: false, action: "approve", transferId: "" });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    transfer: import("@/lib/supabase-store").EmployeeTransfer | null;
  }>({ open: false, transfer: null });
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTransfers = useMemo(() => {
    let filtered = transfers;
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.employeeName.toLowerCase().includes(q) ||
          t.requestedSpecialization.toLowerCase().includes(q) ||
          t.currentPosition.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transfers, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: transfers.length,
      pending: transfers.filter((t) => t.status === "pending").length,
      underReview: transfers.filter((t) => t.status === "under_review").length,
      approved: transfers.filter((t) => t.status === "approved").length,
      rejected: transfers.filter((t) => t.status === "rejected").length,
    };
  }, [transfers]);

  const handleAction = async () => {
    if (!actionDialog.transferId) return;
    setIsSubmitting(true);
    try {
      const statusMap = {
        approve: "approved",
        reject: "rejected",
        under_review: "under_review",
      };
      await updateTransferStatus(
        actionDialog.transferId,
        statusMap[actionDialog.action],
        "رئيس القسم",
        reviewNotes.trim() || undefined
      );
    } finally {
      setIsSubmitting(false);
      setActionDialog({ open: false, action: "approve", transferId: "" });
      setReviewNotes("");
    }
  };

  const openActionDialog = (
    action: "approve" | "reject" | "under_review",
    transferId: string
  ) => {
    setActionDialog({ open: true, action, transferId });
    setReviewNotes("");
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

  const statCards = [
    { label: "الإجمالي", value: stats.total, icon: ClipboardList, color: "bg-slate-50 text-slate-700" },
    { label: "قيد الانتظار", value: stats.pending, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
    { label: "قيد المراجعة", value: stats.underReview, icon: Eye, color: "bg-blue-50 text-blue-700" },
    { label: "مقبول", value: stats.approved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    { label: "مرفوض", value: stats.rejected, icon: XCircle, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
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
                    <p className="text-base sm:text-xl md:text-2xl font-bold truncate">{card.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو التخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 text-sm">
                <Filter className="w-4 h-4 ml-1.5 shrink-0" />
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="under_review">قيد المراجعة</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="cancelled">ملغى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Requests List */}
      {filteredTransfers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد طلبات تحويل حالياً</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status & Employee Name */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-2">
                      <Badge className={`text-[10px] sm:text-xs border ${TRANSFER_STATUS_COLORS[transfer.status]}`}>
                        {TRANSFER_STATUS_LABELS[transfer.status]}
                      </Badge>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">{transfer.employeeName}</span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground flex-row-reverse">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>المسمى الحالي: <span className="text-slate-700 font-medium">{transfer.currentPosition}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground flex-row-reverse">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>الرتبة المطلوبة: <span className="text-slate-700 font-medium">{getRankLabel(transfer.requestedRank)}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground flex-row-reverse">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>التخصص: <span className="text-slate-700 font-medium">{transfer.requestedSpecialization || 'غير محدد'}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground flex-row-reverse">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDate(transfer.createdAt)}</span>
                      </div>
                    </div>

                    {/* Courses & Reason */}
                    {transfer.coursesToTeach.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mb-1.5">
                        {transfer.coursesToTeach.map((course) => (
                          <Badge key={course} variant="outline" className="text-[10px] px-1.5 py-0">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {transfer.reason}
                    </p>

                    {/* Review Notes */}
                    {transfer.reviewNotes && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 flex items-center gap-1 flex-row-reverse">
                          <AlertTriangle className="w-3 h-3" />
                          ملاحظات المراجعة ({transfer.reviewedByName}):
                        </p>
                        <p className="text-xs sm:text-sm text-slate-700">{transfer.reviewNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 sm:flex-col shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-600 border-slate-200 hover:bg-slate-50 text-[10px] sm:text-xs px-2 sm:px-3"
                      onClick={() => setDetailDialog({ open: true, transfer })}
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                      <span className="hidden sm:inline">التفاصيل</span>
                    </Button>
                    {transfer.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 text-[10px] sm:text-xs px-2 sm:px-3"
                          onClick={() => openActionDialog("under_review", transfer.id)}
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                          <span className="hidden sm:inline">مراجعة</span>
                        </Button>
                      </>
                    )}
                    {(transfer.status === "pending" || transfer.status === "under_review") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] sm:text-xs px-2 sm:px-3"
                          onClick={() => openActionDialog("approve", transfer.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                          <span className="hidden sm:inline">قبول</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 text-[10px] sm:text-xs px-2 sm:px-3"
                          onClick={() => openActionDialog("reject", transfer.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                          <span className="hidden sm:inline">رفض</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto" dir="rtl">
          {detailDialog.transfer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  تفاصيل طلب التحويل
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">اسم الموظف</p>
                    <p className="text-sm font-medium">{detailDialog.transfer.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">الحالة</p>
                    <Badge className={`border ${TRANSFER_STATUS_COLORS[detailDialog.transfer.status]}`}>
                      {TRANSFER_STATUS_LABELS[detailDialog.transfer.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">المسمى الحالي</p>
                    <p className="text-sm font-medium">{detailDialog.transfer.currentPosition}</p>
                  </div>
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
                </div>
                {detailDialog.transfer.coursesToTeach.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">المقررات المطلوبة للتدريس</p>
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
                    <p className="text-xs text-muted-foreground mb-1">ملاحظات المراجعة</p>
                    <p className="text-sm leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
                      {detailDialog.transfer.reviewNotes}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-row-reverse">
                  <Calendar className="w-3.5 h-3.5" />
                  تاريخ التقديم: {formatDate(detailDialog.transfer.createdAt)}
                </div>
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

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approve" && "قبول طلب التحويل"}
              {actionDialog.action === "reject" && "رفض طلب التحويل"}
              {actionDialog.action === "under_review" && "تحويل إلى قيد المراجعة"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {actionDialog.action === "under_review" && (
              <p className="text-sm text-muted-foreground">
                سيتم تحويل حالة الطلب إلى &quot;قيد المراجعة&quot; ويمكنك قبوله أو رفضه لاحقاً.
              </p>
            )}
            {(actionDialog.action === "approve" || actionDialog.action === "reject") && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">ملاحظات المراجعة (اختياري)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    actionDialog.action === "approve"
                      ? "أدخل تعليقاً أو ملاحظات..."
                      : "أدخل سبب الرفض..."
                  }
                  rows={3}
                />
              </div>
            )}
            {actionDialog.action === "approve" && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700">
                  عند القبول، سيتم تحويل دور الموظف إلى عضو هيئة تدريس وإنشاء ملف أكاديمي له تلقائياً.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              onClick={handleAction}
              disabled={isSubmitting}
              className={
                actionDialog.action === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-sm"
                  : actionDialog.action === "reject"
                  ? "bg-red-600 hover:bg-red-700 text-sm"
                  : "bg-blue-600 hover:bg-blue-700 text-sm"
              }
            >
              {isSubmitting && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              {actionDialog.action === "approve" && "تأكيد القبول"}
              {actionDialog.action === "reject" && "تأكيد الرفض"}
              {actionDialog.action === "under_review" && "تحويل إلى مراجعة"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm">إلغاء</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
