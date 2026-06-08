'use client';

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Grid3x3,
  Filter,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { TeachingAssignment, CourseSection, DayOfWeek, SessionType } from "@/lib/store";
import {
  DAY_OF_WEEK_LABELS,
  SESSION_TYPE_LABELS,
  SESSION_TYPE_COLORS,
} from "@/lib/store";

const ARABIC_DAYS: DayOfWeek[] = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"];
const DAY_HEADER_LABELS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 17; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
}

// Session type block colors
const SESSION_BLOCK_COLORS: Record<SessionType, string> = {
  lecture: "bg-sky-100 border-sky-300 text-sky-900",
  lab: "bg-teal-100 border-teal-300 text-teal-900",
  tutorial: "bg-amber-100 border-amber-300 text-amber-900",
};

// Mock data
const mockAssignments: TeachingAssignment[] = [
  { id: "ta-1", professorName: "د. أحمد محمد الشريف", courseCode: "CS101", courseName: "مقدمة في علوم الحاسب", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "saturday", startTime: "08:00", endTime: "09:30", sessionType: "lecture", academicYear: "2024-2025", semester: 1, createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "ta-2", professorName: "د. أحمد محمد الشريف", courseCode: "CS101", courseName: "مقدمة في علوم الحاسب", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "tuesday", startTime: "08:00", endTime: "09:30", sessionType: "lecture", academicYear: "2024-2025", semester: 1, createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "ta-3", professorName: "د. أحمد محمد الشريف", courseCode: "CS102", courseName: "مبادئ البرمجة", section: 1, roomId: "room-2", roomName: "قاعة A102", day: "saturday", startTime: "10:00", endTime: "11:30", sessionType: "lecture", academicYear: "2024-2025", semester: 1, createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "ta-4", professorName: "د. أحمد محمد الشريف", courseCode: "CS201", courseName: "هياكل البيانات", section: 1, roomId: "room-3", roomName: "قاعة B201", day: "sunday", startTime: "08:00", endTime: "09:30", sessionType: "lecture", academicYear: "2024-2025", semester: 2, createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "ta-5", professorName: "د. أحمد محمد الشريف", courseCode: "CS201", courseName: "هياكل البيانات", section: 1, roomId: "room-3", roomName: "قاعة B201", day: "wednesday", startTime: "08:00", endTime: "09:30", sessionType: "lecture", academicYear: "2024-2025", semester: 2, createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "ta-6", professorName: "د. أحمد محمد الشريف", courseCode: "CS301", courseName: "تحليل الخوارزميات", section: 1, roomId: "room-3", roomName: "قاعة B201", day: "saturday", startTime: "12:00", endTime: "13:30", sessionType: "lecture", academicYear: "2024-2025", semester: 3, createdAt: "2024-09-01T00:00:00.000Z" },
  { id: "ta-7", professorName: "د. فاطمة علي الحسن", courseCode: "MATH101", courseName: "رياضيات متقدمة", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "sunday", startTime: "10:00", endTime: "11:30", sessionType: "lecture", academicYear: "2024-2025", semester: 1, createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "ta-8", professorName: "د. فاطمة علي الحسن", courseCode: "MATH101", courseName: "رياضيات متقدمة", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "tuesday", startTime: "10:00", endTime: "11:30", sessionType: "lecture", academicYear: "2024-2025", semester: 1, createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "ta-9", professorName: "د. فاطمة علي الحسن", courseCode: "CS202", courseName: "قواعد البيانات", section: 1, roomId: "room-4", roomName: "معمل 1", day: "monday", startTime: "08:00", endTime: "09:30", sessionType: "lecture", academicYear: "2024-2025", semester: 2, createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "ta-10", professorName: "د. فاطمة علي الحسن", courseCode: "CS202", courseName: "قواعد البيانات", section: 1, roomId: "room-4", roomName: "معمل 1", day: "thursday", startTime: "08:00", endTime: "09:30", sessionType: "lab", academicYear: "2024-2025", semester: 2, createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "ta-11", professorName: "د. فاطمة علي الحسن", courseCode: "CS305", courseName: "ذكاء اصطناعي", section: 1, roomId: "room-5", roomName: "قاعة C301", day: "monday", startTime: "10:00", endTime: "11:30", sessionType: "lecture", academicYear: "2024-2025", semester: 3, createdAt: "2024-09-01T00:00:00.000Z" },
  { id: "ta-12", professorName: "د. فاطمة علي الحسن", courseCode: "CS305", courseName: "ذكاء اصطناعي", section: 1, roomId: "room-5", roomName: "قاعة C301", day: "thursday", startTime: "10:00", endTime: "11:30", sessionType: "lecture", academicYear: "2024-2025", semester: 3, createdAt: "2024-09-01T00:00:00.000Z" },
  { id: "ta-13", professorName: "د. خالد عبدالله العمري", courseCode: "CS205", courseName: "شبكات الحاسب ١", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "sunday", startTime: "12:00", endTime: "13:30", sessionType: "lecture", academicYear: "2024-2025", semester: 2, createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "ta-14", professorName: "د. خالد عبدالله العمري", courseCode: "CS205", courseName: "شبكات الحاسب ١", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "wednesday", startTime: "12:00", endTime: "13:30", sessionType: "lecture", academicYear: "2024-2025", semester: 2, createdAt: "2024-08-20T00:00:00.000Z" },
  // Conflicting assignment in same room
  { id: "ta-15", professorName: "د. محمد الغامدي", courseCode: "CS401", courseName: "تعلم آلي", section: 1, roomId: "room-1", roomName: "قاعة A101", day: "sunday", startTime: "10:00", endTime: "11:30", sessionType: "lecture", academicYear: "2024-2025", semester: 2, createdAt: "2024-09-01T00:00:00.000Z" },
];

const mockSections: CourseSection[] = [
  { id: "sec-1", courseCode: "CS101", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomName: "قاعة A101", capacity: 40, enrolled: 35, scheduleDays: ["sat", "tue"], scheduleTime: "08:00-09:30", semester: 1, academicYear: "2024-2025", status: "open", createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "sec-2", courseCode: "CS102", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomName: "قاعة A102", capacity: 35, enrolled: 30, scheduleDays: ["sat"], scheduleTime: "10:00-11:30", semester: 1, academicYear: "2024-2025", status: "open", createdAt: "2024-08-15T00:00:00.000Z" },
  { id: "sec-3", courseCode: "CS201", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomName: "قاعة B201", capacity: 45, enrolled: 28, scheduleDays: ["sun", "wed"], scheduleTime: "08:00-09:30", semester: 2, academicYear: "2024-2025", status: "open", createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "sec-4", courseCode: "CS202", sectionNumber: 1, professorName: "د. فاطمة علي الحسن", roomName: "معمل 1", capacity: 30, enrolled: 18, scheduleDays: ["mon", "thu"], scheduleTime: "08:00-09:30", semester: 2, academicYear: "2024-2025", status: "open", createdAt: "2024-08-20T00:00:00.000Z" },
  { id: "sec-5", courseCode: "CS301", sectionNumber: 1, professorName: "د. أحمد محمد الشريف", roomName: "قاعة B201", capacity: 45, enrolled: 42, scheduleDays: ["sat"], scheduleTime: "12:00-13:30", semester: 3, academicYear: "2024-2025", status: "open", createdAt: "2024-09-01T00:00:00.000Z" },
  { id: "sec-6", courseCode: "CS305", sectionNumber: 1, professorName: "د. فاطمة علي الحسن", roomName: "قاعة C301", capacity: 35, enrolled: 33, scheduleDays: ["mon", "thu"], scheduleTime: "10:00-11:30", semester: 3, academicYear: "2024-2025", status: "open", createdAt: "2024-09-01T00:00:00.000Z" },
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getSlotIndex(startTime: string): number {
  const mins = timeToMinutes(startTime);
  const startMins = 8 * 60;
  return Math.floor((mins - startMins) / 60);
}

function getSlotSpan(startTime: string, endTime: string): number {
  return Math.max(1, Math.round((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60));
}

function findConflicts(assignments: TeachingAssignment[]): { day: DayOfWeek; time: string; assignments: TeachingAssignment[] }[] {
  const conflicts: { day: DayOfWeek; time: string; assignments: TeachingAssignment[] }[] = [];
  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const a = assignments[i];
      const b = assignments[j];
      if (a.day === b.day && a.roomId === b.roomId) {
        const overlap = a.startTime < b.endTime && b.startTime < a.endTime;
        if (overlap) {
          const conflictTime = a.startTime < b.startTime ? a.startTime : b.startTime;
          const existing = conflicts.find((c) => c.day === a.day && c.time === conflictTime);
          if (existing) {
            if (!existing.assignments.find((e) => e.id === a.id)) existing.assignments.push(a);
            if (!existing.assignments.find((e) => e.id === b.id)) existing.assignments.push(b);
          } else {
            conflicts.push({ day: a.day, time: conflictTime, assignments: [a, b] });
          }
        }
      }
    }
  }
  return conflicts;
}

export default function ScheduleView() {
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProfessor, setFilterProfessor] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [taRes, secRes] = await Promise.all([
        fetch("/api/teaching-assignments"),
        fetch("/api/course-sections"),
      ]);
      if (taRes.ok && secRes.ok) {
        setAssignments(await taRes.json());
        setSections(await secRes.json());
      } else {
        setAssignments(mockAssignments);
        setSections(mockSections);
      }
    } catch {
      setAssignments(mockAssignments);
      setSections(mockSections);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const professorOptions = [...new Set(assignments.map((a) => a.professorName))];
  const roomOptions = [...new Set(assignments.map((a) => a.roomName))];
  const semesterOptions = [...new Set(assignments.map((a) => a.semester))].sort();

  const filteredAssignments = assignments.filter((a) => {
    if (filterProfessor !== "all" && a.professorName !== filterProfessor) return false;
    if (filterRoom !== "all" && a.roomName !== filterRoom) return false;
    if (filterSemester !== "all" && a.semester !== Number(filterSemester)) return false;
    return true;
  });

  const conflicts = findConflicts(filteredAssignments);
  const conflictingIds = new Set(conflicts.flatMap((c) => c.assignments.map((a) => a.id)));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
          <Calendar className="w-5 h-5 text-emerald-600" />
          الجدول الأسبوعي الرئيسي
        </h2>
        {conflicts.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1 text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            {conflicts.length} تعارض
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-row-reverse">
              <Filter className="w-4 h-4" />
              <span>تصفية:</span>
            </div>
            <Select value={filterProfessor} onValueChange={setFilterProfessor}>
              <SelectTrigger className="w-36 text-xs"><SelectValue placeholder="الدكتور" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {professorOptions.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRoom} onValueChange={setFilterRoom}>
              <SelectTrigger className="w-28 text-xs"><SelectValue placeholder="القاعة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {roomOptions.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-24 text-xs"><SelectValue placeholder="الفصل" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {semesterOptions.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">الفصل {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-slate-800 text-white sticky top-0 z-10">
                <div className="p-2 text-center border-l border-slate-700">
                  <span className="text-[10px] sm:text-xs">الوقت</span>
                </div>
                {DAY_HEADER_LABELS.map((day, idx) => (
                  <div key={idx} className="p-2 text-center border-l border-slate-700">
                    <span className="text-xs sm:text-sm font-medium">{day}</span>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {TIME_SLOTS.map((time, slotIdx) => (
                <div key={slotIdx} className="grid grid-cols-7 border-b border-slate-100 min-h-[60px]">
                  {/* Time label */}
                  <div className="p-1.5 sm:p-2 border-l border-slate-200 bg-slate-50 flex items-start justify-center">
                    <div className="text-center">
                      <span className="text-[9px] sm:text-xs font-mono text-muted-foreground">
                        {time.replace(":00", "")}:00
                      </span>
                    </div>
                  </div>

                  {/* Day columns */}
                  {ARABIC_DAYS.map((day, dayIdx) => {
                    const slotsForDay = filteredAssignments.filter((a) => {
                      if (a.day !== day) return false;
                      const aSlotIdx = getSlotIndex(a.startTime);
                      const aSpan = getSlotSpan(a.startTime, a.endTime);
                      return aSlotIdx === slotIdx;
                    });

                    // Check if this cell is covered by a multi-slot assignment from a previous row
                    const coveredByPrevious = filteredAssignments.find((a) => {
                      if (a.day !== day) return false;
                      const aSlotIdx = getSlotIndex(a.startTime);
                      const aSpan = getSlotSpan(a.startTime, a.endTime);
                      return slotIdx > aSlotIdx && slotIdx < aSlotIdx + aSpan;
                    });

                    const isConflict = conflicts.some((c) => c.day === day && c.time === time);

                    return (
                      <div
                        key={dayIdx}
                        className={`p-0.5 border-l border-slate-100 relative ${
                          isConflict ? "bg-red-50" : ""
                        } ${coveredByPrevious ? "bg-slate-50/50" : ""}`}
                      >
                        {coveredByPrevious ? null : (
                          <div className="space-y-0.5">
                            {slotsForDay.map((assignment) => {
                              const span = getSlotSpan(assignment.startTime, assignment.endTime);
                              const isConflicting = conflictingIds.has(assignment.id);
                              const blockColor = SESSION_BLOCK_COLORS[assignment.sessionType];

                              return (
                                <div
                                  key={assignment.id}
                                  className={`rounded border p-1 sm:p-1.5 text-[8px] sm:text-[10px] leading-tight ${blockColor} ${
                                    isConflicting ? "ring-2 ring-red-400 border-red-300 bg-red-50" : ""
                                  }`}
                                  style={{
                                    minHeight: `${span * 60 - 8}px`,
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-0.5 mb-0.5">
                                    <span className="font-mono font-bold text-[8px] sm:text-[9px]">{assignment.courseCode}</span>
                                    <Badge className={`text-[7px] px-0.5 py-0 leading-none ${SESSION_TYPE_COLORS[assignment.sessionType]}`}>
                                      {SESSION_TYPE_LABELS[assignment.sessionType]}
                                    </Badge>
                                  </div>
                                  <p className="truncate font-medium">{assignment.courseName}</p>
                                  <p className="text-[7px] sm:text-[8px] opacity-75 truncate">{assignment.professorName}</p>
                                  <p className="text-[7px] sm:text-[8px] opacity-60 truncate flex items-center gap-0.5">
                                    <span>🏢</span>
                                    {assignment.roomName}
                                  </p>
                                  <p className="text-[7px] opacity-50 font-mono">
                                    {assignment.startTime}-{assignment.endTime}
                                  </p>
                                  {isConflicting && (
                                    <div className="flex items-center gap-0.5 text-red-600 mt-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      <span>تعارض!</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2 flex-row-reverse">
            <Grid3x3 className="w-4 h-4" />
            دليل أنواع الجلسات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap items-center gap-3">
            {(["lecture", "lab", "tutorial"] as SessionType[]).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded border ${SESSION_BLOCK_COLORS[type]}`} />
                <span className="text-xs text-muted-foreground">{SESSION_TYPE_LABELS[type]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border ring-2 ring-red-400 bg-red-50" />
              <span className="text-xs text-red-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                تعارض
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2 flex-row-reverse">
              <AlertTriangle className="w-4 h-4" />
              تنبيهات التعارضات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                  <p className="text-xs font-medium text-red-800 mb-1">
                    تعارض في يوم {DAY_OF_WEEK_LABELS[conflict.day]} الساعة {conflict.time}
                  </p>
                  <div className="space-y-1">
                    {conflict.assignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-[10px] text-red-700 flex-row-reverse">
                        <span className="font-mono font-bold">{a.courseCode}</span>
                        <span>شعبة {a.section}</span>
                        <span>|</span>
                        <span>{a.professorName}</span>
                        <span>|</span>
                        <span>{a.roomName}</span>
                        <span>|</span>
                        <span className="font-mono">{a.startTime}-{a.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">إجمالي المحاضرات</p>
            <p className="text-xl font-bold text-slate-800">{filteredAssignments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">الأساتذة</p>
            <p className="text-xl font-bold text-slate-800">{professorOptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">القاعات المستخدمة</p>
            <p className="text-xl font-bold text-slate-800">{roomOptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">التعارضات</p>
            <p className={`text-xl font-bold ${conflicts.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {conflicts.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
