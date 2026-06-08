'use client';

import { useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Calendar,
  FileText,
  ClipboardList,
  FileBarChart,
  PenLine,
  BookOpen,
  LayoutList,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";
import {
  useAnnouncements,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from "@/lib/supabase-store";
import StudentRecords from "@/components/student/StudentRecords";
import CourseRegistration from "@/components/student/CourseRegistration";
import AcademicCourses from "@/components/student/AcademicCourses";
import StudentRequests from "@/components/student/StudentRequests";
import StudyPlans from "@/components/courses/StudyPlans";
import CourseDescriptions from "@/components/courses/CourseDescriptions";
import AcademicAdvising from "@/components/student-affairs/AcademicAdvising";
import TrainingAndProjects from "@/components/student-affairs/TrainingAndProjects";

export default function StudentDashboard() {
  const announcements = useAnnouncements();
  const studentAnnouncements = useMemo(
    () => announcements.filter((a) => a.targetRole === "all" || a.targetRole === "students"),
    [announcements]
  );
  const urgentAnnouncements = useMemo(
    () => studentAnnouncements.filter((a) => a.priority === "urgent"),
    [studentAnnouncements]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Urgent Announcements */}
      {urgentAnnouncements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <h3 className="text-red-800 font-bold text-base sm:text-lg mb-3 flex items-center gap-2 flex-row-reverse">
            <Bell className="w-5 h-5" />
            إعلانات عاجلة
          </h3>
          <div className="space-y-3">
            {urgentAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-lg p-3 border border-red-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-red-900 text-sm sm:text-base">{ann.title}</h4>
                  <Badge variant="destructive" className="shrink-0 text-[10px] sm:text-xs">
                    عاجل
                  </Badge>
                </div>
                <p className="text-red-700 text-xs sm:text-sm mt-1">{ann.content}</p>
                <p className="text-red-400 text-[10px] sm:text-xs mt-2">
                  {new Date(ann.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="announcements" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإعلانات</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">المقررات الدراسية</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <FileBarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">السجل الأكاديمي</span>
          </TabsTrigger>
          <TabsTrigger value="registration" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">التسجيل</span>
          </TabsTrigger>
          <TabsTrigger value="study-plans" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <LayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الخطط الدراسية</span>
          </TabsTrigger>
          <TabsTrigger value="descriptions" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">توصيف المقررات</span>
          </TabsTrigger>
          <TabsTrigger value="advising" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الإرشاد الأكاديمي</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">التدريب والمشاريع</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 min-w-0 flex items-center gap-0.5 sm:gap-1 flex-row-reverse text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الطلبات</span>
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-3 sm:mt-4">
          {studentAnnouncements.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm sm:text-base">لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentAnnouncements.map((ann) => (
                <Card key={ann.id}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base">{ann.title}</h3>
                          <Badge
                            className={`text-[10px] sm:text-xs ${PRIORITY_COLORS[ann.priority]}`}
                          >
                            {PRIORITY_LABELS[ann.priority]}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {TARGET_ROLE_LABELS[ann.targetRole]}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                          {ann.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 flex-row-reverse">
                            <Calendar className="w-3 h-3" />
                            {new Date(ann.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                          <span className="flex items-center gap-1 flex-row-reverse">
                            <FileText className="w-3 h-3" />
                            {TARGET_ROLE_LABELS[ann.targetRole]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Academic Courses Tab */}
        <TabsContent value="courses" className="mt-3 sm:mt-4">
          <AcademicCourses />
        </TabsContent>

        {/* Academic Records Tab */}
        <TabsContent value="records" className="mt-3 sm:mt-4">
          <StudentRecords />
        </TabsContent>

        {/* Course Registration Tab */}
        <TabsContent value="registration" className="mt-3 sm:mt-4">
          <CourseRegistration />
        </TabsContent>

        {/* Study Plans Tab */}
        <TabsContent value="study-plans" className="mt-3 sm:mt-4">
          <StudyPlans />
        </TabsContent>

        {/* Course Descriptions Tab */}
        <TabsContent value="descriptions" className="mt-3 sm:mt-4">
          <CourseDescriptions />
        </TabsContent>

        {/* Academic Advising Tab */}
        <TabsContent value="advising" className="mt-3 sm:mt-4">
          <AcademicAdvising />
        </TabsContent>

        {/* Training & Projects Tab */}
        <TabsContent value="training" className="mt-3 sm:mt-4">
          <TrainingAndProjects />
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-3 sm:mt-4">
          <StudentRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
