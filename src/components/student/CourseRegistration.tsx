'use client';

import { useState, useMemo, useCallback } from 'react';
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
  BookOpen,
  Plus,
  Minus,
  Clock,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
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

// Current student (hardcoded since no auth)
const CURRENT_STUDENT_ID = 'ST-2024-001';
const CURRENT_STUDENT_NAME = 'عبدالرحمن محمد السالم';

interface DraggableCourse {
  id: string;
  code: string;
  name: string;
  hours: number;
}

// Sortable course item component
function SortableCourseItem({
  course,
  type,
}: {
  course: DraggableCourse;
  type: 'available' | 'registered';
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
        type === 'available'
          ? 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
          : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
      }`}
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
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5 flex-row-reverse">
            <Clock className="w-3 h-3" />
            {course.hours} ساعة
          </span>
        </div>
      </div>
      {type === 'available' ? (
        <div className="shrink-0 text-sky-500">
          <Plus className="w-4 h-4" />
        </div>
      ) : (
        <div className="shrink-0 text-emerald-500">
          <Minus className="w-4 h-4" />
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

export default function CourseRegistration() {
  const enrolledStudents = useEnrolledStudents();
  const courses = useCourses();
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      if (activeType === overType) return; // Same column, no action needed

      setIsLoading(true);
      try {
        if (activeType === 'available' && overType === 'registered') {
          // Register for course
          const course = availableCourses.find((c) => c.code === courseCode);
          if (course) {
            // Check credit hours limit
            const newHours = totalHours + course.hours;
            if (newHours > MAX_CREDIT_HOURS_PER_SEMESTER) {
              window.dispatchEvent(
                new CustomEvent('app-notification', {
                  detail: {
                    message: `لا يمكنك التسجيل - ستتجاوز الحد الأقصى (${MAX_CREDIT_HOURS_PER_SEMESTER} ساعة)`,
                    isError: true,
                  },
                })
              );
              setIsLoading(false);
              return;
            }
            await addEnrollment({
              studentId: CURRENT_STUDENT_ID,
              studentName: CURRENT_STUDENT_NAME,
              courseCode: course.code,
              semester: selectedSemester,
            });
          }
        } else if (activeType === 'registered' && overType === 'available') {
          // Unregister from course
          const enrollment = myEnrollments.find((e) => e.courseCode === courseCode);
          if (enrollment) {
            await deleteEnrollment(enrollment.id);
          }
        }
      } catch (err) {
        console.error('Drag registration error:', err);
      }
      setIsLoading(false);
    },
    [availableCourses, registeredCourses, totalHours, myEnrollments, selectedSemester]
  );

  // All draggable item IDs for sortable contexts
  const availableIds = availableCourses.map((c) => c.id);
  const registeredIds = registeredCourses.map((c) => c.id);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with semester selector */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800">التسجيل في المقررات</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                اسحب المقررات من القائمة المتاحة إلى المسجل بها
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
                    availableCourses.map((course) => (
                      <SortableCourseItem
                        key={course.id}
                        course={course}
                        type="available"
                      />
                    ))
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
                        اسحب المقررات من القائمة اليسرى
                      </p>
                    </div>
                  ) : (
                    registeredCourses.map((course) => (
                      <SortableCourseItem
                        key={course.id}
                        course={course}
                        type="registered"
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

      {/* Info footer */}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
        يمكنك التسجيل في حتى {MAX_CREDIT_HOURS_PER_SEMESTER} ساعة معتمدة لكل فصل دراسي
      </p>
    </div>
  );
}
