import type {
  Announcement,
  StudentRequest,
  Course,
  DepartmentMember,
  ProfessorRequest,
  EnrolledStudent,
  ProfessorCourse,
  EmployeeTransfer,
  StudentProfile,
  Room,
  FieldTraining,
  PlanCourse,
  RoomBooking,
  CourseDescription,
  GraduationProject,
  AdvisingSession,
  StudyPlan,
  CourseSection,
  ProfessionalDevelopment,
  PerformanceEvaluation,
  TeachingAssignment,
} from '@/lib/store';

// ============ ID Generator ============

export function genId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

// ============ Generic Store Factory ============

interface CrudStore<T extends { id: string }> {
  getAll(): T[];
  get(id: string): T | undefined;
  add(item: T): T;
  update(id: string, fields: Partial<T>): T | undefined;
  delete(id: string): boolean;
  remove(id: string): boolean;
}

function createStore<T extends { id: string }>(initialData: T[] = []): CrudStore<T> {
  const items: T[] = [...initialData];

  return {
    getAll() {
      return [...items];
    },

    get(id: string) {
      return items.find((item) => item.id === id);
    },

    add(item: T) {
      items.push(item);
      return item;
    },

    update(id: string, fields: Partial<T>) {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      items[index] = { ...items[index], ...fields };
      return items[index];
    },

    delete(id: string) {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return false;
      items.splice(index, 1);
      return true;
    },

    remove(id: string) {
      return this.delete(id);
    },
  };
}

// ============ Store Instances ============

export const announcementsStore = createStore<Announcement>();
export const studentRequestsStore = createStore<StudentRequest>();
export const membersStore = createStore<DepartmentMember>();
export const professorRequestsStore = createStore<ProfessorRequest>();
export const professorCoursesStore = createStore<ProfessorCourse>();
export const enrolledStudentsStore = createStore<EnrolledStudent>();
export const coursesStore = createStore<Course>();
export const employeeTransfersStore = createStore<EmployeeTransfer>();
export const studentsStore = createStore<StudentProfile>();
export const roomsStore = createStore<Room>();
export const fieldTrainingStore = createStore<FieldTraining>();
export const planCoursesStore = createStore<PlanCourse>();
export const roomBookingsStore = createStore<RoomBooking>();
export const courseDescriptionsStore = createStore<CourseDescription>();
export const graduationProjectsStore = createStore<GraduationProject>();
export const advisingSessionsStore = createStore<AdvisingSession>();
export const studyPlansStore = createStore<StudyPlan>();
export const courseSectionsStore = createStore<CourseSection>();
export const professionalDevelopmentStore = createStore<ProfessionalDevelopment>();
export const performanceEvaluationsStore = createStore<PerformanceEvaluation>();
export const teachingAssignmentsStore = createStore<TeachingAssignment>();
