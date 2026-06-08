'use client';

import { useSyncExternalStore, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  announcementsStore,
  studentRequestsStore,
  membersStore,
  professorRequestsStore,
  professorCoursesStore,
  enrolledStudentsStore,
  coursesStore,
  employeeTransfersStore,
} from '@/lib/local-data';

// ============ Re-export ALL types, constants, labels, colors from the original store ============

export type {
  Announcement,
  StudentRequest,
  Course,
  PermissionKey,
  DepartmentMember,
  ProfessorRequest,
  ProfessorRequestTarget,
  ProfessorRequestCategory,
  ProfessorRequestStatus,
  EnrolledStudent,
  ProfessorCourse,
  EmployeeTransfer,
  TransferStatus,
  StoreState,
} from './store';

export {
  PERMISSION_LABELS,
  ALL_PERMISSIONS,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_COLORS,
  PROF_REQ_CATEGORY_LABELS,
  PROF_REQ_CATEGORY_COLORS,
  PROF_REQ_TARGET_LABELS,
  PROF_REQ_TARGET_COLORS,
  PROF_REQ_STATUS_LABELS,
  PROF_REQ_STATUS_COLORS,
  SEMESTER_NAMES,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  GRADE_TO_POINTS,
  GRADE_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  MAX_CREDIT_HOURS_PER_SEMESTER,
  REGISTRATION_SEMESTER,
  TRANSFER_STATUS_LABELS,
  TRANSFER_STATUS_COLORS,
  ACADEMIC_RANK_OPTIONS,
} from './store';

// Import types for local use (these are already re-exported above)
import type {
  Announcement,
  StudentRequest,
  Course,
  PermissionKey,
  DepartmentMember,
  ProfessorRequest,
  ProfessorRequestStatus,
  EnrolledStudent,
  ProfessorCourse,
} from './store';

// ============ Supabase Client ============

let _supabase: SupabaseClient<any, string, any> | null = null;

function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key && url.startsWith('http')) {
      _supabase = createClient();
    }
  }
  return _supabase;
}

// ============ External Store Infrastructure ============

// Stable empty array to prevent infinite re-renders with useSyncExternalStore
const EMPTY_ARRAY: unknown[] = [];

// Stable empty stats object to prevent infinite re-renders
const EMPTY_STATS = {
  totalAnnouncements: 0,
  professors: 0,
  employees: 0,
  students: 0,
  totalRequests: 0,
  averageGPA: 0,
  totalMembers: 0,
  activeMembers: 0,
};

// Module-level caches: table name → mapped data array (pre-initialized with local data)
// When Supabase is null/unavailable, we fall back to local mock data.
const localDataMap: Record<string, unknown[]> = {
  announcements: announcementsStore.getAll(),
  student_requests: studentRequestsStore.getAll(),
  members: membersStore.getAll(),
  professor_requests: professorRequestsStore.getAll(),
  professor_courses: professorCoursesStore.getAll(),
  enrolled_students: enrolledStudentsStore.getAll(),
  courses: coursesStore.getAll(),
  employee_transfers: employeeTransfersStore.getAll(),
};

const tableCache: Record<string, unknown[]> = {
  announcements: localDataMap.announcements,
  student_requests: localDataMap.student_requests,
  members: localDataMap.members,
  professor_requests: localDataMap.professor_requests,
  professor_courses: localDataMap.professor_courses,
  enrolled_students: localDataMap.enrolled_students,
  courses: localDataMap.courses,
  employee_transfers: localDataMap.employee_transfers,
};

// Module-level listener sets: table name → set of callbacks
const tableListeners: Record<string, Set<() => void>> = {};

// Stats cache
let statsCache: {
  totalAnnouncements: number;
  professors: number;
  employees: number;
  students: number;
  totalRequests: number;
  averageGPA: number;
  totalMembers: number;
  activeMembers: number;
} | null = null;

const statsListeners = new Set<() => void>();

// Track which tables have been fetched to avoid duplicate fetches
const fetchedTables = new Set<string>();

function emitTableChange(tableName: string) {
  const listeners = tableListeners[tableName];
  if (listeners) {
    listeners.forEach((listener) => listener());
  }
}

function emitStatsChange() {
  statsListeners.forEach((listener) => listener());
}

function subscribeToTable(
  tableName: string,
  listener: () => void
): () => void {
  if (!tableListeners[tableName]) {
    tableListeners[tableName] = new Set();
  }
  tableListeners[tableName].add(listener);

  // If no data fetched yet, trigger initial fetch
  if (!fetchedTables.has(tableName)) {
    fetchedTables.add(tableName);
    fetchTableData(tableName);
  }

  return () => {
    tableListeners[tableName]?.delete(listener);
  };
}

function getTableSnapshot<T>(tableName: string): T[] {
  return (tableCache[tableName] ?? EMPTY_ARRAY) as T[];
}

async function fetchTableData(tableName: string) {
  const sb = getSupabase();
  if (!sb) {
    // Supabase not available — keep the local mock data already set in tableCache
    return;
  }
  try {
    const { data, error } = await sb.from(tableName).select('*');

    if (!error && data) {
      tableCache[tableName] = data;
    } else if (!error && !data) {
      tableCache[tableName] = EMPTY_ARRAY;
    }
    emitTableChange(tableName);
  } catch (err) {
    console.error(`Error fetching ${tableName}:`, err);
    // On error, fall back to local mock data instead of empty array
    tableCache[tableName] = localDataMap[tableName] ?? EMPTY_ARRAY;
    emitTableChange(tableName);
  }
}

function setupRealtimeSubscription(tableName: string) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    sb
      .channel(`${tableName}-realtime`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => {
          fetchTableData(tableName);
        }
      )
      .subscribe();
  } catch (err) {
    console.error(`Error setting up realtime for ${tableName}:`, err);
  }
}

// Set up realtime subscriptions for all tables on module load
const SUPABASE_TABLES = [
  'announcements',
  'student_requests',
  'members',
  'professor_requests',
  'professor_courses',
  'enrolled_students',
  'courses',
  'employee_transfers',
];

for (const table of SUPABASE_TABLES) {
  setupRealtimeSubscription(table);
}

// ============ Row Mappers (DB columns → TypeScript interface fields) ============

function mapAnnouncementRow(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    priority: row.priority as Announcement['priority'],
    targetRole: row.target_role as Announcement['targetRole'],
    createdAt: row.created_at as string,
  };
}

function mapStudentRequestRow(row: Record<string, unknown>): StudentRequest {
  return {
    id: row.id as string,
    type: row.type as string,
    description: row.description as string,
    status: row.status as StudentRequest['status'],
    createdAt: row.created_at as string,
  };
}

function mapMemberRow(row: Record<string, unknown>): DepartmentMember {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as DepartmentMember['role'],
    position: row.position as string,
    avatar: row.avatar as string,
    isActive: row.is_active as boolean,
    permissions: (row.permissions as PermissionKey[]) || [],
    joinedAt: row.joined_at as string,
  };
}

function mapProfessorRequestRow(row: Record<string, unknown>): ProfessorRequest {
  return {
    id: row.id as string,
    category: row.category as ProfessorRequest['category'],
    target: row.target as ProfessorRequest['target'],
    targetStudentId: row.target_student_id as string | undefined,
    targetStudentName: row.target_student_name as string | undefined,
    subject: row.subject as string,
    description: row.description as string,
    priority: row.priority as ProfessorRequest['priority'],
    status: row.status as ProfessorRequest['status'],
    response: row.response as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
  };
}

function mapProfessorCourseRow(row: Record<string, unknown>): ProfessorCourse {
  return {
    code: (row.course_code as string) || '',
    name: (row.name as string) || '',
    hours: (row.hours as number) || 0,
    semester: row.semester as number,
    professorName: (row.professor_name as string) || '',
    enrolledCount: (row.enrolled_count as number) || 0,
  };
}

function mapEnrolledStudentRow(row: Record<string, unknown>): EnrolledStudent {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    name: (row.student_name as string) || '',
    courseCode: row.course_code as string,
    semester: row.semester as number,
    grade: row.grade as string | undefined,
    midTermMark: row.mid_term_mark as number | undefined,
    finalMark: row.final_mark as number | undefined,
    assignmentsMark: row.assignments_mark as number | undefined,
    attendance: row.attendance as number,
    status: row.status as EnrolledStudent['status'],
  };
}

function mapCourseRow(row: Record<string, unknown>): Course {
  return {
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    hours: row.hours as number,
    grade: row.grade as string | undefined,
    semester: row.semester as number,
  };
}

function mapTransferRow(row: Record<string, unknown>): import('./store').EmployeeTransfer {
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    employeeName: row.employee_name as string,
    currentPosition: row.current_position as string,
    requestedRank: row.requested_rank as string,
    requestedSpecialization: row.requested_specialization as string,
    requestedQualification: row.requested_qualification as string,
    coursesToTeach: (row.courses_to_teach as string[]) || [],
    reason: row.reason as string,
    supportingDocs: (row.supporting_docs as string[]) || [],
    status: row.status as import('./store').EmployeeTransfer['status'],
    reviewedBy: row.reviewed_by as string | undefined,
    reviewedByName: row.reviewed_by_name as string | undefined,
    reviewNotes: row.review_notes as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
  };
}

// ============ Data Fetching Hooks ============

export function useAnnouncements(): Announcement[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('announcements', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('announcements')
  );

  return raw.map(mapAnnouncementRow);
}

export function useStudentRequests(): StudentRequest[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('student_requests', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('student_requests')
  );

  return raw.map(mapStudentRequestRow);
}

export function useMembers(): DepartmentMember[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('members', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('members')
  );

  return raw.map(mapMemberRow);
}

export function useProfessorRequests(): ProfessorRequest[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('professor_requests', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('professor_requests')
  );

  return raw.map(mapProfessorRequestRow);
}

export function useProfessorCourses(): ProfessorCourse[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('professor_courses', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('professor_courses')
  );

  return raw.map(mapProfessorCourseRow);
}

export function useEnrolledStudents(): EnrolledStudent[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('enrolled_students', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('enrolled_students')
  );

  return raw.map(mapEnrolledStudentRow);
}

export function useCourses(): Course[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('courses', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('courses')
  );

  return raw.map(mapCourseRow);
}

export function useTransfers(): import('./store').EmployeeTransfer[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribeToTable('employee_transfers', listener),
    []
  );

  const raw = useSyncExternalStore(
    subscribeFn,
    () => getTableSnapshot<Record<string, unknown>>('employee_transfers')
  );

  return raw.map(mapTransferRow);
}

// ============ Stats ============

export async function getStats() {
  const sb = getSupabase();
  if (!sb) {
    // Return stats from local mock data
    const allMembers = membersStore.getAll();
    const allEnrolled = enrolledStudentsStore.getAll();
    const allRequests = studentRequestsStore.getAll();
    const activeProfessors = allMembers.filter((m: any) => m.role === 'professor' && m.isActive === true).length;
    const activeEmployees = allMembers.filter((m: any) => m.role === 'employee' && m.isActive === true).length;
    const uniqueStudents = new Set(allEnrolled.map((e: any) => e.studentId));
    const gradeToPoints: Record<string, number> = {
      'أ+': 4.0, 'أ': 4.0, 'أ-': 3.7,
      'ب+': 3.3, 'ب': 3.0, 'ب-': 2.7,
      'ج+': 2.3, 'ج': 2.0, 'ج-': 1.7,
      'د+': 1.3, 'د': 1.0, 'د-': 0.7, 'ر': 0.0,
    };
    const graded = allEnrolled.filter((e: any) => e.grade);
    const totalPoints = graded.reduce((sum: number, e: any) => sum + (gradeToPoints[e.grade] || 0), 0);
    const averageGPA = graded.length > 0 ? Math.round((totalPoints / graded.length) * 100) / 100 : 0;
    return {
      totalAnnouncements: announcementsStore.getAll().length,
      professors: activeProfessors,
      employees: activeEmployees,
      students: uniqueStudents.size,
      totalRequests: allRequests.length,
      averageGPA,
      totalMembers: allMembers.length,
      activeMembers: allMembers.filter((m: any) => m.isActive === true).length,
    };
  }
  try {
    const [announcementsRes, membersRes, requestsRes] = await Promise.all([
      sb.from('announcements').select('id', { count: 'exact', head: true }),
      sb.from('members').select('*'),
      sb.from('student_requests').select('id', { count: 'exact', head: true }),
    ]);

    const members = membersRes.data || [];
    const activeProfessors = members.filter(
      (m: Record<string, unknown>) => m.role === 'professor' && m.is_active === true
    ).length;
    const activeEmployees = members.filter(
      (m: Record<string, unknown>) => m.role === 'employee' && m.is_active === true
    ).length;

    // Count unique students from enrolled_students table
    const enrolledRes = await sb
      .from('enrolled_students')
      .select('student_id', { head: true })
      .neq('student_id', null);

    // Calculate average GPA from enrolled students with grades
    const gradedRes = await sb
      .from('enrolled_students')
      .select('grade')
      .not('grade', 'is', null);

    const gradeToPoints: Record<string, number> = {
      'أ+': 4.0, 'أ': 4.0, 'أ-': 3.7,
      'ب+': 3.3, 'ب': 3.0, 'ب-': 2.7,
      'ج+': 2.3, 'ج': 2.0, 'ج-': 1.7,
      'د+': 1.3, 'د': 1.0, 'د-': 0.7,
      'ر': 0.0,
    };

    const gradedStudents = gradedRes.data || [];
    const totalPoints = gradedStudents.reduce(
      (sum: number, row: Record<string, unknown>) =>
        sum + (gradeToPoints[String(row.grade)] || 0),
      0
    );
    const averageGPA = gradedStudents.length > 0
      ? Math.round((totalPoints / gradedStudents.length) * 100) / 100
      : 0;

    // Get unique student count from enrolled_students
    const studentSet = new Set(
      (enrolledRes.data || []).map((r: Record<string, unknown>) => String(r.student_id))
    );

    return {
      totalAnnouncements: announcementsRes.count || 0,
      professors: activeProfessors,
      employees: activeEmployees,
      students: studentSet.size,
      totalRequests: requestsRes.count || 0,
      averageGPA,
      totalMembers: members.length,
      activeMembers: members.filter(
        (m: Record<string, unknown>) => m.is_active === true
      ).length,
    };
  } catch (err) {
    console.error('Error fetching stats:', err);
    return { ...EMPTY_STATS };
  }
}

export function useStats() {
  const subscribeFn = useCallback(
    (listener: () => void) => {
      statsListeners.add(listener);

      // If no stats cached yet, trigger initial fetch
      if (!statsCache) {
        fetchStats();
      }

      // Subscribe to table changes that affect stats
      const tableSubs = [
        subscribeToTable('announcements', listener),
        subscribeToTable('members', listener),
        subscribeToTable('student_requests', listener),
      ];

      return () => {
        statsListeners.delete(listener);
        tableSubs.forEach((unsubscribe) => unsubscribe());
      };
    },
    []
  );

  return useSyncExternalStore(
    subscribeFn,
    () => statsCache ?? EMPTY_STATS
  );
}

async function fetchStats() {
  const stats = await getStats();
  statsCache = stats;
  emitStatsChange();
}

// ============ Toast Notification Helper ============

function showNotification(message: string, isError: boolean = false) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app-notification', {
      detail: { message, isError }
    });
    window.dispatchEvent(event);
  }
}

// ============ API Route Helper ============
// All write operations (insert/update/delete) go through API routes
// for reliability. Read operations use the client-side Supabase
// for realtime subscription support.

async function apiCall(path: string, options?: RequestInit): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { ok: false, error: errBody.error || `خطأ في الخادم (${res.status})` };
    }
    const data = await res.json().catch(() => null);
    return { ok: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل الاتصال بالخادم';
    console.error(`API call failed [${path}]:`, err);
    return { ok: false, error: message };
  }
}

// ============ Announcement Actions ============

export async function addAnnouncement(
  announcement: Omit<Announcement, 'id' | 'createdAt'>
) {
  const result = await apiCall('/api/announcements', {
    method: 'POST',
    body: JSON.stringify({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetRole: announcement.targetRole,
    }),
  });
  if (!result.ok) {
    console.error('Error adding announcement:', result.error);
    showNotification('حدث خطأ أثناء إضافة الإعلان', true);
  } else {
    showNotification('تم نشر الإعلان بنجاح');
  }
}

export async function deleteAnnouncement(id: string) {
  const result = await apiCall('/api/announcements', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
  if (!result.ok) {
    console.error('Error deleting announcement:', result.error);
    showNotification('حدث خطأ أثناء حذف الإعلان', true);
  } else {
    showNotification('تم حذف الإعلان بنجاح');
  }
}

// ============ Student Request Actions ============

export async function addStudentRequest(
  request: Omit<StudentRequest, 'id' | 'createdAt' | 'status'>
) {
  const result = await apiCall('/api/student-requests', {
    method: 'POST',
    body: JSON.stringify({
      type: request.type,
      description: request.description,
    }),
  });
  if (!result.ok) {
    console.error('Error adding student request:', result.error);
    showNotification('حدث خطأ أثناء تقديم الطلب', true);
  } else {
    showNotification('تم تقديم الطلب بنجاح');
  }
}

export async function updateStudentRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected' | 'pending',
  response?: string
) {
  const updatePayload: Record<string, unknown> = {
    id: requestId,
    status,
  };
  if (response !== undefined) {
    updatePayload.response = response;
  }

  const result = await apiCall('/api/student-requests', {
    method: 'PUT',
    body: JSON.stringify(updatePayload),
  });
  if (!result.ok) {
    console.error('Error updating student request status:', result.error);
    showNotification('حدث خطأ أثناء تحديث حالة الطلب', true);
  } else {
    const statusMsg = status === 'approved' ? 'تم قبول طلب الطالب' : status === 'rejected' ? 'تم رفض طلب الطالب' : 'تم تحديث حالة الطلب';
    showNotification(statusMsg);
  }
  return result;
}

export async function deleteStudentRequest(id: string) {
  const result = await apiCall('/api/student-requests', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
  if (!result.ok) {
    console.error('Error deleting student request:', result.error);
    showNotification('حدث خطأ أثناء حذف الطلب', true);
  } else {
    showNotification('تم حذف الطلب بنجاح');
  }
}

// ============ Professor Request Actions ============

export async function addProfessorRequest(
  request: Omit<ProfessorRequest, 'id' | 'createdAt' | 'status'>
) {
  const result = await apiCall('/api/professor-requests', {
    method: 'POST',
    body: JSON.stringify({
      category: request.category,
      target: request.target,
      target_student_id: request.targetStudentId ?? null,
      target_student_name: request.targetStudentName ?? null,
      subject: request.subject,
      description: request.description,
      priority: request.priority,
    }),
  });
  if (!result.ok) {
    console.error('Error adding professor request:', result.error);
    showNotification('حدث خطأ أثناء تقديم الطلب', true);
  } else {
    showNotification('تم تقديم الطلب بنجاح');
  }
}

export async function updateProfessorRequestStatus(
  requestId: string,
  status: ProfessorRequestStatus,
  response?: string
) {
  const updatePayload: Record<string, unknown> = {
    id: requestId,
    status,
  };
  if (response !== undefined) {
    updatePayload.response = response;
  }

  const result = await apiCall('/api/professor-requests', {
    method: 'PUT',
    body: JSON.stringify(updatePayload),
  });
  if (!result.ok) {
    console.error('Error updating professor request status:', result.error);
    showNotification('حدث خطأ أثناء تحديث حالة الطلب', true);
  } else {
    showNotification('تم تحديث حالة الطلب بنجاح');
  }
}

export async function deleteProfessorRequest(id: string) {
  const result = await apiCall('/api/professor-requests', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
  if (!result.ok) {
    console.error('Error deleting professor request:', result.error);
    showNotification('حدث خطأ أثناء حذف الطلب', true);
  } else {
    showNotification('تم حذف الطلب بنجاح');
  }
}

// ============ Member Actions ============

export async function addMember(
  member: Omit<DepartmentMember, 'id' | 'joinedAt'>
) {
  const result = await apiCall('/api/members', {
    method: 'POST',
    body: JSON.stringify({
      name: member.name,
      email: member.email,
      role: member.role,
      position: member.position,
      avatar: member.avatar,
      is_active: member.isActive,
      permissions: member.permissions,
    }),
  });
  if (!result.ok) {
    console.error('Error adding member:', result.error);
    showNotification('حدث خطأ أثناء إضافة العضو', true);
  } else {
    showNotification('تم إضافة العضو بنجاح');
  }
}

export async function deleteMember(memberId: string) {
  const result = await apiCall('/api/members', {
    method: 'DELETE',
    body: JSON.stringify({ id: memberId }),
  });
  if (!result.ok) {
    console.error('Error deleting member:', result.error);
    showNotification('حدث خطأ أثناء حذف العضو', true);
  } else {
    showNotification('تم حذف العضو بنجاح');
  }
}

export async function toggleMemberPermission(
  memberId: string,
  permission: PermissionKey
) {
  // First fetch current member permissions via API
  const fetchResult = await apiCall(`/api/members?role=&status=&search=`);
  if (!fetchResult.ok) {
    console.error('Error fetching member permissions:', fetchResult.error);
    return;
  }

  const member = (fetchResult.data || []).find(
    (m: any) => m.id === memberId
  );
  const currentPermissions: PermissionKey[] =
    (member?.permissions as PermissionKey[]) || [];
  const hasPermission = currentPermissions.includes(permission);
  const updatedPermissions = hasPermission
    ? currentPermissions.filter((p) => p !== permission)
    : [...currentPermissions, permission];

  const result = await apiCall('/api/members', {
    method: 'PUT',
    body: JSON.stringify({ id: memberId, permissions: updatedPermissions }),
  });

  if (!result.ok) {
    console.error('Error toggling member permission:', result.error);
  }
}

export async function toggleMemberStatus(memberId: string) {
  // First fetch current member status via API
  const fetchResult = await apiCall(`/api/members?role=&status=&search=`);
  if (!fetchResult.ok) {
    console.error('Error fetching member status:', fetchResult.error);
    return;
  }

  const member = (fetchResult.data || []).find(
    (m: any) => m.id === memberId
  );

  const result = await apiCall('/api/members', {
    method: 'PUT',
    body: JSON.stringify({ id: memberId, is_active: !member?.is_active }),
  });

  if (!result.ok) {
    console.error('Error toggling member status:', result.error);
  }
}

export async function updateMemberPermissions(
  memberId: string,
  permissions: PermissionKey[]
) {
  const result = await apiCall('/api/members', {
    method: 'PUT',
    body: JSON.stringify({ id: memberId, permissions }),
  });

  if (!result.ok) {
    console.error('Error updating member permissions:', result.error);
  }
}

// ============ Utility Functions ============

export function getAnnouncementsForRole(
  role: 'professors' | 'employees' | 'students' | 'all'
): Announcement[] {
  const raw = getTableSnapshot<Record<string, unknown>>('announcements');
  return raw
    .map(mapAnnouncementRow)
    .filter(
      (a) => a.targetRole === 'all' || a.targetRole === role
    );
}

// ============ Enrollment Actions ============

export async function addEnrollment(enrollment: {
  studentId: string;
  studentName: string;
  courseCode: string;
  semester: number;
  status?: string;
}) {
  const result = await apiCall('/api/enrolled-students', {
    method: 'POST',
    body: JSON.stringify({
      student_id: enrollment.studentId,
      student_name: enrollment.studentName,
      course_code: enrollment.courseCode,
      semester: enrollment.semester,
      status: enrollment.status || 'active',
    }),
  });
  if (!result.ok) {
    console.error('Error adding enrollment:', result.error);
    showNotification('حدث خطأ أثناء التسجيل في المقرر', true);
  } else {
    showNotification('تم التسجيل في المقرر بنجاح');
  }
  return result;
}

export async function updateEnrollmentGrade(
  id: string,
  updates: {
    grade?: string;
    midTermMark?: number;
    finalMark?: number;
    assignmentsMark?: number;
    attendance?: number;
    status?: string;
  }
) {
  const body: Record<string, unknown> = { id };
  if (updates.grade !== undefined) body.grade = updates.grade;
  if (updates.midTermMark !== undefined) body.mid_term_mark = updates.midTermMark;
  if (updates.finalMark !== undefined) body.final_mark = updates.finalMark;
  if (updates.assignmentsMark !== undefined) body.assignments_mark = updates.assignmentsMark;
  if (updates.attendance !== undefined) body.attendance = updates.attendance;
  if (updates.status !== undefined) body.status = updates.status;

  const result = await apiCall('/api/enrolled-students', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!result.ok) {
    console.error('Error updating enrollment:', result.error);
    showNotification('حدث خطأ أثناء تحديث البيانات', true);
  } else {
    showNotification('تم تحديث البيانات بنجاح');
  }
  return result;
}

export async function deleteEnrollment(id: string) {
  const result = await apiCall('/api/enrolled-students', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
  if (!result.ok) {
    console.error('Error deleting enrollment:', result.error);
    showNotification('حدث خطأ أثناء إلغاء التسجيل', true);
  } else {
    showNotification('تم إلغاء التسجيل من المقرر بنجاح');
  }
  return result;
}

// ============ Employee Transfer Actions ============

export async function addTransferRequest(transfer: {
  employee_id: string;
  employee_name: string;
  current_position: string;
  requested_rank: string;
  requested_specialization: string;
  requested_qualification: string;
  courses_to_teach: string[];
  reason: string;
}) {
  const result = await apiCall('/api/employee-transfers', {
    method: 'POST',
    body: JSON.stringify(transfer),
  });
  if (!result.ok) {
    console.error('Error adding transfer request:', result.error);
    showNotification('حدث خطأ أثناء تقديم طلب التحويل', true);
  } else {
    showNotification('تم تقديم طلب التحويل بنجاح');
  }
  return result;
}

export async function updateTransferStatus(
  transferId: string,
  status: string,
  reviewedByName?: string,
  reviewNotes?: string
) {
  const body: Record<string, unknown> = {
    id: transferId,
    status,
  };
  if (reviewedByName !== undefined) body.reviewed_by_name = reviewedByName;
  if (reviewNotes !== undefined) body.review_notes = reviewNotes;

  const result = await apiCall('/api/employee-transfers', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!result.ok) {
    console.error('Error updating transfer status:', result.error);
    showNotification('حدث خطأ أثناء تحديث حالة الطلب', true);
  } else {
    const statusMsg = status === 'approved' ? 'تم قبول طلب التحويل وتحديث بيانات العضو' : status === 'rejected' ? 'تم رفض طلب التحويل' : 'تم تحديث حالة الطلب';
    showNotification(statusMsg);
  }
  return result;
}

export async function cancelTransfer(transferId: string) {
  const result = await apiCall('/api/employee-transfers', {
    method: 'PUT',
    body: JSON.stringify({ id: transferId, status: 'cancelled' }),
  });
  if (!result.ok) {
    console.error('Error cancelling transfer:', result.error);
    showNotification('حدث خطأ أثناء إلغاء الطلب', true);
  } else {
    showNotification('تم إلغاء طلب التحويل');
  }
  return result;
}
