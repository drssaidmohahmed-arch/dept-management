'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

interface ExamEntry {
  id: string;
  courseCode: string;
  courseName: string;
  roomId: string;
  roomName: string;
  instructorName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  semester: number;
  academicYear: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'مجدول',
  completed: 'منعقد',
  cancelled: 'ملغى',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ExamSchedule() {
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExamEntry | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    courseCode: '',
    courseName: '',
    roomId: '',
    roomName: '',
    instructorName: '',
    examDate: '',
    startTime: '',
    endTime: '',
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const res = await fetch(`/api/exam-schedule?${params}`);
      const data = await res.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [filterStatus]);

  const resetForm = () => {
    setForm({ courseCode: '', courseName: '', roomId: '', roomName: '', instructorName: '', examDate: '', startTime: '', endTime: '' });
    setEditItem(null);
    setError('');
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (exam: ExamEntry) => {
    setEditItem(exam);
    setForm({
      courseCode: exam.courseCode,
      courseName: exam.courseName,
      roomId: exam.roomId,
      roomName: exam.roomName,
      instructorName: exam.instructorName,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.courseCode || !form.examDate || !form.startTime || !form.endTime) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    const body = {
      courseCode: form.courseCode,
      courseName: form.courseName,
      roomId: form.roomId,
      roomName: form.roomName,
      instructorName: form.instructorName,
      examDate: form.examDate,
      startTime: form.startTime,
      endTime: form.endTime,
      semester: 3,
      academicYear: '1446',
    };

    const url = editItem ? '/api/exam-schedule' : '/api/exam-schedule';
    const method = editItem ? 'PUT' : 'POST';
    if (editItem) (body as any).id = editItem.id;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'حدث خطأ');
      return;
    }

    setDialogOpen(false);
    resetForm();
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;
    await fetch('/api/exam-schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchExams();
  };

  const handleStatusChange = async (exam: ExamEntry, newStatus: string) => {
    await fetch('/api/exam-schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: exam.id, status: newStatus }),
    });
    fetchExams();
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              جدول الامتحانات
            </h3>
            <Button size="sm" onClick={openCreate} className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة امتحان</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="scheduled">مجدول</SelectItem>
            <SelectItem value="completed">منعقد</SelectItem>
            <SelectItem value="cancelled">ملغى</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px] sm:text-xs">{exams.length} امتحان</Badge>
      </div>

      {/* Exam Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">التاريخ</TableHead>
                  <TableHead className="text-xs">الوقت</TableHead>
                  <TableHead className="text-xs">المقرر</TableHead>
                  <TableHead className="text-xs">القاعة</TableHead>
                  <TableHead className="text-xs">المدرس</TableHead>
                  <TableHead className="text-xs text-center">الحالة</TableHead>
                  <TableHead className="text-xs text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      لا توجد امتحانات مسجلة
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="text-xs">{formatDate(exam.examDate)}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1 flex-row-reverse">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {exam.startTime} - {exam.endTime}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>
                          <span className="font-medium">{exam.courseName}</span>
                          <span className="text-muted-foreground mr-1">({exam.courseCode})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{exam.roomName}</TableCell>
                      <TableCell className="text-xs">{exam.instructorName}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[10px] ${STATUS_COLORS[exam.status]}`}>
                          {STATUS_LABELS[exam.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {exam.status === 'scheduled' && (
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatusChange(exam, 'completed')} title="تم الانعقاد">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {exam.status === 'scheduled' && (
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(exam, 'cancelled')} title="إلغاء">
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {exam.status === 'cancelled' && (
                            <Button size="icon" variant="ghost" className="w-7 h-7 text-blue-600 hover:bg-blue-50" onClick={() => handleStatusChange(exam, 'scheduled')} title="إعادة جدولة">
                              <CalendarDays className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-slate-600 hover:bg-slate-100" onClick={() => openEdit(exam)} title="تعديل">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-red-600 hover:bg-red-50" onClick={() => handleDelete(exam.id)} title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editItem ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-2.5 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>كود المقرر *</Label>
                <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="CS101" />
              </div>
              <div className="space-y-1.5">
                <Label>اسم المقرر</Label>
                <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} placeholder="مقدمة في علوم الحاسب" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>اسم القاعة</Label>
                <Input value={form.roomName} onChange={(e) => setForm({ ...form, roomName: e.target.value, roomId: 'room-' + e.target.value })} placeholder="قاعة A101" />
              </div>
              <div className="space-y-1.5">
                <Label>اسم المدرس</Label>
                <Input value={form.instructorName} onChange={(e) => setForm({ ...form, instructorName: e.target.value })} placeholder="د. أحمد الشريف" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ الامتحان *</Label>
              <Input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>وقت البداية *</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>وقت النهاية *</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-sm">
              {editItem ? 'تحديث' : 'إضافة'}
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