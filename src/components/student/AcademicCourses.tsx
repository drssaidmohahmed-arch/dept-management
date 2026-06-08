'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, TrendingUp } from "lucide-react";

const semesterNames = [
  "الفصل الأول",
  "الفصل الثاني",
  "الفصل الثالث",
  "الفصل الرابع",
  "الفصل الخامس",
  "الفصل السادس",
];

const semesterShortNames = [
  "الأول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
];

const allCoursesData: Record<number, { name: string; code: string; hours: number }[]> = {
  1: [
    { name: "مقدمة في علوم الحاسب", code: "CS101", hours: 3 },
    { name: "رياضيات متقدمة", code: "MATH101", hours: 4 },
    { name: "فيزياء عامة", code: "PHYS101", hours: 3 },
    { name: "لغة إنجليزية", code: "ENG101", hours: 2 },
    { name: "مهارات حاسوبية", code: "IT101", hours: 2 },
    { name: "مبادئ البرمجة", code: "CS102", hours: 3 },
    { name: "إحصاء واحتمالات", code: "STAT101", hours: 3 },
    { name: "تفكير نقدي", code: "CRIT101", hours: 2 },
  ],
  2: [
    { name: "هياكل البيانات", code: "CS201", hours: 3 },
    { name: "قواعد البيانات", code: "CS202", hours: 3 },
    { name: "رياضيات متقدمة ٢", code: "MATH201", hours: 3 },
    { name: "أنظمة تشغيل ١", code: "CS203", hours: 3 },
    { name: "برمجة كائنية", code: "CS204", hours: 3 },
    { name: "لغة إنجليزية ٢", code: "ENG201", hours: 2 },
    { name: "شبكات الحاسب ١", code: "CS205", hours: 3 },
    { name: "منطق رقمي", code: "CS206", hours: 2 },
  ],
  3: [
    { name: "تحليل الخوارزميات", code: "CS301", hours: 3 },
    { name: "أنظمة تشغيل ٢", code: "CS302", hours: 3 },
    { name: "هندسة البرمجيات", code: "CS303", hours: 3 },
    { name: "شبكات الحاسب ٢", code: "CS304", hours: 3 },
    { name: "ذكاء اصطناعي", code: "CS305", hours: 3 },
    { name: "تصميم واجهات", code: "CS306", hours: 2 },
    { name: "إدارة مشاريع", code: "MGT301", hours: 2 },
    { name: "أخلاقيات الحاسب", code: "CS307", hours: 2 },
  ],
  4: [
    { name: "تعلم آلي", code: "CS401", hours: 3 },
    { name: "أمن معلومات", code: "CS402", hours: 3 },
    { name: "تطوير ويب متقدم", code: "CS403", hours: 3 },
    { name: "حوسبة سحابية", code: "CS404", hours: 3 },
    { name: "معالجة صور", code: "CS405", hours: 3 },
    { name: "تطبيقات موبايل", code: "CS406", hours: 2 },
    { name: "نظم موزعة", code: "CS407", hours: 3 },
    { name: "ريادة أعمال", code: "MGT401", hours: 2 },
  ],
  5: [
    { name: "بيانات ضخمة", code: "CS501", hours: 3 },
    { name: "تعلم عميق", code: "CS502", hours: 3 },
    { name: "اختبار برمجيات", code: "CS503", hours: 2 },
    { name: "معالجة لغة طبيعية", code: "CS504", hours: 3 },
    { name: "إنترنت الأشياء", code: "CS505", hours: 2 },
    { name: "مشروع تخرج ١", code: "CS506", hours: 3 },
    { name: "بلوك تشين", code: "CS507", hours: 2 },
    { name: "مساق اختياري", code: "ELEC501", hours: 2 },
  ],
  6: [
    { name: "أبحاث متقدمة", code: "CS601", hours: 3 },
    { name: "مشروع تخرج ٢", code: "CS602", hours: 4 },
    { name: "تدريب ميداني", code: "CS603", hours: 3 },
    { name: "مسار متخصص ١", code: "SPEC601", hours: 3 },
    { name: "مسار متخصص ٢", code: "SPEC602", hours: 3 },
    { name: "إدارة تقنية", code: "MGT601", hours: 2 },
    { name: "موضوع خاص", code: "CS604", hours: 2 },
    { name: "ندوات بحثية", code: "CS605", hours: 1 },
  ],
};

// Grade to GPA mapping
const gradeToPoints: Record<string, number> = {
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

const gradeColorClass = (grade?: string) => {
  if (!grade) return "text-muted-foreground";
  const points = gradeToPoints[grade] ?? 0;
  if (points >= 3.7) return "text-emerald-600 font-semibold";
  if (points >= 3.0) return "text-sky-600 font-semibold";
  if (points >= 2.0) return "text-amber-600 font-semibold";
  if (points >= 1.0) return "text-orange-600 font-semibold";
  return "text-red-600 font-semibold";
};

export default function AcademicCourses() {
  const [activeSemester, setActiveSemester] = useState(1);

  // Mock grades for semesters 1-3
  const gradesData: Record<number, Record<string, string>> = {
    1: {
      CS101: "أ",
      MATH101: "أ-",
      PHYS101: "ب+",
      ENG101: "أ",
      IT101: "أ",
      CS102: "ب",
      STAT101: "أ+",
      CRIT101: "أ-",
    },
    2: {
      CS201: "أ-",
      CS202: "ب+",
      MATH201: "ب",
      CS203: "أ",
      CS204: "أ-",
      ENG201: "أ",
      CS205: "ب+",
      CS206: "أ",
    },
    3: {
      CS301: "ب+",
      CS302: "أ-",
      CS303: "أ",
      CS304: "ب",
      CS305: "أ",
      CS306: "أ+",
      MGT301: "أ-",
      CS307: "أ",
    },
  };

  const semesterCourses = allCoursesData[activeSemester] || [];
  const semesterGrades = gradesData[activeSemester] || {};

  // Calculate GPA for current semester
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalHours = 0;
    semesterCourses.forEach((course) => {
      const grade = semesterGrades[course.code];
      if (grade && gradeToPoints[grade] !== undefined) {
        totalPoints += gradeToPoints[grade] * course.hours;
        totalHours += course.hours;
      }
    });
    return totalHours > 0 ? totalPoints / totalHours : 0;
  };

  // Calculate cumulative GPA
  const calculateCumulativeGPA = () => {
    let totalPoints = 0;
    let totalHours = 0;
    Object.entries(gradesData).forEach(([sem, grades]) => {
      const courses = allCoursesData[Number(sem)] || [];
      courses.forEach((course) => {
        const grade = grades[course.code];
        if (grade && gradeToPoints[grade] !== undefined) {
          totalPoints += gradeToPoints[grade] * course.hours;
          totalHours += course.hours;
        }
      });
    });
    return totalHours > 0 ? totalPoints / totalHours : 0;
  };

  const currentGPA = calculateGPA();
  const cumulativeGPA = calculateCumulativeGPA();
  const totalHours = semesterCourses.reduce((sum, c) => sum + c.hours, 0);
  const passedHours = Object.values(gradesData).reduce((sum, grades) => {
    const sem = Object.keys(gradesData).findIndex((k) => gradesData[Number(k)] === grades) + 1;
    const courses = allCoursesData[sem] || [];
    return sum + courses.filter((c) => grades[c.code]).reduce((s, c) => s + c.hours, 0);
  }, 0);

  const gpaColor = (gpa: number) => {
    if (gpa >= 3.5) return "text-emerald-600";
    if (gpa >= 3.0) return "text-sky-600";
    if (gpa >= 2.5) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* GPA Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المعدل الفصلي</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${gpaColor(currentGPA)}`}>
              {currentGPA.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">المعدل التراكمي</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${gpaColor(cumulativeGPA)}`}>
              {cumulativeGPA.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1 flex-row-reverse">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">الساعات المكتسبة</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-slate-800">{passedHours}</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester Tabs */}
      <Tabs
        value={String(activeSemester)}
        onValueChange={(v) => setActiveSemester(Number(v))}
      >
        <TabsList className="flex w-full overflow-x-auto h-auto">
          {semesterNames.map((name, i) => (
            <TabsTrigger
              key={i}
              value={String(i + 1)}
              className="text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 shrink-0 min-w-[80px] sm:min-w-auto"
            >
              <span className="sm:hidden">{semesterShortNames[i]}</span>
              <span className="hidden sm:inline">{name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {semesterNames.map((_, i) => (
          <TabsContent key={i} value={String(i + 1)} className="mt-3 sm:mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs">#</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs">رمز المقرر</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs">اسم المقرر</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs text-center">الساعات</th>
                        <th className="text-right p-2 sm:p-3 font-medium text-[10px] sm:text-xs text-center">التقدير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(allCoursesData[i + 1] || []).map((course, j) => {
                        const grade = gradesData[i + 1]?.[course.code];
                        return (
                          <tr
                            key={course.code}
                            className="border-b hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-2 sm:p-3 text-muted-foreground text-[10px] sm:text-xs">{j + 1}</td>
                            <td className="p-2 sm:p-3 font-mono text-[10px] sm:text-xs">{course.code}</td>
                            <td className="p-2 sm:p-3 text-[10px] sm:text-xs">{course.name}</td>
                            <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">{course.hours}</td>
                            <td className="p-2 sm:p-3 text-center">
                              {grade ? (
                                <span className={`text-sm sm:text-lg ${gradeColorClass(grade)}`}>
                                  {grade}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[10px] sm:text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-slate-50 font-medium">
                        <td colSpan={3} className="p-2 sm:p-3 text-[10px] sm:text-xs">
                          إجمالي الساعات
                        </td>
                        <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs">
                          {(allCoursesData[i + 1] || []).reduce(
                            (sum, c) => sum + c.hours,
                            0
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
