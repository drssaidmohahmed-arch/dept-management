'use client'

import { useSyncExternalStore, useCallback } from 'react'

// ============================================================
// Types
// ============================================================
export type Priority = 'urgent' | 'important' | 'normal'
export type TargetRole = 'all' | 'professors' | 'employees' | 'students'
export type UserRole = 'hod' | 'professor' | 'employee' | 'student'

export interface Announcement {
  id: string
  title: string
  content: string
  priority: Priority
  targetRole: TargetRole
  date: string
  authorName: string
}

export interface StudentRequest {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
  studentName: string
  type: string
}

export interface Course {
  id: string
  code: string
  name: string
  hours: number
  grade?: string
  semester: number
}

// ============================================================
// Priority Labels & Colors (single source of truth)
// ============================================================
export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'عاجل',
  important: 'مهم',
  normal: 'عادي',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-300',
  important: 'bg-amber-100 text-amber-800 border-amber-300',
  normal: 'bg-green-100 text-green-800 border-green-300',
}

export const TARGET_ROLE_LABELS: Record<TargetRole, string> = {
  all: 'الجميع',
  professors: 'أعضاء هيئة التدريس',
  employees: 'الموظفون الإداريون',
  students: 'الطلاب',
}

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
}

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

// ============================================================
// Mock Initial Data
// ============================================================
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'اجتماع القسم الأسبوعي',
    content: 'يُعقد اجتماع القسم الأسبوعي يوم الأحد القادم في الساعة العاشرة صباحاً في قاعة الاجتماعات الرئيسية. يُرجى الحضور والتسجيل في نظام الاجتماعات.',
    priority: 'important',
    targetRole: 'all',
    date: '2025-01-15',
    authorName: 'أ.د. محمد العلي',
  },
  {
    id: '2',
    title: 'تسجيل المقررات الدراسية',
    content: 'يبدأ تسجيل المقررات الدراسية للفصل الدراسي الثاني يوم الأحد ١٥ يناير وينتهي يوم الخميس ٢٠ يناير. يُرجى مراجعة الخطة الدراسية والتسجيل مبكراً.',
    priority: 'urgent',
    targetRole: 'students',
    date: '2025-01-14',
    authorName: 'أ.د. محمد العلي',
  },
  {
    id: '3',
    title: 'تحديث نظام الحضور',
    content: 'تم تحديث نظام تسجيل الحضور الإلكتروني. يُرجى من جميع أعضاء هيئة التدريس استخدام النظام الجديد بدءاً من الأسبوع القادم. يمكنكم التواصل مع قسم تكنولوجيا المعلومات للحصول على الدعم.',
    priority: 'important',
    targetRole: 'professors',
    date: '2025-01-13',
    authorName: 'أ.د. محمد العلي',
  },
  {
    id: '4',
    title: 'صيانة المبنى الرئيسي',
    content: 'سيتم إجراء أعمال صيانة في المبنى الرئيسي يوم الجمعة القادم. يُرجى إغلاق جميع المكاتب وإيقاف الأجهزة قبل المغادرة يوم الخميس.',
    priority: 'normal',
    targetRole: 'employees',
    date: '2025-01-12',
    authorName: 'أ.د. محمد العلي',
  },
  {
    id: '5',
    title: 'مواعيد الامتحانات النهائية',
    content: 'تم إعلان مواعيد الامتحانات النهائية للفصل الدراسي الأول. يمكنكم الاطلاع على الجدول الزمني عبر بوابة الطالب الإلكترونية.',
    priority: 'urgent',
    targetRole: 'students',
    date: '2025-01-11',
    authorName: 'أ.د. محمد العلي',
  },
  {
    id: '6',
    title: 'ورشة عمل في البحث العلمي',
    content: 'تُقيم الكلية ورشة عمل حول أساسيات البحث العلمي وكتابة الأبحاث الأكاديمية يوم الثلاثاء القادم. جميع أعضاء هيئة التدريس مدعوون للمشاركة.',
    priority: 'normal',
    targetRole: 'professors',
    date: '2025-01-10',
    authorName: 'أ.د. محمد العلي',
  },
]

const mockRequests: StudentRequest[] = [
  {
    id: 'req-1',
    title: 'طلب إضافة مقرر',
    description: 'أطلب إضافة مقرر البرمجة المتقدمة CS401 للفصل الدراسي الحالي',
    status: 'pending',
    date: '2025-01-14',
    studentName: 'أحمد محمد',
    type: 'إضافة مقرر',
  },
  {
    id: 'req-2',
    title: 'طلب إثبات حضور',
    description: 'أحتاج إثبات حضور لمقرر قواعد البيانات CS301',
    status: 'approved',
    date: '2025-01-12',
    studentName: 'سارة أحمد',
    type: 'إثبات حضور',
  },
  {
    id: 'req-3',
    title: 'طلب سحب مقرر',
    description: 'أطلب سحب مقرر الرياضيات المتقدمة MATH302',
    status: 'pending',
    date: '2025-01-10',
    studentName: 'خالد عبدالله',
    type: 'سحب مقرر',
  },
]

const mockCourses: Course[] = [
  // Semester 1
  { id: 'c1', code: 'CS101', name: 'مقدمة في الحاسب الآلي', hours: 3, grade: 'A', semester: 1 },
  { id: 'c2', code: 'MATH101', name: 'الرياضيات العامة', hours: 3, grade: 'B+', semester: 1 },
  { id: 'c3', code: 'PHYS101', name: 'الفيزياء للكمبيوتر', hours: 3, grade: 'A-', semester: 1 },
  { id: 'c4', code: 'ENG101', name: 'اللغة الإنجليزية ١', hours: 2, grade: 'A', semester: 1 },
  { id: 'c5', code: 'ARAB101', name: 'مهارات الاتصال', hours: 2, grade: 'A+', semester: 1 },
  { id: 'c6', code: 'STAT101', name: 'الإحصاء الوصفي', hours: 3, grade: 'B+', semester: 1 },
  { id: 'c7', code: 'IS101', name: 'مبادئ أنظمة المعلومات', hours: 3, grade: 'A', semester: 1 },
  { id: 'c8', code: 'TECH101', name: 'تقنية المعلومات', hours: 2, grade: 'A-', semester: 1 },
  // Semester 2
  { id: 'c9', code: 'CS102', name: 'برمجة الحاسب', hours: 4, grade: 'A', semester: 2 },
  { id: 'c10', code: 'MATH102', name: 'التفاضل والتكامل', hours: 3, grade: 'B+', semester: 2 },
  { id: 'c11', code: 'PHYS102', name: 'الفيزياء المتقدمة', hours: 3, grade: 'A-', semester: 2 },
  { id: 'c12', code: 'ENG102', name: 'اللغة الإنجليزية ٢', hours: 2, grade: 'A', semester: 2 },
  { id: 'c13', code: 'CS103', name: 'هياكل البيانات', hours: 3, grade: 'A+', semester: 2 },
  { id: 'c14', code: 'MATH201', name: 'الجبر الخطي', hours: 3, grade: 'B', semester: 2 },
  { id: 'c15', code: 'NET101', name: 'مبادئ الشبكات', hours: 3, grade: 'A', semester: 2 },
  { id: 'c16', code: 'WEB101', name: 'تطوير الويب', hours: 3, grade: 'A-', semester: 2 },
  // Semester 3
  { id: 'c17', code: 'CS201', name: ' البرمجة الكائنية', hours: 3, grade: 'A', semester: 3 },
  { id: 'c18', code: 'CS202', name: 'قواعد البيانات', hours: 3, grade: 'A+', semester: 3 },
  { id: 'c19', code: 'CS203', name: 'تصميم الخوارزميات', hours: 3, grade: 'B+', semester: 3 },
  { id: 'c20', code: 'MATH301', name: 'الاحتمالات والإحصاء', hours: 3, grade: 'A-', semester: 3 },
  { id: 'c21', code: 'OS101', name: 'أنظمة التشغيل', hours: 3, grade: 'A', semester: 3 },
  { id: 'c22', code: 'SE101', name: 'هندسة البرمجيات', hours: 3, grade: 'B+', semester: 3 },
  { id: 'c23', code: 'NET201', name: 'أمن الشبكات', hours: 3, grade: 'A', semester: 3 },
  { id: 'c24', code: 'CS204', name: 'الذكاء الاصطناعي', hours: 3, grade: 'A+', semester: 3 },
  // Semester 4
  { id: 'c25', code: 'CS301', name: 'قواعد البيانات المتقدمة', hours: 3, grade: 'A', semester: 4 },
  { id: 'c26', code: 'CS302', name: 'برمجة الويب المتقدمة', hours: 3, grade: 'A-', semester: 4 },
  { id: 'c27', code: 'CS303', name: 'هياكل البيانات المتقدمة', hours: 3, grade: 'B+', semester: 4 },
  { id: 'c28', code: 'CS304', name: 'معالجة الصور', hours: 3, grade: 'A', semester: 4 },
  { id: 'c29', code: 'SE201', name: 'إدارة المشاريع', hours: 3, grade: 'A+', semester: 4 },
  { id: 'c30', code: 'MATH302', name: 'الرياضيات المنفصلة', hours: 3, grade: 'A', semester: 4 },
  { id: 'c31', code: 'NET301', name: 'شبكات الحاسب', hours: 3, grade: 'B+', semester: 4 },
  { id: 'c32', code: 'CS305', name: 'تطبيقات الذكاء الاصطناعي', hours: 3, grade: 'A-', semester: 4 },
  // Semester 5
  { id: 'c33', code: 'CS401', name: 'البرمجة المتقدمة', hours: 3, grade: 'A', semester: 5 },
  { id: 'c34', code: 'CS402', name: 'نظم المعلومات الجغرافية', hours: 3, grade: 'A+', semester: 5 },
  { id: 'c35', code: 'CS403', name: 'الحوسبة السحابية', hours: 3, grade: 'A', semester: 5 },
  { id: 'c36', code: 'SE301', name: 'اختبار البرمجيات', hours: 3, grade: 'B+', semester: 5 },
  { id: 'c37', code: 'CS404', name: 'تعلم الآلة', hours: 3, grade: 'A-', semester: 5 },
  { id: 'c38', code: 'CS405', name: 'معالجة اللغة الطبيعية', hours: 3, grade: 'A', semester: 5 },
  { id: 'c39', code: 'MATH401', name: 'التحليل العددي', hours: 3, grade: 'A+', semester: 5 },
  { id: 'c40', code: 'CS406', name: 'رؤية الحاسب', hours: 3, grade: 'A', semester: 5 },
  // Semester 6
  { id: 'c41', code: 'CS501', name: 'مشروع التخرج', hours: 4, grade: '', semester: 6 },
  { id: 'c42', code: 'CS502', name: 'الأخلاقيات المهنية', hours: 2, grade: '', semester: 6 },
  { id: 'c43', code: 'CS503', name: 'أمن المعلومات', hours: 3, grade: '', semester: 6 },
  { id: 'c44', code: 'SE401', name: 'هندسة المتطلبات', hours: 3, grade: '', semester: 6 },
  { id: 'c45', code: 'CS504', name: 'حوسبة عالية الأداء', hours: 3, grade: '', semester: 6 },
  { id: 'c46', code: 'CS505', name: 'تطبيقات البيانات الضخمة', hours: 3, grade: '', semester: 6 },
  { id: 'c47', code: 'CS506', name: 'الأتمتة الذكية', hours: 3, grade: '', semester: 6 },
  { id: 'c48', code: 'CS507', name: 'تدريب عملي', hours: 3, grade: '', semester: 6 },
]

// ============================================================
// Singleton Store using useSyncExternalStore pattern
// ============================================================
let announcements: Announcement[] = [...mockAnnouncements]
let studentRequests: StudentRequest[] = [...mockRequests]
let courses: Course[] = [...mockCourses]
const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getAnnouncementsSnapshot() {
  return announcements
}

function getRequestsSnapshot() {
  return studentRequests
}

function getCoursesSnapshot() {
  return courses
}

// ============================================================
// Actions
// ============================================================
export function addAnnouncement(announcement: Omit<Announcement, 'id'>) {
  const newAnnouncement: Announcement = {
    ...announcement,
    id: Date.now().toString(),
  }
  announcements = [newAnnouncement, ...announcements]
  emitChange()
}

export function deleteAnnouncement(id: string) {
  announcements = announcements.filter(a => a.id !== id)
  emitChange()
}

export function addStudentRequest(request: Omit<StudentRequest, 'id'>) {
  const newRequest: StudentRequest = {
    ...request,
    id: Date.now().toString(),
  }
  studentRequests = [newRequest, ...studentRequests]
  emitChange()
}

export function getAnnouncementsForRole(role: 'professor' | 'employee' | 'student'): Announcement[] {
  return announcements.filter(
    a => a.targetRole === 'all' || a.targetRole === (role === 'professor' ? 'professors' : role === 'employee' ? 'employees' : 'students')
  )
}

export function getStats() {
  return {
    totalAnnouncements: announcements.length,
    urgentCount: announcements.filter(a => a.priority === 'urgent').length,
    importantCount: announcements.filter(a => a.priority === 'important').length,
    normalCount: announcements.filter(a => a.priority === 'normal').length,
    professorAnnouncements: getAnnouncementsForRole('professor').length,
    employeeAnnouncements: getAnnouncementsForRole('employee').length,
    studentAnnouncements: getAnnouncementsForRole('student').length,
    totalRequests: studentRequests.length,
    pendingRequests: studentRequests.filter(r => r.status === 'pending').length,
    totalCourses: courses.length,
    totalHours: courses.reduce((acc, c) => acc + c.hours, 0),
  }
}

// ============================================================
// React Hooks (using useSyncExternalStore - NOT useReducer+useEffect)
// ============================================================
export function useAnnouncements() {
  return useSyncExternalStore(subscribe, getAnnouncementsSnapshot)
}

export function useStudentRequests() {
  return useSyncExternalStore(subscribe, getRequestsSnapshot)
}

export function useCourses() {
  return useSyncExternalStore(subscribe, getCoursesSnapshot)
}

export function useStore() {
  const allAnnouncements = useAnnouncements()
  const requests = useStudentRequests()
  const courseList = useCourses()
  const stats = getStats()

  return {
    announcements: allAnnouncements,
    requests,
    courses: courseList,
    stats,
    addAnnouncement,
    deleteAnnouncement,
    addStudentRequest,
    getAnnouncementsForRole,
  }
}

// Generate a simple unique ID
let idCounter = 100
export function generateId() {
  return (++idCounter).toString()
}
