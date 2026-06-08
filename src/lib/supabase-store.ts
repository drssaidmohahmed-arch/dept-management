'use client';

import { useSyncExternalStore, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

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

// Module-level caches: table name → mapped data array (pre-initialized for all tables)
const tableCache: Record<string, unknown[]> = {
  announcements: EMPTY_ARRAY,
  student_requests: EMPTY_ARRAY,
  members: EMPTY_ARRAY,
  professor_requests: EMPTY_ARRAY,
  professor_courses: EMPTY_ARRAY,
  enrolled_students: EMPTY_ARRAY,
  courses: EMPTY_ARRAY,
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
  if (!sb) return;
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
    tableCache[tableName] = EMPTY_ARRAY;
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

// ============ Stats ============

export async function getStats() {
  const sb = getSupabase();
  if (!sb) {
    return { ...EMPTY_STATS };
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
