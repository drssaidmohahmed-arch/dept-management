'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Plus,
  Minus,
  Clock,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Users,
  ShieldAlert,
  ListOrdered,
  Info,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useEnrolledStudents,
  useCourses,
  addEnrollment,
  deleteEnrollment,
  SEMESTER_NAMES,
  MAX_CREDIT_HOURS_PER_SEMESTER,
} from '@/lib/supabase-store';
import { calculateGPA } from '@/lib/gpa-calculator';
import { toast } from 'sonner';

// Current student (hardcoded since no auth)
const CURRENT_STUDENT_ID = 'ST-2024-001';
const CURRENT_STUDENT_NAME = 'عبدالرحمن محمد السالم';

// Mock prerequisites map
const PREREQUISITES: Record<string, string[]> = {
  'CS201': ['CS101'],
  'CS202': ['CS102'],
  'CS205': ['CS102'],
  'CS301': ['CS201'],
  'CS305': ['CS202', 'CS201'],
};

// Mock course section capacity
const SECTION_CAPACITY: Record<string, number> = {
  'CS301': 40,
  'CS305': 35,
  'CS101': 40,
  'CS102': 35,
  'CS201': 45,
  'CS202': 30,
  'CS205': 30,
  'MATH101': 45,
};

// Mock course section instructors
const SECTION_INSTRUCTORS: Record<string, string> = {
  'CS301': 'د. أحمد محمد الشريف',
  'CS305': 'د. فاطمة علي الحسن',
  'CS101': 'د. أحمد محمد الشريف',
  'CS102': 'د. أحمد محمد الشريف',
  'CS201': 'د. أحمد محمد الشريف',
  'CS202': 'د. فاطمة علي الحسن',
  'CS205': 'د. خالد عبدالله العمري',
  'MATH101': 'د. فاطمة علي الحسن',
};

// Mock course section schedules
const SECTION_SCHEDULES: Record<string, string> = {
  'CS301': 'السبت 12:00-13:30',
  'CS305': 'الاثنين والخميس 10:00-11:30',
  'CS101': 'السبت والثلاثاء 08:00-09:30',
  'CS102': 'السبت 10:00-11:30',
  'CS201': 'الأحد والأربعاء 08:00-09:30',
  'CS202': 'الاثنين والخميس 08:00-09:30',
  'CS205': 'الأحد والأربعاء 12:00-13:30',
  'MATH101': 'الأحد والثلاثاء 10:00-11:30',
};

interface DraggableCourse {
  id: string;
  code: string;
  name: string;
  hours: number;
}

interface WaitlistEntry {
  id: string;
  sectionId: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  addedAt: string;
}

// ============ Confirmation Dialog ============
function RegistrationConfirmDialog({
  open,
  onOpenChange,
  course,
  totalHoursAfterAdd,
  prerequisiteWarnings,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: DraggableCourse | null;
  totalHoursAfterAdd: number;
  prerequisiteWarnings: string[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!course) return null;

  const isOverLimit = totalHoursAfterAdd > MAX_CREDIT_HOURS_PER_SEMESTER;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-row-reverse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            تأكيد التسجيل
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">المقرر:</span>
              <span className="font-medium">{course.name}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">الرمز:</span>
              <span className="font-mono">{course.code}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">الساعات:</span>
              <span>{course.hours} ساعة</span>
            </div>
            {SECTION_INSTRUCTORS[course.code] && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">المحاضر:</span>
                <span>{SECTION_INSTRUCTORS[course.code]}</span>
              </div>
            )}
            {SECTION_SCHEDULES[course.code] && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">الجدول:</span>
                <span>{SECTION_SCHEDULES[course.code]}</span>
              </div>
            )}
          </div>

          {prerequisiteWarnings.length > 0 && (
            <Alert className="border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <AlertTitle className="text-amber-800">تنبيه المتطلبات السابقة</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 mt-1">
                  {prerequisiteWarnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700">⚠️ {w}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isOverLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>تحذير الساعات</AlertTitle>
              <AlertDescription>
                <p className="text-xs">
                  ستتجاوز الساعات الحد الأقصى ({MAX_CREDIT_HOURS_PER_SEMESTER} ساعة) بعد إضافة هذا المقرر.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex justify-between text-xs sm:text-sm font-medium">
              <span>إجمالي الساعات بعد التسجيل:</span>
              <span className={isOverLimit ? 'text-red-600' : 'text-emerald-700'}>
                {totalHoursAfterAdd} / {MAX_CREDIT_HOURS_PER_SEMESTER}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-sm flex-1 sm:flex-none">
            تأكيد التسجيل
          </Button>
          <DialogClose asChild>
            <Button variant="outline" size="sm" onClick={onCancel}>
              إلغاء
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Drop Confirmation Dialog ============
function DropConfirmDialog({
  open,
  onOpenChange,
  course,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: DraggableCourse | null;
  onConfirm: () => void;
}) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-row-reverse text-red-700">
            <AlertTriangle className="w-5 h-5" />
            تأكيد إسقاط المقرر
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>تحذير مهم</AlertTitle>
            <AlertDescription>
              <p className="text-xs">
                إسقاط المقرر قد يؤثر على معدلك التراكمي وسجل التخرج. هل أنت متأكد من رغبتك في إسقاط هذا المقرر؟
              </p>
            </AlertDescription>
          </Alert>
          <div className="bg-red-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">المقرر:</span>
              <span className="font-medium text-red-800">{course.name}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">الرمز:</span>
              <span className="font-mono">{course.code}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">الساعات:</span>
              <span>{course.hours} ساعة</span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="destructive" size="sm" onClick={onConfirm} className="flex-1 sm:flex-none">
            <Trash2 className="w-4 h-4 ml-1" />
            نعم، إسقاط المقرر
          </Button>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              إلغاء
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Sortable Course Item ============
function SortableCourseItem({
  course,
  type,
  capacityInfo,
  onDropCourse,
}: {
  course: DraggableCourse;
  type: 'available' | 'registered';
  capacityInfo?: { enrolled: number; capacity: number };
  onDropCourse?: (course: DraggableCourse) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${type}-${course.code}`,
    data: { course, type },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isFull = capacityInfo && capacityInfo.enrolled >= capacityInfo.capacity;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
        type === 'available'
          ? 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
          : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
      } ${isFull && type === 'available' ? 'opacity-70' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="shrink-0 text-slate-400">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm text-slate-800 truncate">
            {course.name}
          </span>
          <Badge variant="outline" className="text-[10px] sm:text-xs font-mono shrink-0">
            {course.code}
          </Badge>
          {isFull && type === 'available' && (
            <Badge className="bg-red-100 text-red-700 text-[9px] sm:text-[10px] border-0">
              مكتمل
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5 flex-row-reverse">
            <Clock className="w-3 h-3" />
            {course.hours} ساعة
          </span>
          {capacityInfo && type === 'available' && (
            <span className="flex items-center gap-0.5 flex-row-reverse">
              <Users className="w-3 h-3" />
              {capacityInfo.enrolled}/{capacityInfo.capacity}
            </span>
          )}
          {SECTION_INSTRUCTORS[course.code] && type === 'available' && (
            <span className="hidden sm:flex items-center gap-0.5 flex-row-reverse truncate">
              {SECTION_INSTRUCTORS[course.code]}
            </span>
          )}
        </div>
      </div>
      {type === 'available' ? (
        <div className="shrink-0 text-sky-500">
          <Plus className="w-4 h-4" />
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDropCourse?.(course);
            }}
            className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600 transition-colors"
            title="إسقاط المقرر"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Drag overlay item
function DragOverlayItem({ course, type }: { course: DraggableCourse; type: 'available' | 'registered' }) {
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 shadow-lg ${
        type === 'available'
          ? 'bg-sky-50 border-sky-400'
          : 'bg-emerald-50 border-emerald-400'
      }`}
    >
      <div className="shrink-0 text-slate-400">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="font-medium text-xs sm:text-sm text-slate-800 truncate">
            {course.name}
          </span>
          <Badge variant="outline" className="text-[10px] sm:text-xs font-mono shrink-0">
            {course.code}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5 flex-row-reverse">
            <Clock className="w-3 h-3" />
            {course.hours} ساعة
          </span>
        </div>
      </div>
    </div>
  );
}

// ============ Main Component ============
export default function CourseRegistration() {
  const enrolledStudents = useEnrolledStudents();
  const courses = useCourses();
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<DraggableCourse | null>(null);
  const [prerequisiteWarnings, setPrerequisiteWarnings] = useState<string[]>([]);

  // Drop dialog state
  const [dropDialog, setDropDialog] = useState(false);
  const [dropCourse, setDropCourse] = useState<DraggableCourse | null>(null);

  // Waitlist state
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Sensors with small activation distance to allow click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // My enrollments for the selected semester
  const myEnrollments = useMemo(() => {
    return enrolledStudents.filter(
      (e) => e.studentId === CURRENT_STUDENT_ID && e.semester === selectedSemester
    );
  }, [enrolledStudents, selectedSemester]);

  // All enrollments for the selected semester (for capacity check)
  const semesterEnrollments = useMemo(() => {
    return enrolledStudents.filter(
      (e) => e.semester === selectedSemester && e.status === 'active'
    );
  }, [enrolledStudents, selectedSemester]);

  // Get enrollment count per course
  const enrollmentCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    semesterEnrollments.forEach((e) => {
      map[e.courseCode] = (map[e.courseCode] || 0) + 1;
    });
    return map;
  }, [semesterEnrollments]);

  // Check prerequisites
  const checkPrerequisites = useCallback((courseCode: string): string[] => {
    const prereqs = PREREQUISITES[courseCode];
    if (!prereqs || prereqs.length === 0) return [];

    const warnings: string[] = [];
    // Get all completed courses (previous semesters)
    const completedCourses = new Set(
      enrolledStudents
        .filter(
          (e) =>
            e.studentId === CURRENT_STUDENT_ID &&
            e.grade &&
            e.status === 'active' &&
            e.semester < selectedSemester
        )
        .map((e) => e.courseCode)
    );

    for (const prereq of prereqs) {
      if (!completedCourses.has(prereq)) {
        const prereqCourse = courses.find((c) => c.code === prereq);
        warnings.push(
          `لم تجتاز المتطلب السابق "${prereqCourse?.name || prereq}" (${prereq})`
        );
      }
    }
    return warnings;
  }, [enrolledStudents, courses, selectedSemester]);

  // Registered courses (from enrollments)
  const registeredCourses: DraggableCourse[] = useMemo(() => {
    return myEnrollments.map((e) => ({
      id: `registered-${e.courseCode}`,
      code: e.courseCode,
      name: courses.find((c) => c.code === e.courseCode)?.name || e.courseCode,
      hours: courses.find((c) => c.code === e.courseCode)?.hours || 0,
    }));
  }, [myEnrollments, courses]);

  // Available courses (courses for the semester not yet registered)
  const availableCourses: DraggableCourse[] = useMemo(() => {
    const registeredCodes = new Set(myEnrollments.map((e) => e.courseCode));
    return courses
      .filter((c) => c.semester === selectedSemester && !registeredCodes.has(c.code))
      .map((c) => ({
        id: `available-${c.code}`,
        code: c.code,
        name: c.name,
        hours: c.hours,
      }));
  }, [courses, selectedSemester, myEnrollments]);

  // Total credit hours for registered courses
  const totalHours = registeredCourses.reduce((sum, c) => sum + c.hours, 0);

  // Is over the limit?
  const isOverLimit = totalHours > MAX_CREDIT_HOURS_PER_SEMESTER;
  const isNearLimit = totalHours >= MAX_CREDIT_HOURS_PER_SEMESTER - 3;

  // Find active drag item
  const activeCourse = useMemo(() => {
    if (!activeId) return null;
    const type: 'available' | 'registered' = activeId.startsWith('available-') ? 'available' : 'registered';
    const code = activeId.replace('available-', '').replace('registered-', '');
    const allCourses = type === 'available' ? availableCourses : registeredCourses;
    return { course: allCourses.find((c) => c.code === code), type };
  }, [activeId, availableCourses, registeredCourses]);

  // Fetch waitlist
  const fetchWaitlist = useCallback(async () => {
    try {
      setWaitlistLoading(true);
      const res = await fetch(`/api/waitlist?studentId=${CURRENT_STUDENT_ID}`);
      if (res.ok) {
        setWaitlist(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setWaitlistLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  // Add to waitlist
  const addToWaitlist = useCallback(async (courseCode: string) => {
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: `${courseCode}-${selectedSemester}`,
          courseCode,
          studentId: CURRENT_STUDENT_ID,
          studentName: CURRENT_STUDENT_NAME,
        }),
      });
      if (res.ok) {
        toast.success('تم إضافتك إلى قائمة الانتظار');
        fetchWaitlist();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'حدث خطأ');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    }
  }, [selectedSemester, fetchWaitlist]);

  // Remove from waitlist
  const removeFromWaitlist = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/waitlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success('تم إزالتك من قائمة الانتظار');
        fetchWaitlist();
      }
    } catch {
      toast.error('خطأ في الاتصال');
    }
  }, [fetchWaitlist]);

  // Drop course handler
  const handleDropCourse = useCallback((course: DraggableCourse) => {
    setDropCourse(course);
    setDropDialog(true);
  }, []);

  const confirmDrop = useCallback(async () => {
    if (!dropCourse) return;
    const enrollment = myEnrollments.find((e) => e.courseCode === dropCourse.code);
    if (enrollment) {
      setIsLoading(true);
      try {
        await deleteEnrollment(enrollment.id);
        // Log the drop
        try {
          await fetch('/api/activity-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'drop_course',
              details: `إسقاط المقرر ${dropCourse.name} (${dropCourse.code})`,
              user_name: CURRENT_STUDENT_NAME,
            }),
          });
        } catch {
          // ignore log failure
        }
        toast.success(`تم إسقاط المقرر ${dropCourse.name}`);
      } catch (err) {
        toast.error('حدث خطأ أثناء إسقاط المقرر');
      }
      setIsLoading(false);
    }
    setDropDialog(false);
    setDropCourse(null);
  }, [dropCourse, myEnrollments]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over) return;

      const activeType = (active.id as string).startsWith('available-') ? 'available' : 'registered';
      const overType = (over.id as string).startsWith('available-') ? 'available' : 'registered';
      const courseCode = (active.id as string).replace('available-', '').replace('registered-', '');

      if (activeType === overType) return;

      if (activeType === 'available' && overType === 'registered') {
        const course = availableCourses.find((c) => c.code === courseCode);
        if (!course) return;

        // Check capacity
        const enrolled = enrollmentCountMap[courseCode] || 0;
        const capacity = SECTION_CAPACITY[courseCode] || 40;
        if (enrolled >= capacity) {
          // Offer waitlist
          toast.error(`المقرر "${course.name}" مكتمل (${enrolled}/${capacity}). سيتم إضافتك لقائمة الانتظار.`);
          addToWaitlist(courseCode);
          return;
        }

        // Check prerequisites
        const prereqWarnings = checkPrerequisites(courseCode);
        const newHours = totalHours + course.hours;
        const isOverHoursLimit = newHours > MAX_CREDIT_HOURS_PER_SEMESTER;

        if (prereqWarnings.length > 0 || isOverHoursLimit) {
          // Show confirmation dialog
          setPendingCourse(course);
          setPrerequisiteWarnings(prereqWarnings);
          setConfirmDialog(true);
          return;
        }

        // Direct registration (no warnings)
        setIsLoading(true);
        try {
          await addEnrollment({
            studentId: CURRENT_STUDENT_ID,
            studentName: CURRENT_STUDENT_NAME,
            courseCode: course.code,
            semester: selectedSemester,
          });
        } catch (err) {
          console.error('Registration error:', err);
        }
        setIsLoading(false);
      } else if (activeType === 'registered' && overType === 'available') {
        const course = registeredCourses.find((c) => c.code === courseCode);
        if (course) {
          handleDropCourse(course);
        }
      }
    },
    [availableCourses, registeredCourses, totalHours, myEnrollments, selectedSemester, enrollmentCountMap, checkPrerequisites, handleDropCourse, addToWaitlist]
  );

  // Confirm registration dialog handler
  const handleConfirmRegistration = useCallback(async () => {
    if (!pendingCourse) return;
    setConfirmDialog(false);
    setIsLoading(true);
    try {
      await addEnrollment({
        studentId: CURRENT_STUDENT_ID,
        studentName: CURRENT_STUDENT_NAME,
        courseCode: pendingCourse.code,
        semester: selectedSemester,
      });
    } catch (err) {
      console.error('Registration error:', err);
    }
    setIsLoading(false);
    setPendingCourse(null);
    setPrerequisiteWarnings([]);
  }, [pendingCourse, selectedSemester]);

  const handleCancelRegistration = useCallback(() => {
    setConfirmDialog(false);
    setPendingCourse(null);
    setPrerequisiteWarnings([]);
  }, []);

  // All draggable item IDs for sortable contexts
  const availableIds = availableCourses.map((c) => c.id);
  const registeredIds = registeredCourses.map((c) => c.id);

  // Waitlist course codes for this student
  const waitlistedCodes = new Set(waitlist.map((w) => w.courseCode));

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with semester selector */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800">التسجيل في المقررات</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                اسحب المقررات من القائمة المتاحة إلى المسجل بها، أو استخدم أزرار الإجراءات
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Select
                value={String(selectedSemester)}
                onValueChange={(v) => setSelectedSemester(Number(v))}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <SelectItem key={sem} value={String(sem)}>
                      {SEMESTER_NAMES[sem]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit hours indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-row-reverse">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            الساعات المسجلة
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm sm:text-base font-bold ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-emerald-600'}`}>
            {totalHours}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            / {MAX_CREDIT_HOURS_PER_SEMESTER} ساعة
          </span>
          {isOverLimit && (
            <Badge variant="destructive" className="text-[10px] sm:text-xs">
              <AlertTriangle className="w-3 h-3 ml-1" />
              تجاوز الحد
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isOverLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{
            width: `${Math.min((totalHours / MAX_CREDIT_HOURS_PER_SEMESTER) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>جارٍ المعالجة...</span>
        </div>
      )}

      {/* Drag and Drop Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Available Courses */}
          <Card>
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
                <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                المقررات المتاحة
                <Badge variant="secondary" className="text-[10px] sm:text-xs mr-auto">
                  {availableCourses.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 sm:pt-0">
              <SortableContext
                items={availableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[100px] max-h-96 overflow-y-auto">
                  {availableCourses.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs sm:text-sm">لا توجد مقررات متاحة</p>
                      <p className="text-[10px] sm:text-xs mt-1">جميع المقررات مسجل بها</p>
                    </div>
                  ) : (
                    availableCourses.map((course) => {
                      const enrolled = enrollmentCountMap[course.code] || 0;
                      const capacity = SECTION_CAPACITY[course.code] || 40;
                      const isFull = enrolled >= capacity;
                      return (
                        <div key={course.id} className="relative">
                          <SortableCourseItem
                            course={course}
                            type="available"
                            capacityInfo={{ enrolled, capacity }}
                          />
                          {isFull && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 z-10"
                              onClick={() => addToWaitlist(course.code)}
                              disabled={waitlistedCodes.has(course.code)}
                            >
                              <ListOrdered className="w-3 h-3 ml-1" />
                              {waitlistedCodes.has(course.code) ? 'في الانتظار' : 'قائمة الانتظار'}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </SortableContext>
            </CardContent>
          </Card>

          {/* Registered Courses */}
          <Card className={isOverLimit ? 'border-red-300' : ''}>
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                المقررات المسجل بها
                <Badge variant="secondary" className="text-[10px] sm:text-xs mr-auto">
                  {registeredCourses.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 sm:pt-0">
              <SortableContext
                items={registeredIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[100px] max-h-96 overflow-y-auto">
                  {registeredCourses.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs sm:text-sm">لم تسجل في أي مقرر بعد</p>
                      <p className="text-[10px] sm:text-xs mt-1">
                        اسحب المقررات من القائمة المتاحة
                      </p>
                    </div>
                  ) : (
                    registeredCourses.map((course) => (
                      <SortableCourseItem
                        key={course.id}
                        course={course}
                        type="registered"
                        onDropCourse={handleDropCourse}
                      />
                    ))
                  )}
                </div>
              </SortableContext>

              {/* Total hours for registered */}
              {registeredCourses.length > 0 && (
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    إجمالي الساعات
                  </span>
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-800'
                    }`}
                  >
                    {totalHours} / {MAX_CREDIT_HOURS_PER_SEMESTER}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeCourse?.course ? (
            <DragOverlayItem course={activeCourse.course} type={activeCourse.type} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Waitlist Section */}
      {waitlist.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2 flex-row-reverse">
              <ListOrdered className="w-4 h-4 text-amber-600" />
              قائمة الانتظار
              <Badge className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs mr-auto">
                {waitlist.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2">
              {waitlist.map((entry) => {
                const course = courses.find((c) => c.code === entry.courseCode);
                return (
                  <div key={entry.id} className="flex items-center justify-between gap-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium truncate">{course?.name || entry.courseCode}</span>
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] font-mono shrink-0">
                          {entry.courseCode}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        تم الإضافة: {new Date(entry.addedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      onClick={() => removeFromWaitlist(entry.id)}
                    >
                      إزالة
                    </Button>
                  </div>
                );
              })}
            </div>
            <Alert className="mt-2 border-amber-200">
              <Info className="w-4 h-4 text-amber-600" />
              <AlertTitle className="text-amber-800 text-xs">معلومات</AlertTitle>
              <AlertDescription className="text-[10px] text-amber-700">
                ستتم إشعارك تلقائياً عندما يتوفر مقعد في المقررات الموجودة في قائمة الانتظار.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites Info */}
      {Object.keys(PREREQUISITES).some((code) =>
        courses.some((c) => c.code === code && c.semester === selectedSemester)
      ) && (
        <Card className="bg-slate-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 flex-row-reverse">
              <ShieldAlert className="w-4 h-4 text-violet-600" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">المتطلبات السابقة</h4>
            </div>
            <div className="space-y-1">
              {courses
                .filter((c) => c.semester === selectedSemester && PREREQUISITES[c.code])
                .map((c) => {
                  const completedPrereqs = PREREQUISITES[c.code].filter((prereq) =>
                    enrolledStudents.some(
                      (e) =>
                        e.studentId === CURRENT_STUDENT_ID &&
                        e.courseCode === prereq &&
                        e.grade &&
                        e.status === 'active'
                    )
                  );
                  const allMet = completedPrereqs.length === PREREQUISITES[c.code].length;
                  return (
                    <div key={c.code} className="flex items-center gap-2 text-[10px] sm:text-xs flex-row-reverse">
                      <span className={`font-mono ${allMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {c.code}
                      </span>
                      <span className="text-muted-foreground">يتطلب:</span>
                      {PREREQUISITES[c.code].map((p) => (
                        <Badge
                          key={p}
                          className={`text-[9px] sm:text-[10px] border-0 ${
                            completedPrereqs.includes(p)
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p} {completedPrereqs.includes(p) ? '✓' : '✗'}
                        </Badge>
                      ))}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info footer */}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
        يمكنك التسجيل في حتى {MAX_CREDIT_HOURS_PER_SEMESTER} ساعة معتمدة لكل فصل دراسي
      </p>

      {/* Registration Confirmation Dialog */}
      <RegistrationConfirmDialog
        open={confirmDialog}
        onOpenChange={setConfirmDialog}
        course={pendingCourse}
        totalHoursAfterAdd={pendingCourse ? totalHours + pendingCourse.hours : 0}
        prerequisiteWarnings={prerequisiteWarnings}
        onConfirm={handleConfirmRegistration}
        onCancel={handleCancelRegistration}
      />

      {/* Drop Confirmation Dialog */}
      <DropConfirmDialog
        open={dropDialog}
        onOpenChange={setDropDialog}
        course={dropCourse}
        onConfirm={confirmDrop}
      />
    </div>
  );
}
