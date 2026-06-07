import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";

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

// ============ Permission Types ============

export type PermissionKey =
  | "manage_announcements"
  | "manage_courses"
  | "manage_requests"
  | "view_reports"
  | "manage_schedules"
  | "manage_exams"
  | "export_data"
  | "manage_users";

export interface DepartmentMember {
  id: string;
  name: string;
  email: string;
  role: "professor" | "employee";
  position: string;
  avatar: string;
  isActive: boolean;
  permissions: PermissionKey[];
  joinedAt: string;
}

export const PERMISSION_LABELS: Record<PermissionKey, { label: string; description: string; icon: string }> = {
  manage_announcements: {
    label: "إدارة الإعلانات",
    description: "إنشاء وتعديل وحذف الإعلانات",
    icon: "megaphone",
  },
  manage_courses: {
    label: "إدارة المقررات",
    description: "إضافة وتعديل وحذف المقررات الدراسية",
    icon: "book",
  },
  manage_requests: {
    label: "إدارة الطلبات",
    description: "قبول ورفض ومتابعة طلبات الطلاب",
    icon: "clipboard",
  },
  view_reports: {
    label: "عرض التقارير",
    description: "الاطلاع على التقارير والإحصائيات",
    icon: "chart",
  },
  manage_schedules: {
    label: "إدارة الجداول",
    description: "تعديل الجداول الأسبوعية والمحاضرات",
    icon: "calendar",
  },
  manage_exams: {
    label: "إدارة الامتحانات",
    description: "إعداد وجدولة الامتحانات والدرجات",
    icon: "exam",
  },
  export_data: {
    label: "تصدير البيانات",
    description: "تصدير التقارير والسجلات بصيغ مختلفة",
    icon: "download",
  },
  manage_users: {
    label: "إدارة المستخدمين",
    description: "إضافة وتعديل بيانات المستخدمين",
    icon: "users",
  },
};

export const ALL_PERMISSIONS: PermissionKey[] = [
  "manage_announcements",
  "manage_courses",
  "manage_requests",
  "view_reports",
  "manage_schedules",
  "manage_exams",
  "export_data",
  "manage_users",
];

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  professor: "عضو هيئة تدريس",
  employee: "موظف إداري",
};

export const MEMBER_ROLE_COLORS: Record<string, string> = {
  professor: "bg-sky-100 text-sky-800",
  employee: "bg-cyan-100 text-cyan-800",
};

export interface StoreState {
  announcements: Announcement[];
  studentRequests: StudentRequest[];
  courses: Course[];
  members: DepartmentMember[];
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

const initialMembers: DepartmentMember[] = [
  {
    id: "mem-1",
    name: "د. أحمد محمد الشريف",
    email: "ahmed.sharif@univ.edu",
    role: "professor",
    position: "أستاذ مشارك",
    avatar: "أ",
    isActive: true,
    permissions: ["manage_announcements", "manage_courses", "manage_schedules", "manage_exams", "view_reports"],
    joinedAt: "2018-09-01T00:00:00.000Z",
  },
  {
    id: "mem-2",
    name: "د. فاطمة علي الحسن",
    email: "fatima.hasan@univ.edu",
    role: "professor",
    position: "أستاذ مساعد",
    avatar: "ف",
    isActive: true,
    permissions: ["manage_courses", "manage_exams", "view_reports"],
    joinedAt: "2020-01-15T00:00:00.000Z",
  },
  {
    id: "mem-3",
    name: "د. خالد عبدالله العمري",
    email: "khaled.omari@univ.edu",
    role: "professor",
    position: "محاضر",
    avatar: "خ",
    isActive: true,
    permissions: ["manage_courses", "manage_schedules", "view_reports"],
    joinedAt: "2021-09-01T00:00:00.000Z",
  },
  {
    id: "mem-4",
    name: "أ. سارة محمود زايد",
    email: "sara.zayed@univ.edu",
    role: "employee",
    position: "مسؤول شؤون الطلاب",
    avatar: "س",
    isActive: true,
    permissions: ["manage_requests", "export_data", "view_reports"],
    joinedAt: "2019-03-10T00:00:00.000Z",
  },
  {
    id: "mem-5",
    name: "أ. عمر حسن الدوسري",
    email: "omar.dosari@univ.edu",
    role: "employee",
    position: "مسؤول الشؤون الأكاديمية",
    avatar: "ع",
    isActive: true,
    permissions: ["manage_courses", "manage_schedules", "export_data", "view_reports"],
    joinedAt: "2017-08-20T00:00:00.000Z",
  },
  {
    id: "mem-6",
    name: "أ. نورة سعد القحطاني",
    email: "noura.qahtani@univ.edu",
    role: "employee",
    position: "سكرتير القسم",
    avatar: "ن",
    isActive: true,
    permissions: ["manage_announcements", "export_data"],
    joinedAt: "2022-01-05T00:00:00.000Z",
  },
  {
    id: "mem-7",
    name: "د. محمد فيصل الغامدي",
    email: "mohammed.ghamdi@univ.edu",
    role: "professor",
    position: "أستاذ",
    avatar: "م",
    isActive: false,
    permissions: ["manage_announcements", "manage_courses", "manage_exams", "manage_users", "view_reports", "export_data"],
    joinedAt: "2015-01-01T00:00:00.000Z",
  },
  {
    id: "mem-8",
    name: "أ. هند عبدالرحمن السبيعي",
    email: "hind.subaie@univ.edu",
    role: "employee",
    position: "مسؤول الامتحانات",
    avatar: "هـ",
    isActive: true,
    permissions: ["manage_exams", "manage_schedules", "view_reports"],
    joinedAt: "2023-06-15T00:00:00.000Z",
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
  members: initialMembers,
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

// ============ Member Actions ============

export function updateMemberPermissions(memberId: string, permissions: PermissionKey[]) {
  state = {
    ...state,
    members: state.members.map((m) =>
      m.id === memberId ? { ...m, permissions } : m
    ),
  };
  emitChange();
}

export function toggleMemberPermission(memberId: string, permission: PermissionKey) {
  state = {
    ...state,
    members: state.members.map((m) => {
      if (m.id !== memberId) return m;
      const hasPermission = m.permissions.includes(permission);
      return {
        ...m,
        permissions: hasPermission
          ? m.permissions.filter((p) => p !== permission)
          : [...m.permissions, permission],
      };
    }),
  };
  emitChange();
}

export function toggleMemberStatus(memberId: string) {
  state = {
    ...state,
    members: state.members.map((m) =>
      m.id === memberId ? { ...m, isActive: !m.isActive } : m
    ),
  };
  emitChange();
}

export function addMember(member: Omit<DepartmentMember, "id" | "joinedAt">) {
  const newMember: DepartmentMember = {
    ...member,
    id: `mem-${nextId++}`,
    joinedAt: new Date().toISOString(),
  };
  state = {
    ...state,
    members: [newMember, ...state.members],
  };
  emitChange();
}

export function deleteMember(memberId: string) {
  state = {
    ...state,
    members: state.members.filter((m) => m.id !== memberId),
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
  const activeProfessors = state.members.filter((m) => m.role === "professor" && m.isActive).length;
  const activeEmployees = state.members.filter((m) => m.role === "employee" && m.isActive).length;
  return {
    totalAnnouncements: state.announcements.length,
    professors: activeProfessors,
    employees: activeEmployees,
    students: 156,
    totalRequests: state.studentRequests.length,
    averageGPA: 3.67,
    totalMembers: state.members.length,
    activeMembers: state.members.filter((m) => m.isActive).length,
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

  return useSyncExternalStore(
    subscribeFn,
    getSnapshot
  );
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
 * Returns members array - stable reference until data changes.
 */
export function useMembers(): DepartmentMember[] {
  const subscribeFn = useCallback(subscribe, []);

  const members = useSyncExternalStore(
    subscribeFn,
    () => state.members
  );

  return members;
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

  return useSyncExternalStore(
    subscribeFn,
    () => getStats()
  );
}
