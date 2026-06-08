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
import { Textarea } from '@/components/ui/textarea';
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
  Award,
  CalendarDays,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Edit,
  Filter,
  BookOpen,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  ProfessionalDevelopment,
  DevActivityType,
  DevStatus,
} from '@/lib/store';
import {
  DEV_ACTIVITY_TYPE_LABELS,
  DEV_ACTIVITY_TYPE_COLORS,
  DEV_STATUS_LABELS,
  DEV_STATUS_COLORS,
} from '@/lib/store';

// ============ Helpers ============

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getYear(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear().toString();
}

// ============ Component ============

export default function ProfessionalDevelopment() {
  const [activities, setActivities] = useState<ProfessionalDevelopment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  // Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ProfessionalDevelopment | null>(null);

  // Form
  const emptyForm = {
    facultyName: '',
    title: '',
    activityType: 'workshop' as DevActivityType,
    provider: '',
    location: '',
    startDate: '',
    endDate: '',
    hours: 0,
    status: 'planned' as DevStatus,
  };
  const [form, setForm] = useState(emptyForm);

  // Fetch
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/professional-development');
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered
  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchType = filterType === 'all' || a.activityType === filterType;
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchYear = filterYear === 'all' || getYear(a.startDate) === filterYear || getYear(a.endDate) === filterYear;
      return matchType && matchStatus && matchYear;
    });
  }, [activities, filterType, filterStatus, filterYear]);

  // Unique values
  const years = useMemo(() => {
    const ySet = new Set<string>();
    activities.forEach((a) => {
      if (a.startDate) ySet.add(getYear(a.startDate));
      if (a.endDate) ySet.add(getYear(a.endDate));
    });
    return Array.from(ySet).sort().reverse();
  }, [activities]);

  // Stats
  const stats = useMemo(() => {
    const totalHours = activities.reduce((s, a) => s + a.hours, 0);
    const completedHours = activities.filter((a) => a.status === 'completed').reduce((s, a) => s + a.hours, 0);
    const completedCount = activities.filter((a) => a.status === 'completed').length;
    const plannedCount = activities.filter((a) => a.status === 'planned').length;
    const cancelledCount = activities.filter((a) => a.status === 'cancelled').length;
    const completionRate = activities.length > 0 ? Math.round((completedCount / (activities.length - cancelledCount)) * 100) : 0;

    // Activities by type
    const byType: Record<string, number> = {};
    activities.forEach((a) => {
      byType[a.activityType] = (byType[a.activityType] || 0) + 1;
    });

    return { totalHours, completedHours, completedCount, plannedCount, cancelledCount, completionRate, byType };
  }, [activities]);

  // Handlers
  const handleAdd = async () => {
    try {
      const res = await fetch('/api/professional-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('تم إضافة النشاط بنجاح');
        setAddOpen(false);
        setForm(emptyForm);
        fetchData();
      } else {
        toast.error('فشل في إضافة النشاط');
      }
    } catch {
      toast.error('فشل في إضافة النشاط');
    }
  };

  const handleEdit = (activity: ProfessionalDevelopment) => {
    setSelectedActivity(activity);
    setForm({
      facultyName: activity.facultyName,
      title: activity.title,
      activityType: activity.activityType,
      provider: activity.provider,
      location: activity.location,
      startDate: activity.startDate || '',
      endDate: activity.endDate || '',
      hours: activity.hours,
      status: activity.status,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedActivity) return;
    try {
      const res = await fetch('/api/professional-development', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedActivity.id, ...form }),
      });
      if (res.ok) {
        toast.success('تم تحديث النشاط');
        setEditOpen(false);
        fetchData();
      } else {
        toast.error('فشل في تحديث النشاط');
      }
    } catch {
      toast.error('فشل في تحديث النشاط');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/professional-development', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('تم حذف النشاط');
        fetchData();
      } else {
        toast.error('فشل في حذف النشاط');
      }
    } catch {
      toast.error('فشل في حذف النشاط');
    }
  };

  // Form content
  const formContent = (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>عضو هيئة التدريس</Label>
          <Input
            value={form.facultyName}
            onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
            placeholder="د. ..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>نوع النشاط</Label>
          <Select
            value={form.activityType}
            onValueChange={(v) => setForm({ ...form, activityType: v as DevActivityType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEV_ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>عنوان النشاط</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="اسم النشاط أو الدورة"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>المقدم / المنظم</Label>
          <Input
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            placeholder="اسم المقدم"
          />
        </div>
        <div className="space-y-1.5">
          <Label>المكان</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="المدينة أو عن بُعد"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>تاريخ البداية</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>تاريخ النهاية</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>عدد الساعات</Label>
          <Input
            type="number"
            min={0}
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>الحالة</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as DevStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEV_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-52 rounded-lg" />
          <Skeleton className="h-52 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: 'إجمالي الساعات', value: `${stats.totalHours} ساعة`, icon: Clock, color: 'bg-sky-50 text-sky-700' },
          { label: 'ساعات مكتملة', value: `${stats.completedHours} ساعة`, icon: Award, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'مكتمل', value: stats.completedCount, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'نسبة الإنجاز', value: `${stats.completionRate}%`, icon: BarChart3, color: stats.completionRate >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' },
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

      {/* Activity Type Distribution */}
      <Card>
        <CardHeader className="p-3 sm:p-4 sm:pb-2">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
            <BarChart3 className="w-4 h-4" />
            توزيع الأنشطة حسب النوع
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 sm:pt-0">
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => {
              const maxCount = Math.max(...Object.values(stats.byType));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-2 flex-row-reverse">
                  <span className="text-[10px] sm:text-xs w-20 sm:w-28 text-left shrink-0">
                    {DEV_ACTIVITY_TYPE_LABELS[type as DevActivityType]}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 sm:h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end px-2 transition-all"
                      style={{
                        width: `${Math.max(percentage, 20)}%`,
                        backgroundColor:
                          type === 'conference' ? '#8b5cf6' :
                          type === 'workshop' ? '#0ea5e9' :
                          type === 'training_course' ? '#14b8a6' :
                          type === 'seminar' ? '#f59e0b' :
                          '#10b981',
                      }}
                    >
                      <span className="text-[9px] sm:text-[10px] font-bold text-white">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-2.5 sm:p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-row-reverse shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="نوع النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(DEV_ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(DEV_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {years.length > 0 && (
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full sm:w-[110px]">
                  <SelectValue placeholder="السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع السنوات</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">إضافة نشاط</span>
                  <span className="sm:hidden">إضافة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة نشاط تطويري</DialogTitle>
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

      {/* Activity Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <Award className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm sm:text-base">لا توجد أنشطة تطويرية</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filtered
            .sort((a, b) => {
              const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
              const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
              return dateB - dateA;
            })
            .map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title & Type */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">{activity.title}</h3>
                      <Badge className={`text-[9px] sm:text-[10px] ${DEV_ACTIVITY_TYPE_COLORS[activity.activityType]}`}>
                        {DEV_ACTIVITY_TYPE_LABELS[activity.activityType]}
                      </Badge>
                      <Badge className={`text-[9px] sm:text-[10px] ${DEV_STATUS_COLORS[activity.status]}`}>
                        {DEV_STATUS_LABELS[activity.status]}
                      </Badge>
                    </div>

                    {/* Faculty */}
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">{activity.facultyName}</p>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <CalendarDays className="w-3 h-3" />
                        {activity.startDate ? formatDate(activity.startDate) : '—'}
                        {activity.endDate && activity.endDate !== activity.startDate && ` - ${formatDate(activity.endDate)}`}
                      </span>
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <MapPin className="w-3 h-3" />
                        {activity.location || '—'}
                      </span>
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <Clock className="w-3 h-3" />
                        {activity.hours} ساعة
                      </span>
                      <span className="flex items-center gap-1 flex-row-reverse">
                        <BookOpen className="w-3 h-3" />
                        {activity.provider}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-amber-600"
                      onClick={() => handleEdit(activity)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-red-600"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل النشاط التطويري</DialogTitle>
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
