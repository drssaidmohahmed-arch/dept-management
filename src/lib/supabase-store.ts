'use client';

import { useSyncExternalStore, useCallback } from 'react';
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

// Module-level caches: table name → mapped data array
const tableCache: Record<string, unknown[]> = {};

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

  // If no data cached yet, trigger initial fetch
  if (tableCache[tableName] === undefined) {
    fetchTableData(tableName);
  }

  return () => {
    tableListeners[tableName]?.delete(listener);
  };
}

function getTableSnapshot<T>(tableName: string): T[] {
  return (tableCache[tableName] as T[]) ?? [];
}

async function fetchTableData(tableName: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb.from(tableName).select('*');

  if (!error && data) {
    tableCache[tableName] = data;
    emitTableChange(tableName);
  }
}

function setupRealtimeSubscription(tableName: string) {
  const sb = getSupabase();
  if (!sb) return;
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
    return {
      totalAnnouncements: 0,
      professors: 0,
      employees: 0,
      students: 156,
      totalRequests: 0,
      averageGPA: 3.67,
      totalMembers: 0,
      activeMembers: 0,
    };
  }
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

  return {
    totalAnnouncements: announcementsRes.count || 0,
    professors: activeProfessors,
    employees: activeEmployees,
    students: 156,
    totalRequests: requestsRes.count || 0,
    averageGPA: 3.67,
    totalMembers: members.length,
    activeMembers: members.filter(
      (m: Record<string, unknown>) => m.is_active === true
    ).length,
  };
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
    () =>
      statsCache ?? {
        totalAnnouncements: 0,
        professors: 0,
        employees: 0,
        students: 156,
        totalRequests: 0,
        averageGPA: 3.67,
        totalMembers: 0,
        activeMembers: 0,
      }
  );
}

async function fetchStats() {
  const stats = await getStats();
  statsCache = stats;
  emitStatsChange();
}

// ============ Announcement Actions ============

export async function addAnnouncement(
  announcement: Omit<Announcement, 'id' | 'createdAt'>
) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('announcements').insert({
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority,
    target_role: announcement.targetRole,
  });
  if (error) console.error('Error adding announcement:', error);
}

export async function deleteAnnouncement(id: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('announcements').delete().eq('id', id);
  if (error) console.error('Error deleting announcement:', error);
}

// ============ Student Request Actions ============

export async function addStudentRequest(
  request: Omit<StudentRequest, 'id' | 'createdAt' | 'status'>
) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('student_requests').insert({
    type: request.type,
    description: request.description,
    status: 'pending',
  });
  if (error) console.error('Error adding student request:', error);
}

export async function deleteStudentRequest(id: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from('student_requests')
    .delete()
    .eq('id', id);
  if (error) console.error('Error deleting student request:', error);
}

// ============ Professor Request Actions ============

export async function addProfessorRequest(
  request: Omit<ProfessorRequest, 'id' | 'createdAt' | 'status'>
) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('professor_requests').insert({
    category: request.category,
    target: request.target,
    target_student_id: request.targetStudentId ?? null,
    target_student_name: request.targetStudentName ?? null,
    subject: request.subject,
    description: request.description,
    priority: request.priority,
    status: 'pending',
    response: null,
  });
  if (error) console.error('Error adding professor request:', error);
}

export async function updateProfessorRequestStatus(
  requestId: string,
  status: ProfessorRequestStatus,
  response?: string
) {
  const sb = getSupabase();
  if (!sb) return;
  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (response !== undefined) {
    updatePayload.response = response;
  }

  const { error } = await sb
    .from('professor_requests')
    .update(updatePayload)
    .eq('id', requestId);
  if (error) console.error('Error updating professor request status:', error);
}

export async function deleteProfessorRequest(id: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from('professor_requests')
    .delete()
    .eq('id', id);
  if (error) console.error('Error deleting professor request:', error);
}

// ============ Member Actions ============

export async function addMember(
  member: Omit<DepartmentMember, 'id' | 'joinedAt'>
) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('members').insert({
    name: member.name,
    email: member.email,
    role: member.role,
    position: member.position,
    avatar: member.avatar,
    is_active: member.isActive,
    permissions: member.permissions,
  });
  if (error) console.error('Error adding member:', error);
}

export async function deleteMember(memberId: string) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from('members').delete().eq('id', memberId);
  if (error) console.error('Error deleting member:', error);
}

export async function toggleMemberPermission(
  memberId: string,
  permission: PermissionKey
) {
  const sb = getSupabase();
  if (!sb) return;

  // First fetch current member permissions
  const { data: member, error: fetchError } = await sb
    .from('members')
    .select('permissions')
    .eq('id', memberId)
    .single();

  if (fetchError) {
    console.error('Error fetching member permissions:', fetchError);
    return;
  }

  const currentPermissions: PermissionKey[] =
    (member?.permissions as PermissionKey[]) || [];
  const hasPermission = currentPermissions.includes(permission);
  const updatedPermissions = hasPermission
    ? currentPermissions.filter((p) => p !== permission)
    : [...currentPermissions, permission];

  const { error } = await sb
    .from('members')
    .update({ permissions: updatedPermissions })
    .eq('id', memberId);

  if (error) console.error('Error toggling member permission:', error);
}

export async function toggleMemberStatus(memberId: string) {
  const sb = getSupabase();
  if (!sb) return;

  // First fetch current member status
  const { data: member, error: fetchError } = await sb
    .from('members')
    .select('is_active')
    .eq('id', memberId)
    .single();

  if (fetchError) {
    console.error('Error fetching member status:', fetchError);
    return;
  }

  const { error } = await sb
    .from('members')
    .update({ is_active: !member?.is_active })
    .eq('id', memberId);

  if (error) console.error('Error toggling member status:', error);
}

export async function updateMemberPermissions(
  memberId: string,
  permissions: PermissionKey[]
) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from('members')
    .update({ permissions })
    .eq('id', memberId);

  if (error) console.error('Error updating member permissions:', error);
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
