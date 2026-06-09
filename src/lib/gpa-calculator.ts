// ============ GPA Calculator ============

import type { EnrolledStudent } from '@/lib/store';

// Arabic grade to GPA point mapping
export const ARABIC_GRADE_TO_POINTS: Record<string, number> = {
  'أ': 4.0,
  'أ-': 3.7,
  'ب+': 3.3,
  'ب': 3.0,
  'ب-': 2.7,
  'ج+': 2.3,
  'ج': 2.0,
  'ج-': 1.7,
  'د+': 1.3,
  'د': 1.0,
  'راسب': 0,
  'ر': 0,
};

export interface GPABreakdown {
  semester: number;
  gpa: number;
  credits: number;
  passedCourses: number;
  failedCourses: number;
}

export interface GPACalculationResult {
  semesterGPAs: GPABreakdown[];
  cumulativeGPA: number;
  totalCredits: number;
  totalCourses: number;
  passedCourses: number;
  failedCourses: number;
}

/**
 * Calculate GPA from enrolled students data.
 * Weights by course hours from the courseHoursMap.
 * Only considers active enrollments with grades.
 */
export function calculateGPA(
  enrolledStudents: EnrolledStudent[],
  courseHoursMap: Record<string, number>
): GPACalculationResult {
  // Group by semester
  const semesterMap = new Map<number, EnrolledStudent[]>();
  for (const enrollment of enrolledStudents) {
    if (!semesterMap.has(enrollment.semester)) {
      semesterMap.set(enrollment.semester, []);
    }
    semesterMap.get(enrollment.semester)!.push(enrollment);
  }

  const semesterGPAs: GPABreakdown[] = [];
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let totalCourses = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  // Sort semesters ascending
  const sortedSemesters = [...semesterMap.keys()].sort((a, b) => a - b);

  for (const semester of sortedSemesters) {
    const enrollments = semesterMap.get(semester) || [];
    let semesterPoints = 0;
    let semesterCredits = 0;
    let semesterPassed = 0;
    let semesterFailed = 0;

    for (const enrollment of enrollments) {
      // Only count active courses with a grade
      if (enrollment.status !== 'active' || !enrollment.grade) continue;

      const hours = courseHoursMap[enrollment.courseCode] || 0;
      const points = ARABIC_GRADE_TO_POINTS[enrollment.grade] ?? ARABIC_GRADE_TO_POINTS['ر'] ?? 0;

      semesterPoints += points * hours;
      semesterCredits += hours;

      if (points > 0) {
        semesterPassed++;
      } else {
        semesterFailed++;
      }
    }

    const semesterGPA = semesterCredits > 0 ? semesterPoints / semesterCredits : 0;

    semesterGPAs.push({
      semester,
      gpa: Math.round(semesterGPA * 100) / 100,
      credits: semesterCredits,
      passedCourses: semesterPassed,
      failedCourses: semesterFailed,
    });

    totalWeightedPoints += semesterPoints;
    totalCredits += semesterCredits;
    totalPassed += semesterPassed;
    totalFailed += semesterFailed;
    totalCourses += semesterPassed + semesterFailed;
  }

  const cumulativeGPA = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

  return {
    semesterGPAs,
    cumulativeGPA: Math.round(cumulativeGPA * 100) / 100,
    totalCredits,
    totalCourses,
    passedCourses: totalPassed,
    failedCourses: totalFailed,
  };
}

/**
 * Get academic status based on GPA
 */
export function getAcademicStatus(gpa: number): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: 'excellent' | 'good' | 'warning' | 'danger';
} {
  if (gpa >= 3.5) {
    return {
      label: 'ممتاز',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800',
      icon: 'excellent',
    };
  } else if (gpa >= 3.0) {
    return {
      label: 'جيد جداً',
      color: 'bg-sky-500',
      bgColor: 'bg-sky-100',
      textColor: 'text-sky-800',
      icon: 'good',
    };
  } else if (gpa >= 2.0) {
    return {
      label: 'مقبول',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      icon: 'warning',
    };
  } else {
    return {
      label: 'ضعيف',
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: 'danger',
    };
  }
}
