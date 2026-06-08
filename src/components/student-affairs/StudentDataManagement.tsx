'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Search,
  GraduationCap,
  AlertTriangle,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  CalendarDays,
  TrendingUp,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  StudentProfile,
  StudentStatus,
} from '@/lib/store';
import {
  STUDENT_PROFILE_STATUS_LABELS,
  STUDENT_PROFILE_STATUS_COLORS,
} from '@/lib/store';

// ============ DB Row → TypeScript Mapper ============

function mapStudentRow(row: Record<string, unknown>): StudentProfile {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    name: (row.name as string) || '',
    email: (row.email as string) || undefined,
    phone: (row.phone as string) || undefined,
    level: (row.level as number) || 1,
    major: (row.major as string) || '',
    gpa: (row.gpa as number) || 0,
    cumulativeHours: (row.cumulative_hours as number) || 0,
    status: (row.status as StudentStatus) || 'active',
    advisorName: (row.advisor_name as string) || undefined,
    enrollmentYear: (row.enrollment_year as number) || new Date().getFullYear(),
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || undefined,
  };
}

// ============ GPA Color Helpers ============

function gpaColor(gpa: number): string {
  if (gpa >= 3.5) return 'text-emerald-600';
  if (gpa >= 3.0) return 'text-sky-600';
  if (gpa >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

function gpaBadgeBg(gpa: number): string {
  if (gpa >= 3.5) return 'bg-emerald-100 text-emerald-800';
  if (gpa >= 3.0) return 'bg-sky-100 text-sky-800';
  if (gpa >= 2.5) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

// ============ Empty Form State ============

interface StudentFormData {
  student_id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  major: string;
  gpa: string;
  cumulative_hours: string;
  status: StudentStatus;
  advisor_name: string;
  enrollment_year: string;
}

const emptyForm: StudentFormData = {
  student_id: '',
  name: '',
  email: '',
  phone: '',
  level: '1',
  major: '',
  gpa: '0',
  cumulative_hours: '0',
  status: 'active',
  advisor_name: '',
  enrollment_year: String(new Date().getFullYear()),
};

// ============ Component ============

export default function StudentDataManagement() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ============ Fetch Students ============

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterLevel !== 'all') params.set('level', filterLevel);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();
      setStudents((data as Record<string, unknown>[]).map(mapStudentRow));
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('فشل في تحميل بيانات الطلاب');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus, filterLevel]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ============ Statistics ============

  const stats = useMemo(() => {
    const total = students.length;
    const avgGPA = total > 0
      ? students.reduce((sum, s) => sum + s.gpa, 0) / total
      : 0;

    const byStatus: Record<string, number> = {};
    students.forEach((s) => {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });

    const byLevel: Record<number, number> = {};
    students.forEach((s) => {
      byLevel[s.level] = (byLevel[s.level] || 0) + 1;
    });

    return { total, avgGPA, byStatus, byLevel };
  }, [students]);

  // ============ Dialog Handlers ============

  const openDetail = (student: StudentProfile) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const openAddForm = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (student: StudentProfile) => {
    setIsEditing(true);
    setFormData({
      student_id: student.studentId,
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      level: String(student.level),
      major: student.major,
      gpa: String(student.gpa),
      cumulative_hours: String(student.cumulativeHours),
      status: student.status,
      advisor_name: student.advisorName || '',
      enrollment_year: String(student.enrollmentYear),
    });
    setFormOpen(true);
  };

  const openDeleteConfirm = (student: StudentProfile) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  // ============ CRUD Operations ============

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.student_id.trim()) {
      toast.error('الرجاء تعبئة الحقول المطلوبة (الاسم والرقم الجامعي)');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && selectedStudent) {
        const res = await fetch('/api/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedStudent.id,
            student_id: formData.student_id,
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            level: Number(formData.level),
            major: formData.major,
            gpa: Number(formData.gpa),
            cumulative_hours: Number(formData.cumulative_hours),
            status: formData.status,
            advisor_name: formData.advisor_name || null,
            enrollment_year: Number(formData.enrollment_year),
          }),
        });
        if (!res.ok) throw new Error('فشل تحديث البيانات');
        toast.success('تم تحديث بيانات الطالب بنجاح');
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: formData.student_id,
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            level: Number(formData.level),
            major: formData.major,
            gpa: Number(formData.gpa),
            cumulative_hours: Number(formData.cumulative_hours),
            status: formData.status,
            advisor_name: formData.advisor_name || null,
            enrollment_year: Number(formData.enrollment_year),
          }),
        });
        if (!res.ok) throw new Error('فشل إضافة الطالب');
        toast.success('تمت إضافة الطالب بنجاح');
      }

      setFormOpen(false);
      fetchStudents();
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(isEditing ? 'فشل تحديث بيانات الطالب' : 'فشل إضافة الطالب');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStudent.id }),
      });
      if (!res.ok) throw new Error('فشل حذف الطالب');
      toast.success('تم حذف الطالب بنجاح');
      setDeleteOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('فشل حذف الطالب');
    } finally {
      setSubmitting(false);
    }
  };

  // ============ Render ============

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">إجمالي الطلبة</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">متوسط المعدل</span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${gpaColor(stats.avgGPA)}`}>
              {stats.avgGPA.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">نشط</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">
              {stats.byStatus['active'] || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">إنذار أكاديمي</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {stats.byStatus['probation'] || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الرقم الجامعي..."
                className="ps-9 text-xs sm:text-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(STUDENT_PROFILE_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                  <SelectItem key={lvl} value={String(lvl)}>المستوى {lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openAddForm} className="shrink-0">
              <UserPlus className="w-4 h-4 ml-1.5" />
              إضافة طالب
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2.5 flex-row-reverse">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-14" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm sm:text-base">لا يوجد طلبة</p>
            <p className="text-xs sm:text-sm mt-1">
              {searchQuery || filterStatus !== 'all' || filterLevel !== 'all'
                ? 'لم يتم العثور على نتائج مطابقة'
                : 'لا توجد بيانات طلاب حالياً'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {students.map((student) => (
            <Card
              key={student.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetail(student)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-row-reverse">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">
                        {student.name}
                      </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-2">
                      {student.studentId}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="flex items-center gap-1 flex-row-reverse">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {student.cumulativeHours} ساعة
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-row-reverse">
                        <CalendarDays className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {student.enrollmentYear}
                        </span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap flex-row-reverse">
                      <Badge className={`text-[10px] sm:text-xs border-0 ${gpaBadgeBg(student.gpa)}`}>
                        المعدل: {student.gpa.toFixed(2)}
                      </Badge>
                      <Badge className={`text-[10px] sm:text-xs border-0 ${STUDENT_PROFILE_STATUS_COLORS[student.status]}`}>
                        {STUDENT_PROFILE_STATUS_LABELS[student.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-sky-600"
                      onClick={() => openEditForm(student)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-red-600"
                      onClick={() => openDeleteConfirm(student)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ============ Student Detail Dialog ============ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-row-reverse">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  <span>{selectedStudent.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">{selectedStudent.studentId}</span>
                </DialogTitle>
              </DialogHeader>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className={`text-lg sm:text-xl font-bold ${gpaColor(selectedStudent.gpa)}`}>
                    {selectedStudent.gpa.toFixed(2)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">المعدل التراكمي</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {selectedStudent.cumulativeHours}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">الساعات المكتسبة</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {selectedStudent.level}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">المستوى</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mt-4">
                <h4 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2 flex-row-reverse">
                  <Eye className="w-4 h-4" />
                  التفاصيل الكاملة
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="البريد الإلكتروني" value={selectedStudent.email || 'غير محدد'} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="رقم الهاتف" value={selectedStudent.phone || 'غير محدد'} />
                  <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="التخصص" value={selectedStudent.major} />
                  <InfoRow icon={<UserCheck className="w-4 h-4" />} label="المرشد الأكاديمي" value={selectedStudent.advisorName || 'غير محدد'} />
                  <InfoRow icon={<CalendarDays className="w-4 h-4" />} label="سنة الالتحاق" value={String(selectedStudent.enrollmentYear)} />
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">الحالة</span>
                    <Badge className={`text-[10px] sm:text-xs border-0 ${STUDENT_PROFILE_STATUS_COLORS[selectedStudent.status]}`}>
                      {STUDENT_PROFILE_STATUS_LABELS[selectedStudent.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 sm:gap-2 gap-1">
                <Button variant="outline" onClick={() => { setDetailOpen(false); openEditForm(selectedStudent); }}>
                  <Pencil className="w-4 h-4 ml-1.5" />
                  تعديل
                </Button>
                <Button onClick={() => setDetailOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ Add/Edit Student Dialog ============ */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse">
              {isEditing ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isEditing ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="الرقم الجامعي *" value={formData.student_id} onChange={(v) => setFormData({ ...formData, student_id: v })} placeholder="مثال: ST-2024-001" />
              <FormField label="الاسم الكامل *" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="اسم الطالب" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="البريد الإلكتروني" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} placeholder="example@email.com" />
              <FormField label="رقم الهاتف" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} placeholder="05XXXXXXXX" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">المستوى</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                      <SelectItem key={lvl} value={String(lvl)}>المستوى {lvl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">سنة الالتحاق</Label>
                <Select value={formData.enrollment_year} onValueChange={(v) => setFormData({ ...formData, enrollment_year: v })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                      <SelectItem key={yr} value={String(yr)}>{yr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">الحالة</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as StudentStatus })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STUDENT_PROFILE_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="المعدل التراكمي" value={formData.gpa} onChange={(v) => setFormData({ ...formData, gpa: v })} placeholder="0.00" />
              <FormField label="الساعات المكتسبة" value={formData.cumulative_hours} onChange={(v) => setFormData({ ...formData, cumulative_hours: v })} placeholder="0" />
            </div>
            <FormField label="التخصص" value={formData.major} onChange={(v) => setFormData({ ...formData, major: v })} placeholder="مثال: علوم الحاسب" />
            <FormField label="المرشد الأكاديمي" value={formData.advisor_name} onChange={(v) => setFormData({ ...formData, advisor_name: v })} placeholder="اسم المرشد" />
          </div>

          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setFormOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" />
                  جارٍ الحفظ...
                </>
              ) : isEditing ? 'حفظ التعديلات' : 'إضافة الطالب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Delete Confirmation Dialog ============ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse text-red-600">
              <Trash2 className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            هل أنت متأكد من حذف الطالب &ldquo;{selectedStudent?.name}&rdquo؛؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" />
                  جارٍ الحذف...
                </>
              ) : 'حذف الطالب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Sub-components ============

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 flex-row-reverse">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{label}:</span>
      <span className="text-xs sm:text-sm text-slate-800 truncate">{value}</span>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs sm:text-sm"
      />
    </div>
  );
}
