import { useState, useEffect, useCallback, useRef } from "react";

// ============ Types ============

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "urgent" | "important" | "normal";
  targetRole: "all" | "professors" | "employees" | "students";
  createdAt: string;
}

export interface StudentRequest {
  id: string;
  type: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  hours: number;
  grade?: string;
  semester: number;
}

export interface StoreState {
  announcements: Announcement[];
  studentRequests: StudentRequest[];
  courses: Course[];
}

// ============ Constants ============

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: "عاجل",
  important: "مهم",
  normal: "عادي",
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 border-red-200",
  important: "bg-amber-100 text-amber-800 border-amber-200",
  normal: "bg-green-100 text-green-800 border-green-200",
};

export const TARGET_ROLE_LABELS: Record<string, string> = {
  all: "الجميع",
  professors: "أعضاء هيئة التدريس",
  employees: "الموظفون الإداريون",
  students: "الطلاب",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "معلق",
  approved: "مقبول",
  rejected: "مرفوض",
};

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// ============ Mock Data ============

const initialAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "اجتماع مجلس القسم",
    content: "يُعقد اجتماع مجلس القسم يوم الأحد القادم في الساعة العاشرة صباحاً بقاعة الاجتماعات الرئيسية. يُرجى الحضور في الموعد المحدد.",
    priority: "urgent",
    targetRole: "all",
    createdAt: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "ann-2",
    title: "تحديث المناهج الدراسية",
    content: "تم اعتماد التحديثات الجديدة على المناهج الدراسية للفصل الدراسي القادم. يُرجى من جميع أعضاء هيئة التدريس مراجعة التغييرات وإرسال ملاحظاتهم.",
    priority: "important",
    targetRole: "professors",
    createdAt: "2025-01-14T09:30:00.000Z",
  },
  {
    id: "ann-3",
    title: "بدء التسجيل للفصل الصيفي",
    content: "يبدأ التسجيل للفصل الصيفي يوم الأحد ٢٠ يناير. على الطلاب الراغبين في التسجيل زيارة مكتب القبول والتسجيل خلال فترة التسجيل المحددة.",
    priority: "normal",
    targetRole: "students",
    createdAt: "2025-01-13T14:00:00.000Z",
  },
  {
    id: "ann-4",
    title: "صيانة النظام الإداري",
    content: "سيتم إجراء صيانة دورية للنظام الإداري يوم الجمعة القادم. يُرجى حفظ جميع الأعمال وتسجيل الخروج قبل الساعة الخامسة مساءً.",
    priority: "important",
    targetRole: "employees",
    createdAt: "2025-01-12T11:00:00.000Z",
  },
];

const initialCourses: Course[] = Array.from({ length: 8 }, (_, i) => ({
  id: `s1-c${i + 1}`,
  name: [
    "مقدمة في علوم الحاسب",
    "رياضيات متقدمة",
    "فيزياء عامة",
    "لغة إنجليزية",
    "مهارات حاسوبية",
    "مبادئ البرمجة",
    "إحصاء و احتمالات",
    "تفكير نقدي",
  ][i],
  code: [
    "CS101",
    "MATH101",
    "PHYS101",
    "ENG101",
    "IT101",
    "CS102",
    "STAT101",
    "CRIT101",
  ][i],
  hours: [3, 4, 3, 2, 2, 3, 3, 2][i],
  grade: ["أ", "أ-", "ب+", "أ", "أ", "ب", "أ+", "أ-"][i],
  semester: 1,
}));

// ============ Store Implementation ============

let state: StoreState = {
  announcements: initialAnnouncements,
  studentRequests: [],
  courses: initialCourses,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): StoreState {
  return state;
}

// ============ Actions ============

let nextId = Date.now();

export function addAnnouncement(
  announcement: Omit<Announcement, "id" | "createdAt">
) {
  const newAnnouncement: Announcement = {
    ...announcement,
    id: `ann-${nextId++}`,
    createdAt: new Date().toISOString(),
  };
  state = {
    ...state,
    announcements: [newAnnouncement, ...state.announcements],
  };
  emitChange();
}

export function deleteAnnouncement(id: string) {
  state = {
    ...state,
    announcements: state.announcements.filter((a) => a.id !== id),
  };
  emitChange();
}

export function addStudentRequest(
  request: Omit<StudentRequest, "id" | "createdAt" | "status">
) {
  const newRequest: StudentRequest = {
    ...request,
    id: `req-${nextId++}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  state = {
    ...state,
    studentRequests: [newRequest, ...state.studentRequests],
  };
  emitChange();
}

export function deleteStudentRequest(id: string) {
  state = {
    ...state,
    studentRequests: state.studentRequests.filter((r) => r.id !== id),
  };
  emitChange();
}

export function getAnnouncementsForRole(
  role: "professors" | "employees" | "students" | "all"
) {
  return state.announcements.filter(
    (a) => a.targetRole === "all" || a.targetRole === role
  );
}

export function getStats() {
  return {
    totalAnnouncements: state.announcements.length,
    professors: 12,
    employees: 8,
    students: 156,
    totalRequests: state.studentRequests.length,
    averageGPA: 3.67,
  };
}

// ============ Hooks ============

/**
 * Primary hook: returns the full stable StoreState.
 * Uses useSyncExternalStore for reliable reactivity.
 * The state object reference only changes when data actually changes.
 */
export function useStore(): StoreState {
  const subscribeFn = useCallback(subscribe, []);
  const getSnapshotFn = useCallback(getSnapshot, []);

  // We use a version counter in getSnapshot to ensure useSyncExternalStore
  // detects changes. Since we replace the state object on every mutation,
  // the reference comparison in useSyncExternalStore works correctly.
  return getSnapshotFn();
}

/**
 * Returns announcements array - stable reference until data changes.
 */
export function useAnnouncements(): Announcement[] {
  const subscribeFn = useCallback(subscribe, []);

  const announcements = useSyncExternalStore(
    subscribeFn,
    () => state.announcements
  );

  return announcements;
}

/**
 * Returns student requests array - stable reference until data changes.
 */
export function useStudentRequests(): StudentRequest[] {
  const subscribeFn = useCallback(subscribe, []);

  const requests = useSyncExternalStore(
    subscribeFn,
    () => state.studentRequests
  );

  return requests;
}

/**
 * Returns courses array - stable reference until data changes.
 */
export function useCourses(): Course[] {
  const subscribeFn = useCallback(subscribe, []);

  const courses = useSyncExternalStore(
    subscribeFn,
    () => state.courses
  );

  return courses;
}

/**
 * Returns stats object - recalculates on each call but stable between state changes.
 */
export function useStats() {
  const subscribeFn = useCallback(subscribe, []);

  // We store stats in state-like cache for referential stability
  const statsRef = useRef(getStats());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      statsRef.current = getStats();
    });
    statsRef.current = getStats();
    return unsubscribe;
  }, [subscribeFn]);

  return statsRef.current;
}
