'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Filter,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  TeachingAssignment,
  DayOfWeek,
  SessionType,
} from '@/lib/store';
import {
  DAY_OF_WEEK_LABELS,
  SESSION_TYPE_LABELS,
  SESSION_TYPE_COLORS,
  SEMESTER_NAMES,
} from '@/lib/store';

// ============ Constants ============

const DAYS_ORDER: DayOfWeek[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

const SESSION_BG_COLORS: Record<SessionType, string> = {
  lecture: 'bg-sky-100 border-sky-200 text-sky-800',
  lab: 'bg-emerald-100 border-emerald-200 text-emerald-800',
  tutorial: 'bg-violet-100 border-violet-200 text-violet-800',
};

const SESSION_BLOCK_COLORS: Record<SessionType, string> = {
  lecture: 'bg-sky-500/20 border-sky-300',
  lab: 'bg-emerald-500/20 border-emerald-300',
  tutorial: 'bg-violet-500/20 border-violet-300',
};

// ============ Helper ============

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ============ Component ============

export default function TeachingSchedule() {
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProfessor, setFilterProfessor] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('1');
  const [filterSessionType, setFilterSessionType] = useState<string>('all');

  // Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeachingAssignment | null>(null);

  // Form
  const emptyForm = {
    professorName: '',
    courseCode: '',
    courseName: '',
    section: 1,
    roomName: '',
    day: 'saturday' as DayOfWeek,
    startTime: '08:00',
    endTime: '09:30',
    sessionType: 'lecture' as SessionType,
    academicYear: '1446',
    semester: 1,
  };
  const [form, setForm] = useState(emptyForm);

  // Fetch
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teaching-assignments');
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered assignments
  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchProfessor = filterProfessor === 'all' || a.professorName === filterProfessor;
      const matchSemester = String(a.semester) === filterSemester;
      const matchSession = filterSessionType === 'all' || a.sessionType === filterSessionType;
      return matchProfessor && matchSemester && matchSession;
    });
  }, [assignments, filterProfessor, filterSemester, filterSessionType]);

  // Unique professors
  const professors = useMemo(() => {
    return [...new Set(assignments.map((a) => a.professorName))].sort();
  }, [assignments]);

  // Unique semesters
  const semesters = useMemo(() => {
    return [...new Set(assignments.map((a) => a.semester))].sort();
  }, [assignments]);

  // Grid data
  const gridData = useMemo(() => {
    const grid: Record<string, TeachingAssignment[]> = {};
    DAYS_ORDER.forEach((day) => {
      grid[day] = filtered.filter((a) => a.day === day);
    });
    return grid;
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const lectures = filtered.filter((a) => a.sessionType === 'lecture').length;
    const labs = filtered.filter((a) => a.sessionType === 'lab').length;
    const tutorials = filtered.filter((a) => a.sessionType === 'tutorial').length;
    const uniqueCourses = new Set(filtered.map((a) => a.courseCode)).size;
    return { lectures, labs, tutorials, uniqueCourses };
  }, [filtered]);

  // Handlers
  const handleAdd = async () => {
    try {
      const res = await fetch('/api/teaching-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('تم إضافة التكليف التدريسي');
        setAddOpen(false);
        setForm(emptyForm);
        fetchData();
      } else {
        toast.error('فشل في إضافة التكليف');
      }
    } catch {
      toast.error('فشل في إضافة التكليف');
    }
  };

  const handleEdit = (assignment: TeachingAssignment) => {
    setSelectedAssignment(assignment);
    setForm({
      professorName: assignment.professorName,
      courseCode: assignment.courseCode,
      courseName: assignment.courseName,
      section: assignment.section,
      roomName: assignment.roomName,
      day: assignment.day,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
      sessionType: assignment.sessionType,
      academicYear: assignment.academicYear,
      semester: assignment.semester,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedAssignment) return;
    try {
      const res = await fetch('/api/teaching-assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAssignment.id, ...form }),
      });
      if (res.ok) {
        toast.success('تم تحديث التكليف');
        setEditOpen(false);
        fetchData();
      } else {
        toast.error('فشل في تحديث التكليف');
      }
    } catch {
      toast.error('فشل في تحديث التكليف');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/teaching-assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('تم حذف التكليف');
        fetchData();
      } else {
        toast.error('فشل في حذف التكليف');
      }
    } catch {
      toast.error('فشل في حذف التكليف');
    }
  };

  // Form dialog content
  const formContent = (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>اسم الأستاذ</Label>
          <Input
            value={form.professorName}
            onChange={(e) => setForm({ ...form, professorName: e.target.value })}
            placeholder="د. ..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>الفصل الدراسي</Label>
          <Select
            value={String(form.semester)}
            onValueChange={(v) => setForm({ ...form, semester: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SEMESTER_NAMES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>رمز المقرر</Label>
          <Input
            value={form.courseCode}
            onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
            placeholder="CS101"
          />
        </div>
        <div className="space-y-1.5">
          <Label>اسم المقرر</Label>
          <Input
            value={form.courseName}
            onChange={(e) => setForm({ ...form, courseName: e.target.value })}
            placeholder="اسم المقرر"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>الشعبة</Label>
          <Input
            type="number"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: Number(e.target.value) })}
            min={1}
          />
        </div>
        <div className="space-y-1.5">
          <Label>القاعة</Label>
          <Input
            value={form.roomName}
            onChange={(e) => setForm({ ...form, roomName: e.target.value })}
            placeholder="قاعة 101"
          />
        </div>
        <div className="space-y-1.5">
          <Label>نوع الجلسة</Label>
          <Select
            value={form.sessionType}
            onValueChange={(v) => setForm({ ...form, sessionType: v as SessionType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SESSION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>اليوم</Label>
          <Select
            value={form.day}
            onValueChange={(v) => setForm({ ...form, day: v as DayOfWeek })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DAY_OF_WEEK_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>وقت البداية</Label>
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>وقت النهاية</Label>
          <Input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  // Loading
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: 'المحاضرات', value: stats.lectures, icon: Calendar, color: 'bg-sky-50 text-sky-700' },
          { label: 'العملي', value: stats.labs, icon: Calendar, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'التعليمي', value: stats.tutorials, icon: Calendar, color: 'bg-violet-50 text-violet-700' },
          { label: 'المقررات', value: stats.uniqueCourses, icon: MapPin, color: 'bg-amber-50 text-amber-700' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stat.value}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-2.5 sm:p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-row-reverse shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية:</span>
            </div>
            <Select value={filterProfessor} onValueChange={setFilterProfessor}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="جميع الأساتذة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأساتذة</SelectItem>
                {professors.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={String(s)}>{SEMESTER_NAMES[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSessionType} onValueChange={setFilterSessionType}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(SESSION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">إضافة تكليف</span>
                  <span className="sm:hidden">إضافة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة تكليف تدريسي</DialogTitle>
                </DialogHeader>
                {formContent}
                <DialogFooter className="gap-2">
                  <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                    إضافة
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">إلغاء</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Desktop: Timetable Grid */}
      <div className="hidden md:block overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-center p-2 text-xs font-medium text-slate-500 border-b border-l w-20">الوقت</th>
              {DAYS_ORDER.map((day) => (
                <th key={day} className="text-center p-2 text-xs font-semibold text-slate-700 border-b">
                  {DAY_OF_WEEK_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot} className="border-b last:border-b-0">
                <td className="text-center p-1 text-[10px] text-slate-400 border-l bg-slate-50/50">
                  {slot}
                </td>
                {DAYS_ORDER.map((day) => {
                  const slotMinutes = timeToMinutes(slot);
                  const assignmentsInSlot = gridData[day].filter((a) => {
                    const start = timeToMinutes(a.startTime);
                    const end = timeToMinutes(a.endTime);
                    return slotMinutes >= start && slotMinutes < end;
                  });
                  const firstAssignment = assignmentsInSlot[0];

                  // Check if this slot is the start of a block
                  const isStart = firstAssignment && timeToMinutes(firstAssignment.startTime) === slotMinutes;

                  if (!isStart) return <td key={day} className="p-0" />;

                  const span = Math.ceil(
                    (timeToMinutes(firstAssignment.endTime) - timeToMinutes(firstAssignment.startTime)) / 30
                  );

                  return (
                    <td key={day} className="p-0.5 align-top" rowSpan={span}>
                      <div
                        className={`rounded-md border p-1.5 h-full min-h-[50px] ${SESSION_BLOCK_COLORS[firstAssignment.sessionType]}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <Badge className={`text-[8px] px-1 py-0 ${SESSION_TYPE_COLORS[firstAssignment.sessionType]}`}>
                            {firstAssignment.courseCode}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-semibold leading-tight truncate">{firstAssignment.courseName}</p>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5 flex-row-reverse">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{firstAssignment.roomName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground flex-row-reverse">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{firstAssignment.startTime} - {firstAssignment.endTime}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-0.5">ش{firstAssignment.section} - {firstAssignment.professorName}</p>
                        <div className="flex items-center gap-0.5 mt-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-5 h-5 text-slate-400 hover:text-amber-600"
                            onClick={() => handleEdit(firstAssignment)}
                          >
                            <Edit className="w-2.5 h-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-5 h-5 text-slate-400 hover:text-red-600"
                            onClick={() => handleDelete(firstAssignment.id)}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: List View */}
      <div className="md:hidden space-y-2">
        {DAYS_ORDER.map((day) => {
          const dayAssignments = gridData[day];
          if (dayAssignments.length === 0) return null;
          return (
            <Card key={day}>
              <CardHeader className="p-2.5 sm:p-3 sm:pb-1">
                <CardTitle className="text-sm flex items-center gap-1.5 flex-row-reverse">
                  <Calendar className="w-4 h-4" />
                  {DAY_OF_WEEK_LABELS[day]}
                  <Badge variant="outline" className="text-[10px] ms-1">
                    {dayAssignments.length} جلسة
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 sm:p-3 sm:pt-1 space-y-2">
                {dayAssignments
                  .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                  .map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`rounded-lg border p-2.5 ${SESSION_BLOCK_COLORS[assignment.sessionType]}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-row-reverse">
                        <Badge className={`text-[9px] ${SESSION_TYPE_COLORS[assignment.sessionType]}`}>
                          {SESSION_TYPE_LABELS[assignment.sessionType]}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {assignment.courseCode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-slate-400 hover:text-amber-600"
                          onClick={() => handleEdit(assignment)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-slate-400 hover:text-red-600"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs font-semibold">{assignment.courseName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5 flex-row-reverse">
                        <Clock className="w-3 h-3" />
                        {assignment.startTime} - {assignment.endTime}
                      </span>
                      <span className="flex items-center gap-0.5 flex-row-reverse">
                        <MapPin className="w-3 h-3" />
                        {assignment.roomName}
                      </span>
                      <span>ش{assignment.section}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{assignment.professorName}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 justify-center text-[10px] sm:text-xs text-muted-foreground">
        <span>دليل الألوان:</span>
        {Object.entries(SESSION_TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm border ${SESSION_BLOCK_COLORS[key as SessionType]}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل التكليف التدريسي</DialogTitle>
          </DialogHeader>
          {formContent}
          <DialogFooter className="gap-2">
            <Button onClick={handleEditSave} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
              حفظ التعديلات
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
