import { useCallback, useSyncExternalStore } from "react";

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

// ============ Professor Request Types ============

export type ProfessorRequestTarget = "department" | "student";
export type ProfessorRequestCategory =
  | "academic"
  | "administrative"
  | "technical"
  | "schedule_change"
  | "grade_review"
  | "other";
export type ProfessorRequestStatus = "pending" | "approved" | "rejected" | "in_progress";

export interface ProfessorRequest {
  id: string;
  category: ProfessorRequestCategory;
  target: ProfessorRequestTarget;
  targetStudentId?: string;
  targetStudentName?: string;
  subject: string;
  description: string;
  priority: "urgent" | "important" | "normal";
  status: ProfessorRequestStatus;
  response?: string;
  createdAt: string;
  updatedAt?: string;
}

export const PROF_REQ_CATEGORY_LABELS: Record<ProfessorRequestCategory, string> = {
  academic: "أكاديمي",
  administrative: "إداري",
  technical: "تقني",
  schedule_change: "تعديل جدول",
  grade_review: "مراجعة درجات",
  other: "أخرى",
};

export const PROF_REQ_CATEGORY_COLORS: Record<ProfessorRequestCategory, string> = {
  academic: "bg-sky-100 text-sky-800",
  administrative: "bg-cyan-100 text-cyan-800",
  technical: "bg-violet-100 text-violet-800",
  schedule_change: "bg-amber-100 text-amber-800",
  grade_review: "bg-emerald-100 text-emerald-800",
  other: "bg-slate-100 text-slate-800",
};

export const PROF_REQ_TARGET_LABELS: Record<ProfessorRequestTarget, string> = {
  department: "موجه للقسم",
  student: "موجه لطالب",
};

export const PROF_REQ_TARGET_COLORS: Record<ProfessorRequestTarget, string> = {
  department: "bg-indigo-100 text-indigo-800",
  student: "bg-orange-100 text-orange-800",
};

export const PROF_REQ_STATUS_LABELS: Record<ProfessorRequestStatus, string> = {
  pending: "قيد الانتظار",
  approved: "مقبول",
  rejected: "مرفوض",
  in_progress: "قيد المعالجة",
};

export const PROF_REQ_STATUS_COLORS: Record<ProfessorRequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
};

// ============ Student Enrollment Types ============

export interface EnrolledStudent {
  id: string;
  studentId: string;
  name: string;
  courseCode: string;
  semester: number;
  grade?: string;
  midTermMark?: number;
  finalMark?: number;
  assignmentsMark?: number;
  attendance: number; // percentage 0-100
  status: "active" | "withdrawn" | "incomplete";
}

export interface ProfessorCourse {
  code: string;
  name: string;
  hours: number;
  semester: number;
  professorName: string;
  enrolledCount: number;
}

export const SEMESTER_NAMES: Record<number, string> = {
  1: "الفصل الأول",
  2: "الفصل الثاني",
  3: "الفصل الثالث",
  4: "الفصل الرابع",
  5: "الفصل الخامس",
  6: "الفصل السادس",
};

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  withdrawn: "منسحب",
  incomplete: "غير مكتمل",
};

export const STUDENT_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  withdrawn: "bg-red-100 text-red-800",
  incomplete: "bg-amber-100 text-amber-800",
};

export const GRADE_TO_POINTS: Record<string, number> = {
  "أ+": 4.0,
  "أ": 4.0,
  "أ-": 3.7,
  "ب+": 3.3,
  "ب": 3.0,
  "ب-": 2.7,
  "ج+": 2.3,
  "ج": 2.0,
  "ج-": 1.7,
  "د+": 1.3,
  "د": 1.0,
  "د-": 0.7,
  "ر": 0.0,
};

export const GRADE_COLORS: Record<string, string> = {
  "أ+": "text-emerald-600 font-bold",
  "أ": "text-emerald-600 font-bold",
  "أ-": "text-emerald-500 font-semibold",
  "ب+": "text-sky-600 font-semibold",
  "ب": "text-sky-500 font-semibold",
  "ب-": "text-sky-400",
  "ج+": "text-amber-600",
  "ج": "text-amber-500",
  "ج-": "text-amber-400",
  "د+": "text-orange-600",
  "د": "text-orange-500",
  "ر": "text-red-600 font-bold",
};

// ============ New Module Types ============

export type StudentStatus = 'active' | 'probation' | 'withdrawn' | 'graduated' | 'suspended';
export type AcademicRank = 'professor' | 'associate_professor' | 'assistant_professor' | 'lecturer' | 'teaching_assistant';
export type RoomType = 'lecture_hall' | 'lab' | 'meeting_room' | 'office' | 'tutorial';
export type SessionType = 'lecture' | 'lab' | 'tutorial';
export type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';
export type EvaluationType = 'student_feedback' | 'peer_review' | 'self_assessment' | 'chairman_review';
export type DevActivityType = 'conference' | 'workshop' | 'training_course' | 'seminar' | 'certification';
export type DevStatus = 'planned' | 'completed' | 'cancelled';
export type AdvisingType = 'academic_plan' | 'academic_warning' | 'course_guidance' | 'career_advice' | 'general';
export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'failed';
export type ProjectType = 'research' | 'software' | 'system' | 'theoretical';
export type ProjectStatus = 'proposed' | 'approved' | 'in_progress' | 'submitted' | 'defended' | 'passed' | 'failed';
export type PlanStatus = 'active' | 'draft' | 'archived';
export type CourseType = 'required' | 'elective' | 'university_requirement' | 'college_requirement';
export type DescriptionStatus = 'draft' | 'approved' | 'archived';
export type SectionStatus = 'open' | 'closed' | 'full';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email?: string;
  phone?: string;
  level: number;
  major: string;
  gpa: number;
  cumulativeHours: number;
  status: StudentStatus;
  advisorName?: string;
  enrollmentYear: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FacultyProfile {
  id: string;
  memberId: string;
  specialization?: string;
  rank: AcademicRank;
  qualification?: string;
  grantingUniversity?: string;
  bio: string;
  researchInterests: string[];
  hireDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  equipment: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TeachingAssignment {
  id: string;
  professorId?: string;
  professorName: string;
  courseCode: string;
  courseName: string;
  section: number;
  roomId?: string;
  roomName: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  academicYear: string;
  semester: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PerformanceEvaluation {
  id: string;
  facultyId?: string;
  facultyName: string;
  evaluationType: EvaluationType;
  academicYear: string;
  semester: number;
  teachingScore: number;
  researchScore: number;
  serviceScore: number;
  overallScore: number;
  comments: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfessionalDevelopment {
  id: string;
  facultyId?: string;
  facultyName: string;
  title: string;
  activityType: DevActivityType;
  provider: string;
  location: string;
  startDate?: string;
  endDate?: string;
  hours: number;
  status: DevStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AdvisingSession {
  id: string;
  studentId: string;
  studentName: string;
  advisorId?: string;
  advisorName: string;
  sessionDate: string;
  sessionType: AdvisingType;
  notes: string;
  actionItems: string[];
  followUpDate?: string;
  createdAt: string;
}

export interface FieldTraining {
  id: string;
  studentId: string;
  studentName: string;
  organizationName: string;
  supervisorName: string;
  supervisorContact: string;
  startDate?: string;
  endDate?: string;
  trainingField: string;
  status: TrainingStatus;
  supervisorRating?: number;
  advisorRating?: number;
  reportSubmitted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GraduationProject {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  supervisorId?: string;
  supervisorName: string;
  projectType: ProjectType;
  status: ProjectStatus;
  grade?: string;
  submissionDate?: string;
  defenseDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyPlan {
  id: string;
  programName: string;
  level: number;
  totalHours: number;
  description: string;
  academicYear: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PlanCourse {
  id: string;
  planId: string;
  courseCode: string;
  semesterOrder: number;
  courseType: CourseType;
  prerequisiteCodes: string[];
  createdAt: string;
}

export interface CourseDescription {
  id: string;
  courseCode: string;
  description: string;
  objectives: string[];
  topics: string[];
  textbooks: string[];
  refMaterials: string[];
  assessmentMethod: string;
  updatedBy: string;
  version: number;
  status: DescriptionStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseSection {
  id: string;
  courseCode: string;
  sectionNumber: number;
  professorName: string;
  roomId?: string;
  roomName: string;
  capacity: number;
  enrolled: number;
  scheduleDays: string[];
  scheduleTime: string;
  semester: number;
  academicYear: string;
  status: SectionStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  bookedBy: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
}

// ============ Transfer Types ============

export type TransferStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

export interface EmployeeTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  requestedRank: string;
  requestedSpecialization: string;
  requestedQualification: string;
  coursesToTeach: string[];
  reason: string;
  supportingDocs: string[];
  status: TransferStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'قيد الانتظار',
  under_review: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
};

export const TRANSFER_STATUS_COLORS: Record<TransferStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const ACADEMIC_RANK_OPTIONS = [
  { value: 'teaching_assistant', label: 'معيد' },
  { value: 'lecturer', label: 'محاضر' },
  { value: 'assistant_professor', label: 'أستاذ مساعد' },
  { value: 'associate_professor', label: 'أستاذ مشارك' },
  { value: 'professor', label: 'أستاذ' },
];

export interface StoreState {
  announcements: Announcement[];
  studentRequests: StudentRequest[];
  courses: Course[];
  members: DepartmentMember[];
  enrolledStudents: EnrolledStudent[];
  professorCourses: ProfessorCourse[];
  professorRequests: ProfessorRequest[];
  students: StudentProfile[];
  facultyProfiles: FacultyProfile[];
  rooms: Room[];
  teachingAssignments: TeachingAssignment[];
  performanceEvaluations: PerformanceEvaluation[];
  professionalDevelopment: ProfessionalDevelopment[];
  advisingSessions: AdvisingSession[];
  fieldTraining: FieldTraining[];
  graduationProjects: GraduationProject[];
  studyPlans: StudyPlan[];
  planCourses: PlanCourse[];
  courseDescriptions: CourseDescription[];
  courseSections: CourseSection[];
  roomBookings: RoomBooking[];
}

// ============ Constants ============

export const MAX_CREDIT_HOURS_PER_SEMESTER = 21;
export const REGISTRATION_SEMESTER = 3; // Current registration semester

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

// ============ Student Profile Labels & Colors ============

export const STUDENT_PROFILE_STATUS_LABELS: Record<StudentStatus, string> = {
  active: "نشط",
  probation: "إنذار أكاديمي",
  withdrawn: "منسحب",
  graduated: "متخرج",
  suspended: "موقوف",
};

export const STUDENT_PROFILE_STATUS_COLORS: Record<StudentStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  probation: "bg-amber-100 text-amber-800",
  withdrawn: "bg-red-100 text-red-800",
  graduated: "bg-sky-100 text-sky-800",
  suspended: "bg-slate-100 text-slate-800",
};

// ============ Academic Rank Labels & Colors ============

export const ACADEMIC_RANK_LABELS: Record<AcademicRank, string> = {
  professor: "أستاذ",
  associate_professor: "أستاذ مشارك",
  assistant_professor: "أستاذ مساعد",
  lecturer: "محاضر",
  teaching_assistant: "معيد",
};

export const ACADEMIC_RANK_COLORS: Record<AcademicRank, string> = {
  professor: "bg-purple-100 text-purple-800",
  associate_professor: "bg-violet-100 text-violet-800",
  assistant_professor: "bg-indigo-100 text-indigo-800",
  lecturer: "bg-sky-100 text-sky-800",
  teaching_assistant: "bg-cyan-100 text-cyan-800",
};

// ============ Room Type Labels & Colors ============

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  lecture_hall: "قاعة محاضرات",
  lab: "معمل",
  meeting_room: "قاعة اجتماعات",
  office: "مكتب",
  tutorial: "قاعة تعليم",
};

export const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  lecture_hall: "bg-blue-100 text-blue-800",
  lab: "bg-teal-100 text-teal-800",
  meeting_room: "bg-violet-100 text-violet-800",
  office: "bg-slate-100 text-slate-800",
  tutorial: "bg-amber-100 text-amber-800",
};

// ============ Session Type Labels & Colors ============

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  lecture: "محاضرة",
  lab: "عملي",
  tutorial: "تعليمي",
};

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  lecture: "bg-sky-100 text-sky-800",
  lab: "bg-teal-100 text-teal-800",
  tutorial: "bg-amber-100 text-amber-800",
};

// ============ Day of Week Labels ============

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
};

// ============ Evaluation Type Labels & Colors ============

export const EVALUATION_TYPE_LABELS: Record<EvaluationType, string> = {
  student_feedback: "تقييم الطلاب",
  peer_review: "تقييم الزملاء",
  self_assessment: "تقييم ذاتي",
  chairman_review: "تقييم رئيس القسم",
};

export const EVALUATION_TYPE_COLORS: Record<EvaluationType, string> = {
  student_feedback: "bg-sky-100 text-sky-800",
  peer_review: "bg-violet-100 text-violet-800",
  self_assessment: "bg-amber-100 text-amber-800",
  chairman_review: "bg-purple-100 text-purple-800",
};

// ============ Development Activity Type Labels & Colors ============

export const DEV_ACTIVITY_TYPE_LABELS: Record<DevActivityType, string> = {
  conference: "مؤتمر",
  workshop: "ورشة عمل",
  training_course: "دورة تدريبية",
  seminar: "ندوة",
  certification: "شهادة احترافية",
};

export const DEV_ACTIVITY_TYPE_COLORS: Record<DevActivityType, string> = {
  conference: "bg-violet-100 text-violet-800",
  workshop: "bg-sky-100 text-sky-800",
  training_course: "bg-teal-100 text-teal-800",
  seminar: "bg-amber-100 text-amber-800",
  certification: "bg-emerald-100 text-emerald-800",
};

// ============ Development Status Labels & Colors ============

export const DEV_STATUS_LABELS: Record<DevStatus, string> = {
  planned: "مخطط",
  completed: "مكتمل",
  cancelled: "ملغى",
};

export const DEV_STATUS_COLORS: Record<DevStatus, string> = {
  planned: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

// ============ Advising Type Labels & Colors ============

export const ADVISING_TYPE_LABELS: Record<AdvisingType, string> = {
  academic_plan: "خطة دراسية",
  academic_warning: "إنذار أكاديمي",
  course_guidance: "إرشاد مقررات",
  career_advice: "نصيحة مهنية",
  general: "عام",
};

export const ADVISING_TYPE_COLORS: Record<AdvisingType, string> = {
  academic_plan: "bg-sky-100 text-sky-800",
  academic_warning: "bg-red-100 text-red-800",
  course_guidance: "bg-emerald-100 text-emerald-800",
  career_advice: "bg-violet-100 text-violet-800",
  general: "bg-slate-100 text-slate-800",
};

// ============ Training Status Labels & Colors ============

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  planned: "مخطط",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  failed: "لم ينجح",
};

export const TRAINING_STATUS_COLORS: Record<TrainingStatus, string> = {
  planned: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

// ============ Project Type Labels & Colors ============

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  research: "بحثي",
  software: "برمجي",
  system: "نظم",
  theoretical: "نظري",
};

export const PROJECT_TYPE_COLORS: Record<ProjectType, string> = {
  research: "bg-violet-100 text-violet-800",
  software: "bg-sky-100 text-sky-800",
  system: "bg-teal-100 text-teal-800",
  theoretical: "bg-amber-100 text-amber-800",
};

// ============ Project Status Labels & Colors ============

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  proposed: "مقترح",
  approved: "معتمد",
  in_progress: "قيد التنفيذ",
  submitted: "مقدم",
  defended: "مدافع عنه",
  passed: "ناجح",
  failed: "راسب",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  proposed: "bg-slate-100 text-slate-800",
  approved: "bg-sky-100 text-sky-800",
  in_progress: "bg-amber-100 text-amber-800",
  submitted: "bg-violet-100 text-violet-800",
  defended: "bg-teal-100 text-teal-800",
  passed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

// ============ Plan Status Labels & Colors ============

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  active: "نشط",
  draft: "مسودة",
  archived: "مؤرشف",
};

export const PLAN_STATUS_COLORS: Record<PlanStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-800",
};

// ============ Course Type Labels & Colors ============

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  required: "إجباري",
  elective: "اختياري",
  university_requirement: "متطلب جامعي",
  college_requirement: "متطلب كلية",
};

export const COURSE_TYPE_COLORS: Record<CourseType, string> = {
  required: "bg-sky-100 text-sky-800",
  elective: "bg-violet-100 text-violet-800",
  university_requirement: "bg-amber-100 text-amber-800",
  college_requirement: "bg-teal-100 text-teal-800",
};

// ============ Description Status Labels & Colors ============

export const DESCRIPTION_STATUS_LABELS: Record<DescriptionStatus, string> = {
  draft: "مسودة",
  approved: "معتمد",
  archived: "مؤرشف",
};

export const DESCRIPTION_STATUS_COLORS: Record<DescriptionStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-100 text-slate-800",
};

// ============ Section Status Labels & Colors ============

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  open: "مفتوح",
  closed: "مغلق",
  full: "مكتمل",
};

export const SECTION_STATUS_COLORS: Record<SectionStatus, string> = {
  open: "bg-emerald-100 text-emerald-800",
  closed: "bg-red-100 text-red-800",
  full: "bg-amber-100 text-amber-800",
};

// ============ Booking Status Labels & Colors ============

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "قيد الانتظار",
  approved: "مقبول",
  rejected: "مرفوض",
  cancelled: "ملغى",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-800",
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

const initialEnrolledStudents: EnrolledStudent[] = [
  // === Semester 1 ===
  // CS101 - مقدمة في علوم الحاسب
  { id: "en-1", studentId: "ST-2024-001", name: "عبدالرحمن محمد السالم", courseCode: "CS101", semester: 1, grade: "أ", midTermMark: 28, finalMark: 42, assignmentsMark: 28, attendance: 95, status: "active" },
  { id: "en-2", studentId: "ST-2024-002", name: "نورة عبدالله الحربي", courseCode: "CS101", semester: 1, grade: "أ-", midTermMark: 26, finalMark: 38, assignmentsMark: 27, attendance: 92, status: "active" },
  { id: "en-3", studentId: "ST-2024-003", name: "فهد سعد العتيبي", courseCode: "CS101", semester: 1, grade: "ب+", midTermMark: 22, finalMark: 35, assignmentsMark: 25, attendance: 85, status: "active" },
  { id: "en-4", studentId: "ST-2024-004", name: "ريم خالد الشمري", courseCode: "CS101", semester: 1, grade: "ب", midTermMark: 20, finalMark: 33, assignmentsMark: 24, attendance: 78, status: "active" },
  { id: "en-5", studentId: "ST-2024-005", name: "سلطان فيصل المطيري", courseCode: "CS101", semester: 1, grade: "أ+", midTermMark: 30, finalMark: 45, assignmentsMark: 30, attendance: 98, status: "active" },
  { id: "en-6", studentId: "ST-2024-006", name: "لمى أحمد الزهراني", courseCode: "CS101", semester: 1, grade: undefined, midTermMark: 18, finalMark: 25, assignmentsMark: 20, attendance: 60, status: "incomplete" },
  // CS102 - مبادئ البرمجة
  { id: "en-7", studentId: "ST-2024-001", name: "عبدالرحمن محمد السالم", courseCode: "CS102", semester: 1, grade: "ب", midTermMark: 21, finalMark: 32, assignmentsMark: 23, attendance: 88, status: "active" },
  { id: "en-8", studentId: "ST-2024-002", name: "نورة عبدالله الحربي", courseCode: "CS102", semester: 1, grade: "أ", midTermMark: 28, finalMark: 40, assignmentsMark: 28, attendance: 96, status: "active" },
  { id: "en-9", studentId: "ST-2024-007", name: "ماجد ناصر الدوسري", courseCode: "CS102", semester: 1, grade: "ب+", midTermMark: 23, finalMark: 34, assignmentsMark: 25, attendance: 82, status: "active" },
  { id: "en-10", studentId: "ST-2024-003", name: "فهد سعد العتيبي", courseCode: "CS102", semester: 1, grade: "أ-", midTermMark: 27, finalMark: 37, assignmentsMark: 26, attendance: 90, status: "active" },
  { id: "en-11", studentId: "ST-2024-008", name: "هند عادل القحطاني", courseCode: "CS102", semester: 1, grade: "ج+", midTermMark: 18, finalMark: 28, assignmentsMark: 22, attendance: 70, status: "active" },
  // MATH101 - رياضيات متقدمة
  { id: "en-12", studentId: "ST-2024-004", name: "ريم خالد الشمري", courseCode: "MATH101", semester: 1, grade: "ب-", midTermMark: 20, finalMark: 30, assignmentsMark: 22, attendance: 80, status: "active" },
  { id: "en-13", studentId: "ST-2024-005", name: "سلطان فيصل المطيري", courseCode: "MATH101", semester: 1, grade: "أ", midTermMark: 29, finalMark: 42, assignmentsMark: 29, attendance: 97, status: "active" },
  { id: "en-14", studentId: "ST-2024-009", name: "بدر همام السبيعي", courseCode: "MATH101", semester: 1, grade: "ر", midTermMark: 12, finalMark: 15, assignmentsMark: 10, attendance: 45, status: "active" },
  { id: "en-15", studentId: "ST-2024-001", name: "عبدالرحمن محمد السالم", courseCode: "MATH101", semester: 1, grade: "ب+", midTermMark: 23, finalMark: 35, assignmentsMark: 25, attendance: 86, status: "active" },
  { id: "en-16", studentId: "ST-2024-007", name: "ماجد ناصر الدوسري", courseCode: "MATH101", semester: 1, grade: "ج", midTermMark: 17, finalMark: 26, assignmentsMark: 20, attendance: 68, status: "active" },

  // === Semester 2 ===
  // CS201 - هياكل البيانات
  { id: "en-17", studentId: "ST-2024-001", name: "عبدالرحمن محمد السالم", courseCode: "CS201", semester: 2, grade: "أ-", midTermMark: 27, finalMark: 38, assignmentsMark: 27, attendance: 93, status: "active" },
  { id: "en-18", studentId: "ST-2024-002", name: "نورة عبدالله الحربي", courseCode: "CS201", semester: 2, grade: "ب+", midTermMark: 23, finalMark: 34, assignmentsMark: 25, attendance: 87, status: "active" },
  { id: "en-19", studentId: "ST-2024-003", name: "فهد سعد العتيبي", courseCode: "CS201", semester: 2, grade: "أ", midTermMark: 29, finalMark: 42, assignmentsMark: 29, attendance: 96, status: "active" },
  { id: "en-20", studentId: "ST-2024-010", name: "أسماء طارق البقمي", courseCode: "CS201", semester: 2, grade: "ب", midTermMark: 21, finalMark: 32, assignmentsMark: 23, attendance: 80, status: "active" },
  // CS202 - قواعد البيانات
  { id: "en-21", studentId: "ST-2024-004", name: "ريم خالد الشمري", courseCode: "CS202", semester: 2, grade: "أ+", midTermMark: 30, finalMark: 45, assignmentsMark: 30, attendance: 99, status: "active" },
  { id: "en-22", studentId: "ST-2024-005", name: "سلطان فيصل المطيري", courseCode: "CS202", semester: 2, grade: "ب+", midTermMark: 24, finalMark: 35, assignmentsMark: 26, attendance: 84, status: "active" },
  { id: "en-23", studentId: "ST-2024-001", name: "عبدالرحمن محمد السالم", courseCode: "CS202", semester: 2, grade: "أ", midTermMark: 28, finalMark: 41, assignmentsMark: 28, attendance: 94, status: "active" },
  // CS205 - شبكات الحاسب ١
  { id: "en-24", studentId: "ST-2024-007", name: "ماجد ناصر الدوسري", courseCode: "CS205", semester: 2, grade: "ب", midTermMark: 20, finalMark: 32, assignmentsMark: 24, attendance: 79, status: "active" },
  { id: "en-25", studentId: "ST-2024-010", name: "أسماء طارق البقمي", courseCode: "CS205", semester: 2, grade: "أ-", midTermMark: 26, finalMark: 38, assignmentsMark: 27, attendance: 91, status: "active" },

  // === Semester 3 ===
  // CS301 - تحليل الخوارزميات
  { id: "en-26", studentId: "ST-2024-001", name: "عبدالرحمن محمد السالم", courseCode: "CS301", semester: 3, grade: "أ", midTermMark: 28, finalMark: 43, assignmentsMark: 29, attendance: 97, status: "active" },
  { id: "en-27", studentId: "ST-2024-002", name: "نورة عبدالله الحربي", courseCode: "CS301", semester: 3, grade: "ب+", midTermMark: 23, finalMark: 34, assignmentsMark: 25, attendance: 86, status: "active" },
  { id: "en-28", studentId: "ST-2024-003", name: "فهد سعد العتيبي", courseCode: "CS301", semester: 3, grade: "أ-", midTermMark: 26, finalMark: 38, assignmentsMark: 27, attendance: 92, status: "active" },
  // CS305 - ذكاء اصطناعي
  { id: "en-29", studentId: "ST-2024-004", name: "ريم خالد الشمري", courseCode: "CS305", semester: 3, grade: "أ+", midTermMark: 30, finalMark: 45, assignmentsMark: 30, attendance: 100, status: "active" },
  { id: "en-30", studentId: "ST-2024-005", name: "سلطان فيصل المطيري", courseCode: "CS305", semester: 3, grade: "ب", midTermMark: 21, finalMark: 33, assignmentsMark: 23, attendance: 81, status: "active" },
  { id: "en-31", studentId: "ST-2024-007", name: "ماجد ناصر الدوسري", courseCode: "CS305", semester: 3, grade: undefined, midTermMark: 10, assignmentsMark: 15, attendance: 35, status: "withdrawn" },
];

const initialProfessorCourses: ProfessorCourse[] = [
  // Semester 1
  { code: "CS101", name: "مقدمة في علوم الحاسب", hours: 3, semester: 1, professorName: "د. أحمد محمد الشريف", enrolledCount: 6 },
  { code: "CS102", name: "مبادئ البرمجة", hours: 3, semester: 1, professorName: "د. أحمد محمد الشريف", enrolledCount: 5 },
  { code: "MATH101", name: "رياضيات متقدمة", hours: 4, semester: 1, professorName: "د. فاطمة علي الحسن", enrolledCount: 5 },
  // Semester 2
  { code: "CS201", name: "هياكل البيانات", hours: 3, semester: 2, professorName: "د. أحمد محمد الشريف", enrolledCount: 4 },
  { code: "CS202", name: "قواعد البيانات", hours: 3, semester: 2, professorName: "د. فاطمة علي الحسن", enrolledCount: 3 },
  { code: "CS205", name: "شبكات الحاسب ١", hours: 3, semester: 2, professorName: "د. خالد عبدالله العمري", enrolledCount: 2 },
  // Semester 3
  { code: "CS301", name: "تحليل الخوارزميات", hours: 3, semester: 3, professorName: "د. أحمد محمد الشريف", enrolledCount: 3 },
  { code: "CS305", name: "ذكاء اصطناعي", hours: 3, semester: 3, professorName: "د. فاطمة علي الحسن", enrolledCount: 3 },
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

const initialProfessorRequests: ProfessorRequest[] = [
  {
    id: "pr-1",
    category: "academic",
    target: "department",
    subject: "طلب تحديث المنهج الدراسي",
    description: "أطلب تحديث منهج مقرر هياكل البيانات (CS201) لتشمل مواضيع الأشجار AVL والرسوم البيانية الموجهة بشكل أعمق، مع إضافة مشاريع تطبيقية للطلاب.",
    priority: "important",
    status: "in_progress",
    createdAt: "2025-01-12T09:00:00.000Z",
    updatedAt: "2025-01-14T11:30:00.000Z",
  },
  {
    id: "pr-2",
    category: "schedule_change",
    target: "department",
    subject: "طلب تغيير وقت محاضرة",
    description: "أطلب تغيير وقت محاضرة مقدمة في علوم الحاسب (CS101) من يوم الأحد الساعة 8 إلى يوم الثلاثاء الساعة 10 لتعارض مع اجتماع المجلس الأكاديمي.",
    priority: "normal",
    status: "pending",
    createdAt: "2025-01-15T08:00:00.000Z",
  },
  {
    id: "pr-3",
    category: "grade_review",
    target: "student",
    targetStudentId: "ST-2024-006",
    targetStudentName: "لمى أحمد الزهراني",
    subject: "طلب مراجعة درجات الطالبة",
    description: "أطلب مراجعة درجات الطالبة لمى أحمد الزهراني في مقرر CS101 حيث يبدو أن هناك خطأ في احتساب درجة أعمال السنة. مجموع أعمال السنة المسجلة 20 بينما المفترض 25.",
    priority: "important",
    status: "pending",
    createdAt: "2025-01-14T14:00:00.000Z",
  },
  {
    id: "pr-4",
    category: "technical",
    target: "department",
    subject: "طلب صيانة أجهزة المعمل",
    description: "الأجهزة في معمل البرمجة (معمل 5) تحتاج صيانة عاجلة. 4 أجهزة من أصل 20 متعطلة وأجهزة أخرى بطيئة جداً مما يؤثر على سير العملي.",
    priority: "urgent",
    status: "approved",
    response: "تمت الموافقة على الطلب وإرسال فريق الصيانة.",
    createdAt: "2025-01-10T10:00:00.000Z",
    updatedAt: "2025-01-11T15:00:00.000Z",
  },
  {
    id: "pr-5",
    category: "administrative",
    target: "student",
    targetStudentId: "ST-2024-003",
    targetStudentName: "فهد سعد العتيبي",
    subject: "تنبيه بخصوص الغياب المتكرر",
    description: "أرسل تنبيه للطالب فهد سعد العتيبي بشأن غيابه المتكرر عن محاضرات هياكل البيانات (CS201) حيث بلغت نسبة غيابه 25% وأقترب من الحد الأقصى المسموح.",
    priority: "normal",
    status: "approved",
    response: "تم إبلاغ الطالب وإرسال إنذار رسمي.",
    createdAt: "2025-01-08T12:00:00.000Z",
    updatedAt: "2025-01-09T09:00:00.000Z",
  },
];

let state: StoreState = {
  announcements: initialAnnouncements,
  studentRequests: [],
  courses: initialCourses,
  members: initialMembers,
  enrolledStudents: initialEnrolledStudents,
  professorCourses: initialProfessorCourses,
  professorRequests: initialProfessorRequests,
  students: [],
  facultyProfiles: [],
  rooms: [],
  teachingAssignments: [],
  performanceEvaluations: [],
  professionalDevelopment: [],
  advisingSessions: [],
  fieldTraining: [],
  graduationProjects: [],
  studyPlans: [],
  planCourses: [],
  courseDescriptions: [],
  courseSections: [],
  roomBookings: [],
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

// ============ Professor Request Actions ============

export function addProfessorRequest(
  request: Omit<ProfessorRequest, "id" | "createdAt" | "status">
) {
  const newRequest: ProfessorRequest = {
    ...request,
    id: `pr-${nextId++}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  state = {
    ...state,
    professorRequests: [newRequest, ...state.professorRequests],
  };
  emitChange();
}

export function updateProfessorRequestStatus(
  requestId: string,
  status: ProfessorRequestStatus,
  response?: string
) {
  state = {
    ...state,
    professorRequests: state.professorRequests.map((r) =>
      r.id === requestId
        ? { ...r, status, response, updatedAt: new Date().toISOString() }
        : r
    ),
  };
  emitChange();
}

export function deleteProfessorRequest(id: string) {
  state = {
    ...state,
    professorRequests: state.professorRequests.filter((r) => r.id !== id),
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
 * Returns enrolled students array - stable reference until data changes.
 */
export function useEnrolledStudents(): EnrolledStudent[] {
  const subscribeFn = useCallback(subscribe, []);

  const students = useSyncExternalStore(
    subscribeFn,
    () => state.enrolledStudents
  );

  return students;
}

/**
 * Returns professor courses array - stable reference until data changes.
 */
export function useProfessorCourses(): ProfessorCourse[] {
  const subscribeFn = useCallback(subscribe, []);

  const courses = useSyncExternalStore(
    subscribeFn,
    () => state.professorCourses
  );

  return courses;
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
 * Returns professor requests array - stable reference until data changes.
 */
export function useProfessorRequests(): ProfessorRequest[] {
  const subscribeFn = useCallback(subscribe, []);

  const requests = useSyncExternalStore(
    subscribeFn,
    () => state.professorRequests
  );

  return requests;
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
