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
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">معلق</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">مقبول</p>
            <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">مرفوض</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">الطلبات المقدمة</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 flex-row-reverse bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4" />
              تقديم طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تقديم طلب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>نوع الطلب</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
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
                <Label htmlFor="request-desc">وصف الطلب</Label>
                <Textarea
                  id="request-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل طلبك هنا..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                onClick={handleSubmitRequest}
                disabled={!requestType || !description.trim()}
                className="flex items-center gap-2 flex-row-reverse bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4" />
                إرسال الطلب
              </Button>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Request List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لم تقم بتقديم أي طلب بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-row-reverse">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold text-slate-800">
                          {request.type}
                        </h3>
                      </div>
                      <Badge
                        className={`text-xs ${REQUEST_STATUS_COLORS[request.status]}`}
                      >
                        {REQUEST_STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground flex-row-reverse">
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
                    className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteStudentRequest(request.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
