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
  Star,
  BarChart3,
  TrendingUp,
  ClipboardCheck,
  Plus,
  Trash2,
  Edit,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  PerformanceEvaluation,
  EvaluationType,
} from '@/lib/store';
import {
  EVALUATION_TYPE_LABELS,
  EVALUATION_TYPE_COLORS,
  SEMESTER_NAMES,
} from '@/lib/store';

// ============ Helpers ============

function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-emerald-600';
  if (score >= 3.5) return 'text-sky-600';
  if (score >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number): string {
  if (score >= 4.5) return 'bg-emerald-500';
  if (score >= 3.5) return 'bg-sky-500';
  if (score >= 2.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 4.5) return 'ممتاز';
  if (score >= 3.5) return 'جيد جداً';
  if (score >= 2.5) return 'مقبول';
  return 'يحتاج تحسين';
}

function getScoreBg(score: number): string {
  if (score >= 4.5) return 'bg-emerald-50 border-emerald-200';
  if (score >= 3.5) return 'bg-sky-50 border-sky-200';
  if (score >= 2.5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

// ============ Component ============

export default function PerformanceEvaluations() {
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterFaculty, setFilterFaculty] = useState<string>('all');

  // Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<PerformanceEvaluation | null>(null);

  // Form
  const emptyForm = {
    facultyName: '',
    evaluationType: 'student_feedback' as EvaluationType,
    academicYear: '1446',
    semester: 1,
    teachingScore: 3.0,
    researchScore: 3.0,
    serviceScore: 3.0,
    overallScore: 3.0,
    comments: '',
  };
  const [form, setForm] = useState(emptyForm);

  // Fetch
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/performance-evaluations');
      const data = await res.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter
  const filtered = useMemo(() => {
    return evaluations.filter((e) => {
      const matchType = filterType === 'all' || e.evaluationType === filterType;
      const matchSemester = filterSemester === 'all' || String(e.semester) === filterSemester;
      const matchFaculty = filterFaculty === 'all' || e.facultyName === filterFaculty;
      return matchType && matchSemester && matchFaculty;
    });
  }, [evaluations, filterType, filterSemester, filterFaculty]);

  // Unique values
  const facultyNames = useMemo(() => {
    return [...new Set(evaluations.map((e) => e.facultyName))].sort();
  }, [evaluations]);

  const semesters = useMemo(() => {
    return [...new Set(evaluations.map((e) => e.semester))].sort();
  }, [evaluations]);

  // Stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return { avgTeaching: 0, avgResearch: 0, avgService: 0, avgOverall: 0, excellent: 0, needsImprovement: 0 };
    const avgTeaching = filtered.reduce((s, e) => s + e.teachingScore, 0) / filtered.length;
    const avgResearch = filtered.reduce((s, e) => s + e.researchScore, 0) / filtered.length;
    const avgService = filtered.reduce((s, e) => s + e.serviceScore, 0) / filtered.length;
    const avgOverall = filtered.reduce((s, e) => s + e.overallScore, 0) / filtered.length;
    const excellent = filtered.filter((e) => e.overallScore >= 4.5).length;
    const needsImprovement = filtered.filter((e) => e.overallScore < 2.5).length;
    return { avgTeaching, avgResearch, avgService, avgOverall, excellent, needsImprovement };
  }, [filtered]);

  // Handlers
  const handleAdd = async () => {
    try {
      const res = await fetch('/api/performance-evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('تم إضافة التقييم بنجاح');
        setAddOpen(false);
        setForm(emptyForm);
        fetchData();
      } else {
        toast.error('فشل في إضافة التقييم');
      }
    } catch {
      toast.error('فشل في إضافة التقييم');
    }
  };

  const handleEdit = (evaluation: PerformanceEvaluation) => {
    setSelectedEval(evaluation);
    setForm({
      facultyName: evaluation.facultyName,
      evaluationType: evaluation.evaluationType,
      academicYear: evaluation.academicYear,
      semester: evaluation.semester,
      teachingScore: evaluation.teachingScore,
      researchScore: evaluation.researchScore,
      serviceScore: evaluation.serviceScore,
      overallScore: evaluation.overallScore,
      comments: evaluation.comments,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedEval) return;
    try {
      const res = await fetch('/api/performance-evaluations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEval.id, ...form }),
      });
      if (res.ok) {
        toast.success('تم تحديث التقييم');
        setEditOpen(false);
        fetchData();
      } else {
        toast.error('فشل في تحديث التقييم');
      }
    } catch {
      toast.error('فشل في تحديث التقييم');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/performance-evaluations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('تم حذف التقييم');
        fetchData();
      } else {
        toast.error('فشل في حذف التقييم');
      }
    } catch {
      toast.error('فشل في حذف التقييم');
    }
  };

  // Score bar component
  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-xs text-muted-foreground">{label}</span>
        <span className={`text-[10px] sm:text-xs font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)} / 5.0
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getScoreBarColor(score)}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  // Score input component
  const ScoreInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className={`text-sm font-bold ${getScoreColor(value)}`}>{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={0.1}
        value={value}
        onChange={(e) => {
          const newVal = parseFloat(e.target.value);
          onChange(newVal);
          // Auto-calculate overall
          setForm((prev) => {
            let avg = 0;
            let count = 0;
            if (label === 'التدريس') avg += newVal;
            else avg += prev.teachingScore;
            count++;
            if (label === 'البحث') avg += newVal;
            else avg += prev.researchScore;
            count++;
            if (label === 'الخدمة') avg += newVal;
            else avg += prev.serviceScore;
            count++;
            return { ...prev, overallScore: count > 0 ? Math.round((avg / count) * 10) / 10 : 0 };
          });
        }}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );

  // Form dialog content
  const formContent = (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>اسم عضو هيئة التدريس</Label>
          <Input
            value={form.facultyName}
            onChange={(e) => setForm({ ...form, facultyName: e.target.value })}
            placeholder="د. ..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>نوع التقييم</Label>
          <Select
            value={form.evaluationType}
            onValueChange={(v) => setForm({ ...form, evaluationType: v as EvaluationType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVALUATION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-1.5">
          <Label>السنة الأكاديمية</Label>
          <Input
            value={form.academicYear}
            onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            placeholder="1446"
          />
        </div>
      </div>
      <div className="space-y-3 bg-slate-50 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-slate-700">الدرجات</h4>
        <ScoreInput
          label="التدريس"
          value={form.teachingScore}
          onChange={(v) => setForm({ ...form, teachingScore: v })}
        />
        <ScoreInput
          label="البحث العلمي"
          value={form.researchScore}
          onChange={(v) => setForm({ ...form, researchScore: v })}
        />
        <ScoreInput
          label="الخدمة"
          value={form.serviceScore}
          onChange={(v) => setForm({ ...form, serviceScore: v })}
        />
        <div className="border-t pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">المعدل العام</Label>
            <span className={`text-lg font-bold ${getScoreColor(form.overallScore)}`}>
              {form.overallScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>ملاحظات</Label>
        <Textarea
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
          placeholder="أضف ملاحظاتك هنا..."
          rows={3}
        />
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: 'متوسط التدريس', value: stats.avgTeaching.toFixed(1), icon: Star, color: getScoreBg(stats.avgTeaching), textColor: getScoreColor(stats.avgTeaching) },
          { label: 'متوسط البحث', value: stats.avgResearch.toFixed(1), icon: BarChart3, color: getScoreBg(stats.avgResearch), textColor: getScoreColor(stats.avgResearch) },
          { label: 'متوسط الخدمة', value: stats.avgService.toFixed(1), icon: ClipboardCheck, color: getScoreBg(stats.avgService), textColor: getScoreColor(stats.avgService) },
          { label: 'المعدل العام', value: stats.avgOverall.toFixed(1), icon: TrendingUp, color: getScoreBg(stats.avgOverall), textColor: getScoreColor(stats.avgOverall) },
          { label: 'ممتاز', value: stats.excellent, icon: Star, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'يحتاج تحسين', value: stats.needsImprovement, icon: TrendingUp, color: 'bg-red-50 text-red-700' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-2.5 sm:p-3 md:p-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color.includes('border') ? stat.color : ''}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.textColor || stat.color.split(' ').pop()}}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${stat.textColor || ''}`}>{stat.value}</p>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="نوع التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(EVALUATION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="الفصل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفصول</SelectItem>
                {semesters.map((s) => (
                  <SelectItem key={s} value={String(s)}>{SEMESTER_NAMES[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterFaculty} onValueChange={setFilterFaculty}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="عضو هيئة التدريس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الجميع</SelectItem>
                {facultyNames.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 flex-row-reverse text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">إضافة تقييم</span>
                  <span className="sm:hidden">إضافة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة تقييم أداء</DialogTitle>
                </DialogHeader>
                {formContent}
                <DialogFooter className="gap-2">
                  <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                    إضافة التقييم
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

      {/* Evaluation Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <ClipboardCheck className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm sm:text-base">لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((evaluation) => (
            <Card key={evaluation.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">{evaluation.facultyName}</h3>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <Badge className={`text-[9px] sm:text-[10px] ${EVALUATION_TYPE_COLORS[evaluation.evaluationType]}`}>
                        {EVALUATION_TYPE_LABELS[evaluation.evaluationType]}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] sm:text-[10px]">
                        {SEMESTER_NAMES[evaluation.semester]}
                      </Badge>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground">{evaluation.academicYear}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-amber-600"
                      onClick={() => handleEdit(evaluation)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-red-600"
                      onClick={() => handleDelete(evaluation.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Score Bars */}
                <div className="space-y-2 mb-3">
                  <ScoreBar label="التدريس" score={evaluation.teachingScore} />
                  <ScoreBar label="البحث العلمي" score={evaluation.researchScore} />
                  <ScoreBar label="الخدمة" score={evaluation.serviceScore} />
                </div>

                {/* Overall Score */}
                <div className={`rounded-lg border p-2.5 text-center ${getScoreBg(evaluation.overallScore)}`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Star className={`w-4 h-4 ${getScoreColor(evaluation.overallScore)}`} />
                    <span className={`text-xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                      {evaluation.overallScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium ${getScoreColor(evaluation.overallScore)}`}>
                    {getScoreLabel(evaluation.overallScore)}
                  </span>
                </div>

                {/* Comments preview */}
                {evaluation.comments && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {evaluation.comments}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل التقييم</DialogTitle>
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
