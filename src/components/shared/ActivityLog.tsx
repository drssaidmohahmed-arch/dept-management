'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Clock,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ClipboardList,
  Megaphone,
  UserCheck,
  GraduationCap,
  Printer,
  CalendarDays,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  performed_by_name: string;
  details: string;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  transfer_request: 'طلب تحويل',
  transfer_approved: 'تحويل مقبول',
  transfer_rejected: 'تحويل مرفوض',
  transfer_review: 'مراجعة تحويل',
  transfer_cancelled: 'إلغاء تحويل',
  professor_request: 'طلب أستاذ',
  professor_approved: 'قبول طلب أستاذ',
  professor_rejected: 'رفض طلب أستاذ',
  student_request: 'طلب طالب',
  student_approved: 'قبول طلب طالب',
  student_rejected: 'رفض طلب طالب',
  announcement: 'إعلان',
  announcement_deleted: 'حذف إعلان',
  member_added: 'إضافة عضو',
  member_removed: 'حذف عضو',
  permission_change: 'تغيير صلاحيات',
  enrollment: 'تسجيل مقرر',
  enrollment_deleted: 'إلغاء تسجيل',
  grade_update: 'تحديث درجات',
  course_added: 'إضافة مقرر',
  course_deleted: 'حذف مقرر',
  room_added: 'إضافة قاعة',
  room_deleted: 'حذف قاعة',
  room_booking: 'حجز قاعة',
  professor_request_deleted: 'حذف طلب أستاذ',
  student_request_deleted: 'حذف طلب طالب',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  employee_transfer: 'طلب تحويل',
  professor_request: 'طلب أستاذ',
  student_request: 'طلب طالب',
  announcement: 'إعلان',
  member: 'عضو',
  enrolled_student: 'تسجيل',
  course: 'مقرر',
  room: 'قاعة',
  room_booking: 'حجز قاعة',
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  employee_transfer: 'bg-violet-100 text-violet-800',
  professor_request: 'bg-sky-100 text-sky-800',
  student_request: 'bg-orange-100 text-orange-800',
  announcement: 'bg-emerald-100 text-emerald-800',
  member: 'bg-cyan-100 text-cyan-800',
  enrolled_student: 'bg-amber-100 text-amber-800',
  course: 'bg-blue-100 text-blue-800',
  room: 'bg-teal-100 text-teal-800',
  room_booking: 'bg-pink-100 text-pink-800',
};

const ACTION_COLORS: Record<string, string> = {
  transfer_request: 'bg-blue-100 text-blue-800',
  transfer_approved: 'bg-emerald-100 text-emerald-800',
  transfer_rejected: 'bg-red-100 text-red-800',
  professor_request: 'bg-sky-100 text-sky-800',
  professor_approved: 'bg-emerald-100 text-emerald-800',
  professor_rejected: 'bg-red-100 text-red-800',
  student_request: 'bg-orange-100 text-orange-800',
  student_approved: 'bg-emerald-100 text-emerald-800',
  student_rejected: 'bg-red-100 text-red-800',
  announcement: 'bg-purple-100 text-purple-800',
  member_added: 'bg-emerald-100 text-emerald-800',
  member_removed: 'bg-red-100 text-red-800',
  enrollment: 'bg-indigo-100 text-indigo-800',
  course_added: 'bg-blue-100 text-blue-800',
  course_deleted: 'bg-red-100 text-red-800',
  room_added: 'bg-teal-100 text-teal-800',
  room_deleted: 'bg-red-100 text-red-800',
  room_booking: 'bg-pink-100 text-pink-800',
};

function getActionIcon(action: string) {
  if (action.includes('approved')) return CheckCircle2;
  if (action.includes('rejected')) return XCircle;
  if (action.includes('transfer')) return ArrowRightLeft;
  if (action.includes('professor')) return UserCheck;
  if (action.includes('student')) return GraduationCap;
  if (action.includes('announcement')) return Megaphone;
  if (action.includes('member')) return UserCheck;
  if (action.includes('enrollment')) return ClipboardList;
  if (action.includes('course')) return GraduationCap;
  if (action.includes('room')) return GraduationCap;
  return Activity;
}

function getActionIconColor(action: string) {
  if (action.includes('approved')) return 'text-emerald-600';
  if (action.includes('rejected') || action.includes('deleted') || action.includes('removed')) return 'text-red-600';
  if (action.includes('transfer')) return 'text-violet-600';
  return 'text-slate-600';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDateRangeFilter(range: string) {
  const now = new Date();
  let start: Date;
  switch (range) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      return null;
  }
  return start.toISOString();
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filterType !== 'all') {
        params.set('entityType', filterType);
      }
      const res = await fetch(`/api/activity-log?${params}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const filteredLogs = useMemo(() => {
    if (dateRange === 'all') return logs;
    const startISO = getDateRangeFilter(dateRange);
    if (!startISO) return logs;
    return logs.filter((l) => new Date(l.created_at) >= new Date(startISO));
  }, [logs, dateRange]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekStartISO = weekStart.toISOString();
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);
    const monthStartISO = monthStart.toISOString();

    return {
      total: filteredLogs.length,
      today: filteredLogs.filter((l) => l.created_at >= todayStart).length,
      thisWeek: filteredLogs.filter((l) => l.created_at >= weekStartISO).length,
      thisMonth: filteredLogs.filter((l) => l.created_at >= monthStartISO).length,
    };
  }, [filteredLogs]);

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 no-print">
        {[
          { label: 'الإجمالي', value: stats.total, icon: Activity, color: 'bg-slate-50 text-slate-700' },
          { label: 'اليوم', value: stats.today, icon: CalendarDays, color: 'bg-blue-50 text-blue-700' },
          { label: 'هذا الأسبوع', value: stats.thisWeek, icon: Clock, color: 'bg-amber-50 text-amber-700' },
          { label: 'هذا الشهر', value: stats.thisMonth, icon: ClipboardList, color: 'bg-emerald-50 text-emerald-700' },
        ].map((card) => {
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

      {/* Filter & Refresh & Export */}
      <Card className="no-print">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40 text-sm">
                  <SelectValue placeholder="نوع الإجراء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإجراءات</SelectItem>
                  <SelectItem value="employee_transfer">التحويلات</SelectItem>
                  <SelectItem value="professor_request">طلبات الأساتذة</SelectItem>
                  <SelectItem value="student_request">طلبات الطلاب</SelectItem>
                  <SelectItem value="announcement">الإعلانات</SelectItem>
                  <SelectItem value="member">الأعضاء</SelectItem>
                  <SelectItem value="course">المقررات</SelectItem>
                  <SelectItem value="room">القاعات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <Label className="text-xs text-muted-foreground shrink-0">الفترة:</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-32 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="text-xs sm:text-sm">
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm gap-1.5">
              <Printer className="w-3.5 h-3.5" />
              تصدير
            </Button>
            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
              {filteredLogs.length} سجل
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد سجلات حالياً</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredLogs.map((log) => {
            const ActionIcon = getActionIcon(log.action);
            const iconColor = getActionIconColor(log.action);

            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <ActionIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1">
                        <Badge className={`text-[10px] sm:text-xs ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-800'}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] sm:text-xs ${ENTITY_TYPE_COLORS[log.entity_type] || ''}`}>
                          {ENTITY_TYPE_LABELS[log.entity_type] || log.entity_type}
                        </Badge>
                      </div>

                      {log.entity_name && (
                        <p className="text-sm sm:text-base font-medium text-slate-800 mb-0.5 truncate">
                          {log.entity_name}
                        </p>
                      )}

                      {log.details && (
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
                          {typeof log.details === 'string' ? log.details : ''}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                        {log.performed_by_name && (
                          <span className="flex items-center gap-1 flex-row-reverse">
                            <span>بواسطة:</span>
                            <span className="font-medium text-slate-600">{log.performed_by_name}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 flex-row-reverse">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}