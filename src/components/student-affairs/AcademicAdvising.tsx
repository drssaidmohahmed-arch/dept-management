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
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Calendar,
  AlertCircle,
  UserCheck,
  FileText,
  Clock,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Filter,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  AdvisingSession,
  AdvisingType,
} from '@/lib/store';
import {
  ADVISING_TYPE_LABELS,
  ADVISING_TYPE_COLORS,
} from '@/lib/store';

// ============ DB Row → TypeScript Mapper ============

function mapSessionRow(row: Record<string, unknown>): AdvisingSession {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    studentName: (row.student_name as string) || '',
    advisorId: (row.advisor_id as string) || undefined,
    advisorName: (row.advisor_name as string) || '',
    sessionDate: (row.session_date as string) || '',
    sessionType: (row.session_type as AdvisingType) || 'general',
    notes: (row.notes as string) || '',
    actionItems: (row.action_items as string[]) || [],
    followUpDate: (row.follow_up_date as string) || undefined,
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

// ============ Empty Form State ============

interface SessionFormData {
  student_id: string;
  student_name: string;
  advisor_name: string;
  session_date: string;
  session_type: AdvisingType;
  notes: string;
  action_items_text: string;
  follow_up_date: string;
}

const emptyForm: SessionFormData = {
  student_id: '',
  student_name: '',
  advisor_name: '',
  session_date: new Date().toISOString().split('T')[0],
  session_type: 'general',
  notes: '',
  action_items_text: '',
  follow_up_date: '',
};

// ============ Component ============

export default function AcademicAdvising() {
  const [sessions, setSessions] = useState<AdvisingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAdvisor, setFilterAdvisor] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AdvisingSession | null>(null);
  const [formData, setFormData] = useState<SessionFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Timeline mode
  const [timelineStudentId, setTimelineStudentId] = useState<string | null>(null);

  // ============ Fetch Sessions ============

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAdvisor !== 'all') params.set('advisor', filterAdvisor);
      if (filterStudent !== 'all') params.set('student', filterStudent);
      if (filterType !== 'all') params.set('session_type', filterType);

      const res = await fetch(`/api/advising-sessions?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const data = await res.json();
      setSessions((data as Record<string, unknown>[]).map(mapSessionRow));
    } catch (err) {
      console.error('Error fetching sessions:', err);
      toast.error('فشل في تحميل بيانات جلسات الإرشاد');
    } finally {
      setLoading(false);
    }
  }, [filterAdvisor, filterStudent, filterType]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ============ Unique Values for Filters ============

  const advisors = useMemo(() => {
    const set = new Set(sessions.map((s) => s.advisorName).filter(Boolean));
    return Array.from(set).sort();
  }, [sessions]);

  const studentList = useMemo(() => {
    const set = new Set(sessions.map((s) => s.studentName).filter(Boolean));
    return Array.from(set).sort();
  }, [sessions]);

  // ============ Statistics ============

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    sessions.forEach((s) => {
      byType[s.sessionType] = (byType[s.sessionType] || 0) + 1;
    });

    const byAdvisor: Record<string, number> = {};
    sessions.forEach((s) => {
      byAdvisor[s.advisorName] = (byAdvisor[s.advisorName] || 0) + 1;
    });

    const upcomingFollowUps = sessions.filter(
      (s) => s.followUpDate && new Date(s.followUpDate) >= new Date()
    ).length;

    const warningCount = sessions.filter((s) => s.sessionType === 'academic_warning').length;

    return { byType, byAdvisor, upcomingFollowUps, warningCount, total: sessions.length };
  }, [sessions]);

  // ============ Student Timeline ============

  const timelineSessions = useMemo(() => {
    if (!timelineStudentId) return [];
    return sessions
      .filter((s) => s.studentId === timelineStudentId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  }, [sessions, timelineStudentId]);

  const timelineStudentName = useMemo(() => {
    const s = sessions.find((s) => s.studentId === timelineStudentId);
    return s?.studentName || '';
  }, [sessions, timelineStudentId]);

  // ============ Dialog Handlers ============

  const openDetail = (session: AdvisingSession) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  const openDeleteConfirm = (session: AdvisingSession) => {
    setSelectedSession(session);
    setDeleteOpen(true);
  };

  // ============ CRUD Operations ============

  const handleAdd = async () => {
    if (!formData.student_name.trim() || !formData.advisor_name.trim() || !formData.session_date) {
      toast.error('الرجاء تعبئة الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    try {
      const actionItems = formData.action_items_text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/advising-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: formData.student_id,
          student_name: formData.student_name,
          advisor_name: formData.advisor_name,
          session_date: formData.session_date,
          session_type: formData.session_type,
          notes: formData.notes,
          action_items: actionItems,
          follow_up_date: formData.follow_up_date || null,
        }),
      });

      if (!res.ok) throw new Error('فشل إضافة الجلسة');
      toast.success('تمت إضافة جلسة الإرشاد بنجاح');
      setAddOpen(false);
      setFormData(emptyForm);
      fetchSessions();
    } catch (err) {
      console.error('Add error:', err);
      toast.error('فشل إضافة جلسة الإرشاد');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSession) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/advising-sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSession.id }),
      });
      if (!res.ok) throw new Error('فشل حذف الجلسة');
      toast.success('تم حذف جلسة الإرشاد بنجاح');
      setDeleteOpen(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('فشل حذف جلسة الإرشاد');
    } finally {
      setSubmitting(false);
    }
  };

  // ============ Format Date ============

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
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
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">إجمالي الجلسات</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">إنذارات أكاديمية</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.warningCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <UserCheck className="w-4 h-4 text-sky-500" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">عدد المرشدين</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-sky-600">{Object.keys(stats.byAdvisor).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 flex-row-reverse">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">متابعات قادمة</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.upcomingFollowUps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-xs">تصفية:</span>
            </div>
            <Select value={filterAdvisor} onValueChange={setFilterAdvisor}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="المرشد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المرشدين</SelectItem>
                {advisors.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="الطالب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطلبة</SelectItem>
                {studentList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="نوع الجلسة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(ADVISING_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { setAddOpen(true); setFormData(emptyForm); }} className="sm:mr-auto shrink-0">
              <Plus className="w-4 h-4 ml-1.5" />
              إضافة جلسة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Early Warning Alert */}
      {stats.warningCount > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 flex-row-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">تنبيه إنذارات أكاديمية</p>
                <p className="text-xs text-red-600">يوجد {stats.warningCount} جلسة إنذار أكاديمي. يرجى متابعة الحالات المعنية.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions by Type Summary */}
      <Card>
        <CardHeader className="p-3 sm:p-4 sm:pb-2">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
            <FileText className="w-4 h-4" />
            توزيع الجلسات حسب النوع
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 sm:pt-0">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.byType).map(([type, count]) => (
              <Badge key={type} className={`text-[10px] sm:text-xs border-0 ${ADVISING_TYPE_COLORS[type as AdvisingType]}`}>
                {ADVISING_TYPE_LABELS[type as AdvisingType]}: {count}
              </Badge>
            ))}
            {Object.keys(stats.byType).length === 0 && (
              <span className="text-xs text-muted-foreground">لا توجد بيانات</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Timeline vs List */}
      {timelineStudentId ? (
        /* Student Timeline View */
        <div>
          <div className="flex items-center gap-2 mb-3 flex-row-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimelineStudentId(null)}
            >
              <ChevronLeft className="w-4 h-4 ml-1" />
              العودة للقائمة
            </Button>
            <span className="text-sm font-semibold text-slate-800">
              سجل جلسات: {timelineStudentName}
            </span>
            <Badge variant="outline" className="text-[10px] sm:text-xs font-mono">
              {timelineStudentId}
            </Badge>
          </div>

          {timelineSessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">لا توجد جلسات إرشاد لهذا الطالب</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute top-4 bottom-4 end-[18px] w-0.5 bg-slate-200 hidden sm:block" />

              {timelineSessions.map((session, idx) => (
                <div key={session.id} className="relative flex gap-3 sm:gap-4 flex-row-reverse pb-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-4 h-4 rounded-full mt-1 shrink-0 ${
                    session.sessionType === 'academic_warning'
                      ? 'bg-red-500 ring-4 ring-red-100'
                      : 'bg-sky-500 ring-4 ring-sky-100'
                  }`} />

                  <Card
                    className="flex-1 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openDetail(session)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 flex-row-reverse">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatDate(session.sessionDate)}
                          </span>
                        </div>
                        <Badge className={`text-[10px] sm:text-xs border-0 ${ADVISING_TYPE_COLORS[session.sessionType]}`}>
                          {ADVISING_TYPE_LABELS[session.sessionType]}
                        </Badge>
                      </div>
                      {session.sessionType === 'academic_warning' && (
                        <div className="flex items-center gap-1.5 mt-2 flex-row-reverse">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs text-red-600 font-medium">إنذار أكاديمي</span>
                        </div>
                      )}
                      <p className="text-xs sm:text-sm text-slate-700 mt-2 line-clamp-2">{session.notes}</p>
                      {session.actionItems.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">المهام ({session.actionItems.length}):</span>
                          <div className="mt-1 space-y-1">
                            {session.actionItems.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-start gap-1.5 flex-row-reverse">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-[10px] sm:text-xs text-slate-600">{item}</span>
                              </div>
                            ))}
                            {session.actionItems.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">+{session.actionItems.length - 3} مهام أخرى...</span>
                            )}
                          </div>
                        </div>
                      )}
                      {session.followUpDate && (
                        <div className="flex items-center gap-1.5 mt-2 flex-row-reverse">
                          <Clock className="w-3 h-3 text-sky-500" />
                          <span className="text-[10px] sm:text-xs text-sky-600">
                            متابعة: {formatDate(session.followUpDate)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Sessions List */
        <>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm sm:text-base">لا توجد جلسات إرشاد</p>
                <p className="text-xs sm:text-sm mt-1">قم بإضافة جلسة إرشاد جديدة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-[600px] overflow-y-auto">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    session.sessionType === 'academic_warning' ? 'border-red-200 bg-red-50/30' : ''
                  }`}
                  onClick={() => openDetail(session)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse">
                      {/* Icon */}
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        session.sessionType === 'academic_warning'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-sky-50 text-sky-600'
                      }`}>
                        {session.sessionType === 'academic_warning' ? (
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap flex-row-reverse">
                          <div className="flex items-center gap-2 flex-row-reverse">
                            <span className="font-semibold text-sm text-slate-800 truncate">
                              {session.studentName}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              ← {session.advisorName}
                            </span>
                          </div>
                          <Badge className={`text-[10px] sm:text-xs border-0 ${ADVISING_TYPE_COLORS[session.sessionType]}`}>
                            {ADVISING_TYPE_LABELS[session.sessionType]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mt-1 flex-wrap flex-row-reverse">
                          <div className="flex items-center gap-1 flex-row-reverse">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              {formatDate(session.sessionDate)}
                            </span>
                          </div>
                          {session.followUpDate && (
                            <div className="flex items-center gap-1 flex-row-reverse">
                              <Clock className="w-3 h-3 text-sky-500" />
                              <span className="text-[10px] sm:text-xs text-sky-600">
                                متابعة: {formatDate(session.followUpDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {session.notes && (
                          <p className="text-[10px] sm:text-xs text-slate-600 mt-1.5 line-clamp-1">{session.notes}</p>
                        )}

                        {session.actionItems.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-row-reverse">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] sm:text-xs text-emerald-600">
                              {session.actionItems.length} مهمة
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-slate-400 hover:text-sky-600"
                          onClick={() => setTimelineStudentId(session.studentId)}
                          title="عرض السجل الزمني"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-slate-400 hover:text-red-600"
                          onClick={() => openDeleteConfirm(session)}
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
        </>
      )}

      {/* ============ Add Session Dialog ============ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse">
              <Plus className="w-5 h-5" />
              إضافة جلسة إرشاد جديدة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">اسم الطالب *</Label>
                <Input
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  placeholder="اسم الطالب"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">الرقم الجامعي</Label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="مثال: ST-2024-001"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">المرشد الأكاديمي *</Label>
                <Input
                  value={formData.advisor_name}
                  onChange={(e) => setFormData({ ...formData, advisor_name: e.target.value })}
                  placeholder="اسم المرشد"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">نوع الجلسة *</Label>
                <Select value={formData.session_type} onValueChange={(v) => setFormData({ ...formData, session_type: v as AdvisingType })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ADVISING_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تاريخ الجلسة *</Label>
                <Input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تاريخ المتابعة</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">ملاحظات الجلسة</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="تفاصيل جلسة الإرشاد..."
                rows={3}
                className="text-xs sm:text-sm"
              />
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">
                المهام والإجراءات <span className="text-muted-foreground">(سطر واحد لكل مهمة)</span>
              </Label>
              <Textarea
                value={formData.action_items_text}
                onChange={(e) => setFormData({ ...formData, action_items_text: e.target.value })}
                placeholder={'مهمة 1\nمهمة 2\nمهمة 3'}
                rows={3}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
            <Button onClick={handleAdd} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" />
                  جارٍ الحفظ...
                </>
              ) : 'إضافة الجلسة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Session Detail Dialog ============ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-row-reverse">
                  <Eye className="w-5 h-5 text-sky-600" />
                  تفاصيل جلسة الإرشاد
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                {/* Header Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailItem icon={<UserCheck className="w-4 h-4" />} label="الطالب" value={selectedSession.studentName} />
                  <DetailItem icon={<MessageSquare className="w-4 h-4" />} label="المرشد" value={selectedSession.advisorName} />
                  <DetailItem icon={<Calendar className="w-4 h-4" />} label="تاريخ الجلسة" value={formatDate(selectedSession.sessionDate)} />
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">نوع الجلسة:</span>
                    <Badge className={`text-[10px] sm:text-xs border-0 ${ADVISING_TYPE_COLORS[selectedSession.sessionType]}`}>
                      {ADVISING_TYPE_LABELS[selectedSession.sessionType]}
                    </Badge>
                  </div>
                </div>

                {selectedSession.sessionType === 'academic_warning' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 flex-row-reverse">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-xs text-red-700 font-medium">هذه جلسة إنذار أكاديمي — يتطلب متابعة خاصة</span>
                  </div>
                )}

                <Separator />

                {/* Notes */}
                {selectedSession.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5 flex-row-reverse">
                      <FileText className="w-3.5 h-3.5" />
                      ملاحظات الجلسة
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">
                      {selectedSession.notes}
                    </p>
                  </div>
                )}

                {/* Action Items */}
                {selectedSession.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5 flex-row-reverse">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      المهام والإجراءات ({selectedSession.actionItems.length})
                    </h4>
                    <div className="space-y-1.5">
                      {selectedSession.actionItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex-row-reverse"
                        >
                          <div className="w-5 h-5 rounded border-2 border-emerald-400 flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span className="text-xs sm:text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                {selectedSession.followUpDate && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-center gap-2 flex-row-reverse">
                    <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <span className="text-[10px] sm:text-xs text-sky-600">تاريخ المتابعة:</span>
                      <span className="text-xs sm:text-sm text-sky-800 font-medium mr-1">
                        {formatDate(selectedSession.followUpDate)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    setTimelineStudentId(selectedSession.studentId);
                  }}
                >
                  <Clock className="w-4 h-4 ml-1" />
                  عرض السجل الزمني
                </Button>
                <Button onClick={() => setDetailOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </>
          )}
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
            هل أنت متأكد من حذف جلسة الإرشاد هذه؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" />
                  جارٍ الحذف...
                </>
              ) : 'حذف الجلسة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Sub-components ============

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 flex-row-reverse">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{label}:</span>
      <span className="text-xs sm:text-sm text-slate-800 truncate">{value}</span>
    </div>
  );
}
