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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  FileText,
  Award,
  GraduationCap,
  Star,
  Building,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  UserCheck,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  FieldTraining,
  TrainingStatus,
  GraduationProject,
  ProjectType,
  ProjectStatus,
} from '@/lib/store';
import {
  TRAINING_STATUS_LABELS,
  TRAINING_STATUS_COLORS,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPE_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from '@/lib/store';

// ============ DB Row → TypeScript Mappers ============

function mapTrainingRow(row: Record<string, unknown>): FieldTraining {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    studentName: (row.student_name as string) || '',
    organizationName: (row.organization_name as string) || '',
    supervisorName: (row.supervisor_name as string) || '',
    supervisorContact: (row.supervisor_contact as string) || '',
    startDate: (row.start_date as string) || undefined,
    endDate: (row.end_date as string) || undefined,
    trainingField: (row.training_field as string) || '',
    status: (row.status as TrainingStatus) || 'planned',
    supervisorRating: row.supervisor_rating != null ? Number(row.supervisor_rating) : undefined,
    advisorRating: row.advisor_rating != null ? Number(row.advisor_rating) : undefined,
    reportSubmitted: (row.report_submitted as boolean) ?? false,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || undefined,
  };
}

function mapProjectRow(row: Record<string, unknown>): GraduationProject {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    studentName: (row.student_name as string) || '',
    title: (row.title as string) || '',
    description: (row.description as string) || '',
    supervisorId: (row.supervisor_id as string) || undefined,
    supervisorName: (row.supervisor_name as string) || '',
    projectType: (row.project_type as ProjectType) || 'research',
    status: (row.project_status as ProjectStatus) || (row.status as ProjectStatus) || 'proposed',
    grade: (row.grade as string) || undefined,
    submissionDate: (row.submission_date as string) || undefined,
    defenseDate: (row.defense_date as string) || undefined,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || undefined,
  };
}

// ============ Star Rating Component ============

function StarRating({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-0.5 flex-row-reverse">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'} ${
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
          }`}
        />
      ))}
      <span className="text-[10px] sm:text-xs text-muted-foreground mr-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ============ Empty Form States ============

interface TrainingFormData {
  student_id: string;
  student_name: string;
  organization_name: string;
  supervisor_name: string;
  supervisor_contact: string;
  start_date: string;
  end_date: string;
  training_field: string;
  status: TrainingStatus;
  supervisor_rating: string;
  advisor_rating: string;
  report_submitted: boolean;
}

const emptyTrainingForm: TrainingFormData = {
  student_id: '',
  student_name: '',
  organization_name: '',
  supervisor_name: '',
  supervisor_contact: '',
  start_date: '',
  end_date: '',
  training_field: '',
  status: 'planned',
  supervisor_rating: '0',
  advisor_rating: '0',
  report_submitted: false,
};

interface ProjectFormData {
  student_id: string;
  student_name: string;
  title: string;
  description: string;
  supervisor_name: string;
  project_type: ProjectType;
  status: ProjectStatus;
  grade: string;
  submission_date: string;
  defense_date: string;
}

const emptyProjectForm: ProjectFormData = {
  student_id: '',
  student_name: '',
  title: '',
  description: '',
  supervisor_name: '',
  project_type: 'research',
  status: 'proposed',
  grade: '',
  submission_date: '',
  defense_date: '',
};

// ============ Project Status Progression ============

const PROJECT_STATUS_FLOW: ProjectStatus[] = [
  'proposed', 'approved', 'in_progress', 'submitted', 'defended',
];

// ============ Format Date ============

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr || '';
  }
}

// ============ Component ============

export default function TrainingAndProjects() {
  const [activeTab, setActiveTab] = useState('training');

  // ============ State ============

  const [trainings, setTrainings] = useState<FieldTraining[]>([]);
  const [projects, setProjects] = useState<GraduationProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Training filters
  const [tFilterStatus, setTFilterStatus] = useState<string>('all');
  const [tFilterStudent, setTFilterStudent] = useState<string>('all');
  const [tFilterField, setTFilterField] = useState<string>('all');

  // Project filters
  const [pFilterStatus, setPFilterStatus] = useState<string>('all');
  const [pFilterType, setPFilterType] = useState<string>('all');
  const [pFilterSupervisor, setPFilterSupervisor] = useState<string>('all');

  // Training dialogs
  const [tFormOpen, setTFormOpen] = useState(false);
  const [tDetailOpen, setTDetailOpen] = useState(false);
  const [tDeleteOpen, setTDeleteOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<FieldTraining | null>(null);
  const [trainingForm, setTrainingForm] = useState<TrainingFormData>(emptyTrainingForm);
  const [isEditingTraining, setIsEditingTraining] = useState(false);
  const [submittingT, setSubmittingT] = useState(false);

  // Project dialogs
  const [pFormOpen, setPFormOpen] = useState(false);
  const [pDetailOpen, setPDetailOpen] = useState(false);
  const [pDeleteOpen, setPDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<GraduationProject | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormData>(emptyProjectForm);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [submittingP, setSubmittingP] = useState(false);

  // ============ Fetch Data ============

  const fetchTrainings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (tFilterStatus !== 'all') params.set('status', tFilterStatus);
      if (tFilterStudent !== 'all') params.set('student', tFilterStudent);
      if (tFilterField !== 'all') params.set('training_field', tFilterField);

      const res = await fetch(`/api/field-training?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل بيانات التدريب');
      const data = await res.json();
      setTrainings((data as Record<string, unknown>[]).map(mapTrainingRow));
    } catch (err) {
      console.error('Error fetching trainings:', err);
    }
  }, [tFilterStatus, tFilterStudent, tFilterField]);

  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (pFilterStatus !== 'all') params.set('status', pFilterStatus);
      if (pFilterType !== 'all') params.set('type', pFilterType);
      if (pFilterSupervisor !== 'all') params.set('supervisor', pFilterSupervisor);

      const res = await fetch(`/api/graduation-projects?${params.toString()}`);
      if (!res.ok) throw new Error('فشل تحميل بيانات المشاريع');
      const data = await res.json();
      setProjects((data as Record<string, unknown>[]).map(mapProjectRow));
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, [pFilterStatus, pFilterType, pFilterSupervisor]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTrainings(), fetchProjects()]).finally(() => setLoading(false));
  }, [fetchTrainings, fetchProjects]);

  // ============ Unique Values for Filters ============

  const trainingStudents = useMemo(() => {
    const set = new Set(trainings.map((t) => t.studentName).filter(Boolean));
    return Array.from(set).sort();
  }, [trainings]);

  const trainingFields = useMemo(() => {
    const set = new Set(trainings.map((t) => t.trainingField).filter(Boolean));
    return Array.from(set).sort();
  }, [trainings]);

  const projectSupervisors = useMemo(() => {
    const set = new Set(projects.map((p) => p.supervisorName).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  // ============ Training CRUD ============

  const openAddTraining = () => {
    setIsEditingTraining(false);
    setTrainingForm(emptyTrainingForm);
    setTFormOpen(true);
  };

  const openEditTraining = (t: FieldTraining) => {
    setIsEditingTraining(true);
    setSelectedTraining(t);
    setTrainingForm({
      student_id: t.studentId,
      student_name: t.studentName,
      organization_name: t.organizationName,
      supervisor_name: t.supervisorName,
      supervisor_contact: t.supervisorContact,
      start_date: t.startDate || '',
      end_date: t.endDate || '',
      training_field: t.trainingField,
      status: t.status,
      supervisor_rating: String(t.supervisorRating || 0),
      advisor_rating: String(t.advisorRating || 0),
      report_submitted: t.reportSubmitted,
    });
    setTFormOpen(true);
  };

  const handleTrainingSubmit = async () => {
    if (!trainingForm.student_name.trim() || !trainingForm.organization_name.trim()) {
      toast.error('الرجاء تعبئة الحقول المطلوبة');
      return;
    }

    setSubmittingT(true);
    try {
      const payload: Record<string, unknown> = {
        student_id: trainingForm.student_id,
        student_name: trainingForm.student_name,
        organization_name: trainingForm.organization_name,
        supervisor_name: trainingForm.supervisor_name,
        supervisor_contact: trainingForm.supervisor_contact || null,
        start_date: trainingForm.start_date || null,
        end_date: trainingForm.end_date || null,
        training_field: trainingForm.training_field,
        status: trainingForm.status,
        supervisor_rating: Number(trainingForm.supervisor_rating) || null,
        advisor_rating: Number(trainingForm.advisor_rating) || null,
        report_submitted: trainingForm.report_submitted,
      };

      let res: Response;
      if (isEditingTraining && selectedTraining) {
        res = await fetch('/api/field-training', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedTraining.id, ...payload }),
        });
        if (!res.ok) throw new Error('فشل تحديث البيانات');
        toast.success('تم تحديث سجل التدريب بنجاح');
      } else {
        res = await fetch('/api/field-training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('فشل إضافة التدريب');
        toast.success('تمت إضافة سجل التدريب بنجاح');
      }

      setTFormOpen(false);
      fetchTrainings();
    } catch (err) {
      console.error('Training submit error:', err);
      toast.error(isEditingTraining ? 'فشل تحديث بيانات التدريب' : 'فشل إضافة التدريب');
    } finally {
      setSubmittingT(false);
    }
  };

  const handleTrainingDelete = async () => {
    if (!selectedTraining) return;
    setSubmittingT(true);
    try {
      const res = await fetch('/api/field-training', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTraining.id }),
      });
      if (!res.ok) throw new Error('فشل الحذف');
      toast.success('تم حذف سجل التدريب بنجاح');
      setTDeleteOpen(false);
      fetchTrainings();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('فشل حذف سجل التدريب');
    } finally {
      setSubmittingT(false);
    }
  };

  // ============ Project CRUD ============

  const openAddProject = () => {
    setIsEditingProject(false);
    setProjectForm(emptyProjectForm);
    setPFormOpen(true);
  };

  const openEditProject = (p: GraduationProject) => {
    setIsEditingProject(true);
    setSelectedProject(p);
    setProjectForm({
      student_id: p.studentId,
      student_name: p.studentName,
      title: p.title,
      description: p.description,
      supervisor_name: p.supervisorName,
      project_type: p.projectType,
      status: p.status,
      grade: p.grade || '',
      submission_date: p.submissionDate || '',
      defense_date: p.defenseDate || '',
    });
    setPFormOpen(true);
  };

  const handleProjectSubmit = async () => {
    if (!projectForm.title.trim() || !projectForm.student_name.trim()) {
      toast.error('الرجاء تعبئة الحقول المطلوبة');
      return;
    }

    setSubmittingP(true);
    try {
      const payload: Record<string, unknown> = {
        student_id: projectForm.student_id,
        student_name: projectForm.student_name,
        title: projectForm.title,
        description: projectForm.description,
        supervisor_name: projectForm.supervisor_name,
        project_type: projectForm.project_type,
        status: projectForm.status,
        grade: projectForm.grade || null,
        submission_date: projectForm.submission_date || null,
        defense_date: projectForm.defense_date || null,
      };

      let res: Response;
      if (isEditingProject && selectedProject) {
        res = await fetch('/api/graduation-projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedProject.id, ...payload }),
        });
        if (!res.ok) throw new Error('فشل تحديث البيانات');
        toast.success('تم تحديث بيانات المشروع بنجاح');
      } else {
        res = await fetch('/api/graduation-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('فشل إضافة المشروع');
        toast.success('تمت إضافة المشروع بنجاح');
      }

      setPFormOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('Project submit error:', err);
      toast.error(isEditingProject ? 'فشل تحديث بيانات المشروع' : 'فشل إضافة المشروع');
    } finally {
      setSubmittingP(false);
    }
  };

  const handleProjectDelete = async () => {
    if (!selectedProject) return;
    setSubmittingP(true);
    try {
      const res = await fetch('/api/graduation-projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedProject.id }),
      });
      if (!res.ok) throw new Error('فشل الحذف');
      toast.success('تم حذف المشروع بنجاح');
      setPDeleteOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('فشل حذف المشروع');
    } finally {
      setSubmittingP(false);
    }
  };

  // ============ Project Status Progress Index ============

  function getStatusProgressIndex(status: ProjectStatus): number {
    if (status === 'passed') return PROJECT_STATUS_FLOW.length;
    if (status === 'failed') return PROJECT_STATUS_FLOW.length;
    const idx = PROJECT_STATUS_FLOW.indexOf(status);
    return idx >= 0 ? idx : 0;
  }

  // ============ Render ============

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="training" className="flex-1 text-xs sm:text-sm">
            <Briefcase className="w-3.5 h-3.5 ml-1 sm:w-4 sm:h-4" />
            التدريب الميداني
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 text-xs sm:text-sm">
            <GraduationCap className="w-3.5 h-3.5 ml-1 sm:w-4 sm:h-4" />
            مشاريع التخرج
          </TabsTrigger>
        </TabsList>

        {/* ============ FIELD TRAINING TAB ============ */}
        <TabsContent value="training" className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {/* Training Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select value={tFilterStatus} onValueChange={setTFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {Object.entries(TRAINING_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tFilterStudent} onValueChange={setTFilterStudent}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="الطالب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبة</SelectItem>
                    {trainingStudents.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tFilterField} onValueChange={setTFilterField}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="مجال التدريب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المجالات</SelectItem>
                    {trainingFields.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={openAddTraining} className="sm:mr-auto shrink-0">
                  <Plus className="w-4 h-4 ml-1.5" />
                  إضافة سجل
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Training Records */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trainings.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
                <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm sm:text-base">لا توجد سجلات تدريب</p>
                <p className="text-xs sm:text-sm mt-1">قم بإضافة سجل تدريب جديد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-[600px] overflow-y-auto">
              {trainings.map((training) => (
                <Card key={training.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse">
                      {/* Icon */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap flex-row-reverse">
                          <span className="font-semibold text-sm text-slate-800 truncate">
                            {training.studentName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge className={`text-[10px] sm:text-xs border-0 ${TRAINING_STATUS_COLORS[training.status]}`}>
                              {TRAINING_STATUS_LABELS[training.status]}
                            </Badge>
                            {training.reportSubmitted && (
                              <Badge className="text-[10px] sm:text-xs border-0 bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 ml-0.5" />
                                التقرير
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                          {training.organizationName}
                        </p>

                        <div className="flex items-center gap-3 mt-2 flex-wrap flex-row-reverse">
                          <div className="flex items-center gap-1 flex-row-reverse">
                            <UserCheck className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] sm:text-xs text-muted-foreground">{training.supervisorName}</span>
                          </div>
                          {training.startDate && (
                            <div className="flex items-center gap-1 flex-row-reverse">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                {formatDate(training.startDate)} - {formatDate(training.endDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {training.trainingField && (
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] mt-1.5">
                            {training.trainingField}
                          </Badge>
                        )}

                        {/* Ratings */}
                        {(training.supervisorRating != null && training.supervisorRating > 0) && (
                          <div className="flex items-center gap-3 mt-2 flex-row-reverse">
                            <div className="flex items-center gap-1.5 flex-row-reverse">
                              <span className="text-[10px] text-muted-foreground">المشرف:</span>
                              <StarRating rating={training.supervisorRating} />
                            </div>
                            {(training.advisorRating != null && training.advisorRating > 0) && (
                              <div className="flex items-center gap-1.5 flex-row-reverse">
                                <span className="text-[10px] text-muted-foreground">المرشد:</span>
                                <StarRating rating={training.advisorRating} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-sky-600" onClick={() => openEditTraining(training)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-red-600" onClick={() => { setSelectedTraining(training); setTDeleteOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ============ GRADUATION PROJECTS TAB ============ */}
        <TabsContent value="projects" className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {/* Project Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select value={pFilterStatus} onValueChange={setPFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={pFilterType} onValueChange={setPFilterType}>
                  <SelectTrigger className="w-full sm:w-[130px]">
                    <SelectValue placeholder="نوع المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={pFilterSupervisor} onValueChange={setPFilterSupervisor}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="المشرف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المشرفين</SelectItem>
                    {projectSupervisors.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={openAddProject} className="sm:mr-auto shrink-0">
                  <Plus className="w-4 h-4 ml-1.5" />
                  إضافة مشروع
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center text-muted-foreground">
                <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm sm:text-base">لا توجد مشاريع تخرج</p>
                <p className="text-xs sm:text-sm mt-1">قم بإضافة مشروع تخرج جديد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[600px] overflow-y-auto">
              {projects.map((project) => {
                const progressIdx = getStatusProgressIndex(project.status);
                const isTerminal = project.status === 'passed' || project.status === 'failed';

                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse">
                        {/* Icon */}
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          project.status === 'passed' ? 'bg-emerald-50 text-emerald-600' :
                          project.status === 'failed' ? 'bg-red-50 text-red-600' :
                          'bg-violet-50 text-violet-600'
                        }`}>
                          {project.status === 'passed' ? (
                            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : project.status === 'failed' ? (
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap flex-row-reverse">
                            <h3 className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                              {project.title}
                            </h3>
                            <Badge className={`text-[10px] sm:text-xs border-0 ${PROJECT_STATUS_COLORS[project.status]}`}>
                              {PROJECT_STATUS_LABELS[project.status]}
                            </Badge>
                          </div>

                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                            {project.studentName}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap flex-row-reverse">
                            <Badge variant="outline" className={`text-[9px] sm:text-[10px] ${PROJECT_TYPE_COLORS[project.projectType]}`}>
                              {PROJECT_TYPE_LABELS[project.projectType]}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">المشرف: {project.supervisorName}</span>
                          </div>

                          {/* Status Progression */}
                          <div className="mt-2.5">
                            <div className="flex items-center gap-1 flex-row-reverse">
                              {PROJECT_STATUS_FLOW.map((step, i) => (
                                <div key={step} className="flex items-center gap-0.5 flex-row-reverse">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      i <= progressIdx - 1 || (isTerminal && i === progressIdx - 1)
                                        ? project.status === 'failed' && i === progressIdx - 1
                                          ? 'bg-red-500'
                                          : 'bg-emerald-500'
                                        : 'bg-slate-200'
                                    }`}
                                    title={PROJECT_STATUS_LABELS[step]}
                                  />
                                  {i < PROJECT_STATUS_FLOW.length - 1 && (
                                    <div
                                      className={`w-3 h-0.5 ${
                                        i < progressIdx - 1
                                          ? 'bg-emerald-300'
                                          : 'bg-slate-200'
                                      }`}
                                    />
                                  )}
                                </div>
                              ))}
                              {/* Terminal status indicator */}
                              <div className="flex items-center gap-0.5 flex-row-reverse">
                                <div
                                  className={`w-2 h-0.5 ${isTerminal ? 'bg-slate-200' : 'bg-slate-200'}`}
                                />
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    isTerminal
                                      ? project.status === 'passed' ? 'bg-emerald-500' : 'bg-red-500'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="flex justify-between mt-0.5">
                              <span className="text-[8px] text-muted-foreground">مقترح</span>
                              <span className={`text-[8px] font-medium ${
                                isTerminal
                                  ? project.status === 'passed' ? 'text-emerald-600' : 'text-red-600'
                                  : 'text-muted-foreground'
                              }`}>
                                {isTerminal ? (project.status === 'passed' ? 'ناجح' : 'راسب') : PROJECT_STATUS_LABELS[project.status]}
                              </span>
                            </div>
                          </div>

                          {/* Grade */}
                          {project.grade && (
                            <div className="flex items-center gap-1.5 mt-2 flex-row-reverse">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-xs font-semibold text-amber-600">{project.grade}</span>
                            </div>
                          )}

                          {/* Dates */}
                          {(project.submissionDate || project.defenseDate) && (
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap flex-row-reverse">
                              {project.submissionDate && (
                                <div className="flex items-center gap-1 flex-row-reverse">
                                  <FileText className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    تسليم: {formatDate(project.submissionDate)}
                                  </span>
                                </div>
                              )}
                              {project.defenseDate && (
                                <div className="flex items-center gap-1 flex-row-reverse">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    دفاع: {formatDate(project.defenseDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-sky-600" onClick={() => { setSelectedProject(project); setPDetailOpen(true); }}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-sky-600" onClick={() => openEditProject(project)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-red-600" onClick={() => { setSelectedProject(project); setPDeleteOpen(true); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ============ Training Form Dialog ============ */}
      <Dialog open={tFormOpen} onOpenChange={setTFormOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse">
              <Briefcase className="w-5 h-5" />
              {isEditingTraining ? 'تعديل سجل التدريب' : 'إضافة سجل تدريب جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">اسم الطالب *</Label>
                <Input value={trainingForm.student_name} onChange={(e) => setTrainingForm({ ...trainingForm, student_name: e.target.value })} placeholder="اسم الطالب" className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">الرقم الجامعي</Label>
                <Input value={trainingForm.student_id} onChange={(e) => setTrainingForm({ ...trainingForm, student_id: e.target.value })} placeholder="مثال: ST-2024-001" className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">المؤسسة / المنظمة *</Label>
              <Input value={trainingForm.organization_name} onChange={(e) => setTrainingForm({ ...trainingForm, organization_name: e.target.value })} placeholder="اسم المنظمة" className="text-xs sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">اسم المشرف بالمنظمة</Label>
                <Input value={trainingForm.supervisor_name} onChange={(e) => setTrainingForm({ ...trainingForm, supervisor_name: e.target.value })} placeholder="اسم المشرف" className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">وسيلة التواصل</Label>
                <Input value={trainingForm.supervisor_contact} onChange={(e) => setTrainingForm({ ...trainingForm, supervisor_contact: e.target.value })} placeholder="رقم أو بريد" className="text-xs sm:text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تاريخ البدء</Label>
                <Input type="date" value={trainingForm.start_date} onChange={(e) => setTrainingForm({ ...trainingForm, start_date: e.target.value })} className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تاريخ الانتهاء</Label>
                <Input type="date" value={trainingForm.end_date} onChange={(e) => setTrainingForm({ ...trainingForm, end_date: e.target.value })} className="text-xs sm:text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">مجال التدريب</Label>
                <Input value={trainingForm.training_field} onChange={(e) => setTrainingForm({ ...trainingForm, training_field: e.target.value })} placeholder="مثال: برمجة، شبكات" className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">الحالة</Label>
                <Select value={trainingForm.status} onValueChange={(v) => setTrainingForm({ ...trainingForm, status: v as TrainingStatus })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRAINING_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تقييم المشرف (0-5)</Label>
                <Select value={trainingForm.supervisor_rating} onValueChange={(v) => setTrainingForm({ ...trainingForm, supervisor_rating: v })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={String(r)}>{r === 0 ? 'لم يتم التقييم' : `${r}/5`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تقييم المرشد (0-5)</Label>
                <Select value={trainingForm.advisor_rating} onValueChange={(v) => setTrainingForm({ ...trainingForm, advisor_rating: v })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={String(r)}>{r === 0 ? 'لم يتم التقييم' : `${r}/5`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <Button
                type="button"
                variant={trainingForm.report_submitted ? 'default' : 'outline'}
                size="sm"
                className={trainingForm.report_submitted ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => setTrainingForm({ ...trainingForm, report_submitted: !trainingForm.report_submitted })}
              >
                <CheckCircle2 className="w-4 h-4 ml-1.5" />
                التقرير {trainingForm.report_submitted ? 'تم التسليم' : 'لم يتم التسليم'}
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setTFormOpen(false)}>إلغاء</Button>
            <Button onClick={handleTrainingSubmit} disabled={submittingT}>
              {submittingT ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" /> جارٍ الحفظ...</>
              ) : isEditingTraining ? 'حفظ التعديلات' : 'إضافة السجل'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Training Delete Dialog ============ */}
      <Dialog open={tDeleteOpen} onOpenChange={setTDeleteOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse text-red-600">
              <Trash2 className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">هل أنت متأكد من حذف سجل التدريب هذا؟</p>
          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setTDeleteOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleTrainingDelete} disabled={submittingT}>
              {submittingT ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" /> جارٍ الحذف...</> : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Project Form Dialog ============ */}
      <Dialog open={pFormOpen} onOpenChange={setPFormOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse">
              <GraduationCap className="w-5 h-5" />
              {isEditingProject ? 'تعديل مشروع التخرج' : 'إضافة مشروع تخرج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">اسم الطالب *</Label>
                <Input value={projectForm.student_name} onChange={(e) => setProjectForm({ ...projectForm, student_name: e.target.value })} placeholder="اسم الطالب" className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">الرقم الجامعي</Label>
                <Input value={projectForm.student_id} onChange={(e) => setProjectForm({ ...projectForm, student_id: e.target.value })} placeholder="مثال: ST-2024-001" className="text-xs sm:text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">عنوان المشروع *</Label>
              <Input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="عنوان المشروع" className="text-xs sm:text-sm" />
            </div>
            <div>
              <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">وصف المشروع</Label>
              <Textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="وصف المشروع..." rows={2} className="text-xs sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">المشرف</Label>
                <Input value={projectForm.supervisor_name} onChange={(e) => setProjectForm({ ...projectForm, supervisor_name: e.target.value })} placeholder="اسم المشرف" className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">نوع المشروع</Label>
                <Select value={projectForm.project_type} onValueChange={(v) => setProjectForm({ ...projectForm, project_type: v as ProjectType })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">الحالة</Label>
                <Select value={projectForm.status} onValueChange={(v) => setProjectForm({ ...projectForm, status: v as ProjectStatus })}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">التقدير</Label>
                <Input value={projectForm.grade} onChange={(e) => setProjectForm({ ...projectForm, grade: e.target.value })} placeholder="مثال: أ" className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تاريخ التسليم</Label>
                <Input type="date" value={projectForm.submission_date} onChange={(e) => setProjectForm({ ...projectForm, submission_date: e.target.value })} className="text-xs sm:text-sm" />
              </div>
              <div>
                <Label className="text-[10px] sm:text-xs text-muted-foreground block mb-1">تاريخ الدفاع</Label>
                <Input type="date" value={projectForm.defense_date} onChange={(e) => setProjectForm({ ...projectForm, defense_date: e.target.value })} className="text-xs sm:text-sm" />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setPFormOpen(false)}>إلغاء</Button>
            <Button onClick={handleProjectSubmit} disabled={submittingP}>
              {submittingP ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" /> جارٍ الحفظ...</> : isEditingProject ? 'حفظ التعديلات' : 'إضافة المشروع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ Project Detail Dialog ============ */}
      <Dialog open={pDetailOpen} onOpenChange={setPDetailOpen}>
        <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-row-reverse">
                  <Eye className="w-5 h-5 text-sky-600" />
                  تفاصيل مشروع التخرج
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailItem icon={<GraduationCap className="w-4 h-4" />} label="عنوان المشروع" value={selectedProject.title} />
                  <DetailItem icon={<UserCheck className="w-4 h-4" />} label="الطالب" value={selectedProject.studentName} />
                  <DetailItem icon={<FileText className="w-4 h-4" />} label="المشرف" value={selectedProject.supervisorName} />
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">النوع:</span>
                    <Badge className={`text-[10px] sm:text-xs border-0 ${PROJECT_TYPE_COLORS[selectedProject.projectType]}`}>
                      {PROJECT_TYPE_LABELS[selectedProject.projectType]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">الحالة:</span>
                    <Badge className={`text-[10px] sm:text-xs border-0 ${PROJECT_STATUS_COLORS[selectedProject.status]}`}>
                      {PROJECT_STATUS_LABELS[selectedProject.status]}
                    </Badge>
                  </div>
                  {selectedProject.grade && (
                    <DetailItem icon={<Award className="w-4 h-4 text-amber-500" />} label="التقدير" value={selectedProject.grade} />
                  )}
                </div>

                {/* Status Progression Visualization */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5 flex-row-reverse">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    مراحل المشروع
                  </h4>
                  <div className="flex items-center gap-1 flex-row-reverse justify-between">
                    {PROJECT_STATUS_FLOW.map((step, i) => {
                      const currentIdx = getStatusProgressIndex(selectedProject.status);
                      const isActive = i === currentIdx - 1;
                      const isDone = i < currentIdx - 1;
                      const isTerminalPassed = selectedProject.status === 'passed' && i === PROJECT_STATUS_FLOW.length - 1;
                      const isTerminalFailed = selectedProject.status === 'failed' && i === PROJECT_STATUS_FLOW.length - 1;

                      return (
                        <div key={step} className="flex flex-col items-center gap-1 flex-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                            isDone || isTerminalPassed ? 'bg-emerald-500 text-white' :
                            isTerminalFailed ? 'bg-red-500 text-white' :
                            isActive ? 'bg-sky-500 text-white ring-2 ring-sky-200' :
                            'bg-slate-200 text-slate-400'
                          }`}>
                            {(isDone || isTerminalPassed) ? '✓' : (isTerminalFailed) ? '✗' : i + 1}
                          </div>
                          <span className={`text-[8px] sm:text-[9px] text-center leading-tight ${
                            isDone || isTerminalPassed ? 'text-emerald-700 font-medium' :
                            isTerminalFailed ? 'text-red-700 font-medium' :
                            isActive ? 'text-sky-700 font-medium' :
                            'text-slate-400'
                          }`}>
                            {PROJECT_STATUS_LABELS[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedProject.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 mb-1">الوصف</h4>
                    <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProject.submissionDate && (
                    <DetailItem icon={<FileText className="w-4 h-4" />} label="تاريخ التسليم" value={formatDate(selectedProject.submissionDate)} />
                  )}
                  {selectedProject.defenseDate && (
                    <DetailItem icon={<Calendar className="w-4 h-4" />} label="تاريخ الدفاع" value={formatDate(selectedProject.defenseDate)} />
                  )}
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => { setPDetailOpen(false); openEditProject(selectedProject); }}>
                  <Pencil className="w-4 h-4 ml-1.5" />
                  تعديل
                </Button>
                <Button onClick={() => setPDetailOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ Project Delete Dialog ============ */}
      <Dialog open={pDeleteOpen} onOpenChange={setPDeleteOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-row-reverse text-red-600">
              <Trash2 className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">هل أنت متأكد من حذف مشروع التخرج هذا؟</p>
          <DialogFooter className="mt-4 sm:gap-2 gap-1">
            <Button variant="outline" onClick={() => setPDeleteOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleProjectDelete} disabled={submittingP}>
              {submittingP ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" /> جارٍ الحذف...</> : 'حذف'}
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
