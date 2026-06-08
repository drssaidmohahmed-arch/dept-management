'use client';

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Reply,
  GraduationCap,
  UserCheck,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  useProfessorRequests,
  useStudentRequests,
  updateProfessorRequestStatus,
  deleteStudentRequest,
  updateStudentRequestStatus,
  PROF_REQ_STATUS_LABELS,
  PROF_REQ_STATUS_COLORS,
  PROF_REQ_CATEGORY_LABELS,
  PROF_REQ_CATEGORY_COLORS,
  PROF_REQ_TARGET_LABELS,
  PROF_REQ_TARGET_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from "@/lib/supabase-store";
import type { ProfessorRequestStatus } from "@/lib/supabase-store";

export default function DepartmentRequestManager() {
  const professorRequests = useProfessorRequests();
  const studentRequests = useStudentRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "professor" | "student";
    action: "approve" | "reject" | "in_progress";
    requestId: string;
  }>({ open: false, type: "professor", action: "approve", requestId: "" });
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter professor requests where target === "department"
  const departmentRequests = useMemo(
    () => professorRequests.filter((r) => r.target === "department"),
    [professorRequests]
  );

  // All requests combined for stats
  const allPending = departmentRequests.filter((r) => r.status === "pending").length +
    studentRequests.filter((r) => r.status === "pending").length;
  const allApproved = departmentRequests.filter((r) => r.status === "approved").length +
    studentRequests.filter((r) => r.status === "approved").length;
  const allRejected = departmentRequests.filter((r) => r.status === "rejected").length +
    studentRequests.filter((r) => r.status === "rejected").length;
  const allInProgress = departmentRequests.filter((r) => r.status === "in_progress").length;
  const allTotal = departmentRequests.length + studentRequests.length;

  // Filtered professor requests
  const filteredProfessorRequests = useMemo(() => {
    let filtered = departmentRequests;
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [departmentRequests, statusFilter, searchQuery]);

  // Filtered student requests
  const filteredStudentRequests = useMemo(() => {
    let filtered = studentRequests;
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.type.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [studentRequests, statusFilter, searchQuery]);

  const handleAction = async () => {
    if (!actionDialog.requestId) return;
    setIsSubmitting(true);
    try {
      if (actionDialog.type === "professor") {
        const statusMap: Record<string, ProfessorRequestStatus> = {
          approve: "approved",
          reject: "rejected",
          in_progress: "in_progress",
        };
        await updateProfessorRequestStatus(
          actionDialog.requestId,
          statusMap[actionDialog.action],
          responseText.trim() || undefined
        );
      } else {
        // For student requests: use updateStudentRequestStatus to properly approve/reject
        const statusValue = actionDialog.action === "approve" ? "approved" : "rejected";
        await updateStudentRequestStatus(
          actionDialog.requestId,
          statusValue,
          responseText.trim() || undefined
        );
      }
    } finally {
      setIsSubmitting(false);
      setActionDialog({ open: false, type: "professor", action: "approve", requestId: "" });
      setResponseText("");
    }
  };

  const openActionDialog = (
    type: "professor" | "student",
    action: "approve" | "reject" | "in_progress",
    requestId: string
  ) => {
    setActionDialog({ open: true, type, action, requestId });
    setResponseText("");
  };

  const statCards = [
    { label: "الإجمالي", value: allTotal, icon: ClipboardList, color: "bg-slate-50 text-slate-700" },
    { label: "قيد الانتظار", value: allPending, icon: Clock, color: "bg-yellow-50 text-yellow-700" },
    { label: "قيد المعالجة", value: allInProgress, icon: Filter, color: "bg-blue-50 text-blue-700" },
    { label: "مقبول", value: allApproved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    { label: "مرفوض", value: allRejected, icon: XCircle, color: "bg-red-50 text-red-700" },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

      {/* Search & Filter Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الطلبات..."
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
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="approved">مقبول</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="professor-requests" className="w-full">
        <TabsList className="w-full flex h-auto gap-1 p-1 bg-white border rounded-xl shadow-sm">
          <TabsTrigger
            value="professor-requests"
            className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
          >
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">طلبات الأساتذة</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mr-1">
              {departmentRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="student-requests"
            className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
          >
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">طلبات الطلاب</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mr-1">
              {studentRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Professor Requests Tab */}
        <TabsContent value="professor-requests" className="mt-3">
          {filteredProfessorRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد طلبات أساتذة حالياً</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredProfessorRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-2">
                          <Badge className={`text-[10px] sm:text-xs ${PROF_REQ_STATUS_COLORS[req.status]}`}>
                            {PROF_REQ_STATUS_LABELS[req.status]}
                          </Badge>
                          <Badge className={`text-[10px] sm:text-xs ${PROF_REQ_CATEGORY_COLORS[req.category]}`}>
                            {PROF_REQ_CATEGORY_LABELS[req.category]}
                          </Badge>
                          <Badge className={`text-[10px] sm:text-xs ${PRIORITY_COLORS[req.priority]}`}>
                            {PRIORITY_LABELS[req.priority]}
                          </Badge>
                        </div>

                        {/* Subject */}
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1">
                          {req.subject}
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2">
                          {req.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 flex-row-reverse">
                            <Calendar className="w-3 h-3" />
                            {formatDate(req.createdAt)}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${PROF_REQ_TARGET_COLORS[req.target]}`}>
                            {PROF_REQ_TARGET_LABELS[req.target]}
                          </Badge>
                        </div>

                        {/* Response (if any) */}
                        {req.response && (
                          <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 flex items-center gap-1 flex-row-reverse">
                              <Reply className="w-3 h-3" />
                              الرد:
                            </p>
                            <p className="text-xs sm:text-sm text-slate-700">{req.response}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {req.status === "pending" && (
                        <div className="flex items-center gap-1.5 sm:flex-col shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("professor", "approve", req.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">قبول</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("professor", "in_progress", req.id)}
                          >
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">معالجة</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("professor", "reject", req.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">رفض</span>
                          </Button>
                        </div>
                      )}
                      {req.status === "in_progress" && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("professor", "approve", req.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">قبول</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("professor", "reject", req.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">رفض</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Student Requests Tab */}
        <TabsContent value="student-requests" className="mt-3">
          {filteredStudentRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد طلبات طلاب حالياً</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredStudentRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-2">
                          <Badge className={`text-[10px] sm:text-xs ${REQUEST_STATUS_COLORS[req.status]}`}>
                            {REQUEST_STATUS_LABELS[req.status]}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {req.type}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-slate-800 font-medium mb-1">
                          {req.description}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground flex-row-reverse">
                          <Calendar className="w-3 h-3" />
                          {formatDate(req.createdAt)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {req.status === "pending" && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("student", "approve", req.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">قبول</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-[10px] sm:text-xs px-2 sm:px-3"
                            onClick={() => openActionDialog("student", "reject", req.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            <span className="hidden sm:inline">رفض</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approve" && "قبول الطلب"}
              {actionDialog.action === "reject" && "رفض الطلب"}
              {actionDialog.action === "in_progress" && "تحويل إلى قيد المعالجة"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {(actionDialog.action === "approve" || actionDialog.action === "reject") && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">الرد (اختياري)</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={
                    actionDialog.action === "approve"
                      ? "أدخل تعليقاً أو ملاحظات..."
                      : "أدخل سبب الرفض..."
                  }
                  rows={3}
                />
              </div>
            )}
            {actionDialog.action === "in_progress" && (
              <p className="text-sm text-muted-foreground">
                سيتم تحويل حالة الطلب إلى &quot;قيد المعالجة&quot; ويمكنك الرد لاحقاً عند قبول أو رفض الطلب.
              </p>
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
              {actionDialog.action === "in_progress" && "تحويل إلى معالجة"}
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
