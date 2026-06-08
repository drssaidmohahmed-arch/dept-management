'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Crown,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Database,
  UserCog,
} from "lucide-react";
import HODDashboard from "@/components/hod/HODDashboard";
import ProfessorDashboard from "@/components/professor/ProfessorDashboard";
import EmployeeDashboard from "@/components/employee/EmployeeDashboard";
import StudentDashboard from "@/components/student/StudentDashboard";

type Role = "landing" | "hod" | "professor" | "employee" | "student";

// ============ Landing Page ============

function LandingPage({ onSelectRole }: { onSelectRole: (role: Role) => void }) {
  const roles = [
    {
      id: "hod" as Role,
      title: "رئيس القسم",
      description: "لوحة التحكم الرئيسية لإدارة القسم والإعلانات والإحصائيات",
      icon: Crown,
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      id: "professor" as Role,
      title: "عضو هيئة التدريس",
      description: "عرض الإعلانات والجدول الأسبوعي والمعلومات الأكاديمية",
      icon: GraduationCap,
      bgLight: "bg-sky-50",
      textColor: "text-sky-700",
    },
    {
      id: "employee" as Role,
      title: "الموظف الإداري",
      description: "إدارة العمليات الإدارية وتقديم طلبات التحويل",
      icon: UserCog,
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      id: "student" as Role,
      title: "الطالب",
      description: "الإعلانات والمواد الأكاديمية وتقديم الطلبات",
      icon: BookOpen,
      bgLight: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-l from-slate-800 to-slate-900 text-white py-6 px-4 sm:py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold">
              نظام إدارة القسم الأكاديمي
            </h1>
          </div>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg">
            اختر نوع الحساب للدخول إلى لوحة التحكم الخاصة بك
          </p>
        </div>
      </header>

      {/* Cards Grid */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="role-card cursor-pointer border-2 hover:border-transparent overflow-hidden active:scale-[0.98] transition-transform"
                  onClick={() => onSelectRole(role.id)}
                >
                  <CardHeader className="p-3 sm:p-4 sm:pb-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-row-reverse">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${role.bgLight} ${role.textColor}`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <CardTitle className={`text-base sm:text-xl ${role.textColor}`}>
                        {role.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 sm:pt-0">
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      {role.description}
                    </p>
                    <div className="mt-3 sm:mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                      <span>الدخول</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-3 sm:py-4 px-4 mt-auto">
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          © ٢٠٢٥ نظام إدارة القسم الأكاديمي - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}

// ============ Main Page ============

export default function Home() {
  const [currentRole, setCurrentRole] = useState<Role>("landing");

  const roleTitles: Record<string, string> = {
    hod: "رئيس القسم",
    professor: "هيئة التدريس",
    employee: "الموظف الإداري",
    student: "الطالب",
  };

  if (currentRole === "landing") {
    return <LandingPage onSelectRole={setCurrentRole} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      {/* Header - compact on mobile */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-sm sm:text-lg font-bold text-slate-800 truncate">
              {roleTitles[currentRole]}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentRole("landing")}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0"
          >
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">العودة للرئيسية</span>
            <span className="sm:hidden">رجوع</span>
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-3 sm:p-4 md:p-6">
        {currentRole === "hod" && <HODDashboard />}
        {currentRole === "professor" && <ProfessorDashboard />}
        {currentRole === "employee" && <EmployeeDashboard />}
        {currentRole === "student" && <StudentDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-2 sm:py-3 px-4 mt-auto">
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground">
          © ٢٠٢٥ نظام إدارة القسم الأكاديمي
        </p>
      </footer>

      {/* Floating Migration Button */}
      <Link
        href="/migrate"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full px-3 py-2 shadow-lg hover:shadow-xl transition-all text-[10px] sm:text-xs"
        title="تشغيل Migration"
      >
        <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">تشغيل Migration</span>
        <span className="sm:hidden">Migration</span>
      </Link>
    </div>
  );
}
