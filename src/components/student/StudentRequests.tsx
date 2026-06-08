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
  Plus,
  Trash2,
  ClipboardList,
  FileText,
  Calendar,
  Send,
} from "lucide-react";
import {
  useStudentRequests,
  addStudentRequest,
  deleteStudentRequest,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
} from "@/lib/supabase-store";

const REQUEST_TYPES = [
  { value: "transcript", label: "كشف درجات" },
  { value: "enrollment", label: "تأكيد قيد" },
  { value: "transfer", label: "معادلة مقررات" },
  { value: "withdrawal", label: "انسحاب من مقرر" },
  { value: "exception", label: "طلب استثناء" },
  { value: "delay", label: "تأجيل دراسي" },
];

export default function StudentRequests() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const requests = useStudentRequests();

  const handleSubmitRequest = () => {
    if (!requestType || !description.trim()) return;
    const typeLabel = REQUEST_TYPES.find((t) => t.value === requestType)?.label || requestType;
    addStudentRequest({
      type: typeLabel,
      description: description.trim(),
    });
    setRequestType("");
    setDescription("");
    setDialogOpen(false);
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">معلق</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">مقبول</p>
            <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">مرفوض</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-lg font-bold text-slate-800">الطلبات المقدمة</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1.5 sm:gap-2 flex-row-reverse bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm px-2 sm:px-4">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">تقديم طلب جديد</span>
              <span className="sm:hidden">طلب جديد</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">تقديم طلب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">نوع الطلب</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="اختر نوع الطلب" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-desc" className="text-xs sm:text-sm">وصف الطلب</Label>
                <Textarea
                  id="request-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل طلبك هنا..."
                  rows={4}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-2 sm:mt-2">
              <Button
                size="sm"
                onClick={handleSubmitRequest}
                disabled={!requestType || !description.trim()}
                className="flex items-center gap-1.5 sm:gap-2 flex-row-reverse bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm"
              >
                <Send className="w-4 h-4" />
                إرسال الطلب
              </Button>
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">إلغاء</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Request List */}
      {requests.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
          <p className="text-xs sm:text-sm">لم تقم بتقديم أي طلب بعد</p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-row-reverse">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {request.type}
                        </h3>
                      </div>
                      <Badge
                        className={`text-[10px] sm:text-xs ${REQUEST_STATUS_COLORS[request.status]}`}
                      >
                        {REQUEST_STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-muted-foreground flex-row-reverse">
                      <Calendar className="w-3 h-3" />
                      {new Date(request.createdAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => deleteStudentRequest(request.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
