'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Crown,
  GraduationCap,
  Briefcase,
  BookOpen,
  ArrowRight,
  Bell,
  Users,
  BarChart3,
  Calendar,
  Building2,
  ClipboardList,
  Megaphone,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useStore, PRIORITY_LABELS, PRIORITY_COLORS, TARGET_ROLE_LABELS, type Announcement, type Priority, type TargetRole, generateId, addAnnouncement } from '@/lib/store'
import HODDashboard from '@/components/hod/HODDashboard'
import ProfessorDashboard from '@/components/professor/ProfessorDashboard'
import EmployeeDashboard from '@/components/employee/EmployeeDashboard'
import AcademicCourses from '@/components/student/AcademicCourses'
import StudentRequests from '@/components/student/StudentRequests'

type ViewType = 'landing' | 'hod' | 'professor' | 'employee' | 'student'

// ============================================================
// Portal Card Data
// ============================================================
const portalCards = [
  {
    id: 'hod' as ViewType,
    title: 'رئيس القسم',
    description: 'إدارة القسم، إعلانات، إحصائيات، ومتابعة الأعضاء',
    icon: Crown,
    color: 'from-emerald-500 to-emerald-700',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-800',
    textColor: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 'professor' as ViewType,
    title: 'عضو هيئة التدريس',
    description: 'عرض الإعلانات والمتابعات الأكاديمية',
    icon: GraduationCap,
    color: 'from-blue-500 to-blue-700',
    hoverColor: 'hover:from-blue-600 hover:to-blue-800',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'employee' as ViewType,
    title: 'الموظف الإداري',
    description: 'عرض الإعلانات والمهام الإدارية',
    icon: Briefcase,
    color: 'from-cyan-500 to-cyan-700',
    hoverColor: 'hover:from-cyan-600 hover:to-cyan-800',
    textColor: 'text-cyan-700',
    bgLight: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    iconBg: 'bg-cyan-100',
  },
  {
    id: 'student' as ViewType,
    title: 'الطالب',
    description: 'الإعلانات والمقررات الدراسية والطلبات',
    icon: BookOpen,
    color: 'from-orange-500 to-orange-700',
    hoverColor: 'hover:from-orange-600 hover:to-orange-800',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconBg: 'bg-orange-100',
  },
]

// ============================================================
// Landing Page
// ============================================================
function LandingPage({ onSelect }: { onSelect: (view: ViewType) => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-l from-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">نظام إدارة القسم الأكاديمي</h1>
              <p className="text-slate-300 text-sm sm:text-base mt-1">منصة متكاملة لإدارة وتنظيم شؤون القسم الأكاديمي</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">اختر نوع الحساب للدخول</h2>
        <p className="text-muted-foreground text-center mb-8 sm:mb-10 text-sm sm:text-base">اضغط على البطاقة المناسبة للوصول إلى لوحة التحكم</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {portalCards.map((card) => {
            const Icon = card.icon
            return (
              <Card
                key={card.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 ${card.borderColor} overflow-hidden`}
                onClick={() => onSelect(card.id)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${card.textColor}`} />
                  </div>
                  <CardTitle className={`text-lg font-bold ${card.textColor}`}>{card.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`w-full py-2.5 rounded-lg bg-gradient-to-l ${card.color} ${card.hoverColor} text-white text-center text-sm font-medium transition-all duration-300 group-hover:shadow-lg`}>
                    الدخول إلى لوحة التحكم
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* System Info Card */}
        <div className="mt-10 sm:mt-12">
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-600" />
                معلومات النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">الإصدار:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">الإطار:</span>
                  <span className="font-medium">Next.js 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-muted-foreground">اللغة:</span>
                  <span className="font-medium">TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className="font-medium text-emerald-600">نشط ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>© ٢٠٢٥ نظام إدارة القسم الأكاديمي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}

// ============================================================
// Dashboard Header with Back Button
// ============================================================
function DashboardHeader({ title, role, onBack }: { title: string; role: ViewType; onBack: () => void }) {
  const card = portalCards.find(c => c.id === role)
  const Icon = card?.icon || Building2

  return (
    <div className="bg-gradient-to-l from-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onBack}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
            <p className="text-slate-300 text-sm">لوحة التحكم - نظام إدارة القسم الأكاديمي</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Student Dashboard (inline)
// ============================================================
function StudentDashboard() {
  const { announcements: allAnnouncements, requests, stats } = useStore()
  const studentAnnouncements = allAnnouncements.filter(
    a => a.targetRole === 'all' || a.targetRole === 'students'
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-orange-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.studentAnnouncements}</p>
              <p className="text-sm text-muted-foreground">الإعلانات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalCourses}</p>
              <p className="text-sm text-muted-foreground">المقررات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats.totalRequests}</p>
              <p className="text-sm text-muted-foreground">الطلبات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.totalHours}</p>
              <p className="text-sm text-muted-foreground">الساعات الدراسية</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="w-full flex mb-4">
          <TabsTrigger value="announcements" className="flex-1">
            <Bell className="w-4 h-4 ml-2" />
            الإعلانات
            {studentAnnouncements.length > 0 && (
              <Badge variant="destructive" className="mr-2 min-w-[24px] text-center text-xs">
                {studentAnnouncements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex-1">
            <BookOpen className="w-4 h-4 ml-2" />
            المقررات الدراسية
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">
            <ClipboardList className="w-4 h-4 ml-2" />
            طلباتي
            {stats.pendingRequests > 0 && (
              <Badge variant="destructive" className="mr-2 min-w-[24px] text-center text-xs">
                {stats.pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <div className="space-y-4">
            {studentAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد إعلانات حالياً</p>
                </CardContent>
              </Card>
            ) : (
              studentAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <AcademicCourses />
        </TabsContent>

        <TabsContent value="requests">
          <StudentRequests />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================
// Shared Announcement Card
// ============================================================
function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="border-r-4 border-r-slate-300 hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-bold text-base">{announcement.title}</h3>
              <Badge className={`${PRIORITY_COLORS[announcement.priority]} text-xs border`}>
                {PRIORITY_LABELS[announcement.priority]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {TARGET_ROLE_LABELS[announcement.targetRole]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{announcement.content}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {announcement.authorName}
              </span>
              <Separator orientation="vertical" className="h-3.5" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {announcement.date}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Page Component
// ============================================================
export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('landing')

  const goBack = () => setCurrentView('landing')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {currentView === 'landing' ? (
        <LandingPage onSelect={setCurrentView} />
      ) : (
        <>
          <DashboardHeader
            title={
              currentView === 'hod'
                ? 'لوحة تحكم رئيس القسم'
                : currentView === 'professor'
                ? 'لوحة تحكم عضو هيئة التدريس'
                : currentView === 'employee'
                ? 'لوحة تحكم الموظف الإداري'
                : 'لوحة تحكم الطالب'
            }
            role={currentView}
            onBack={goBack}
          />
          <main className="flex-1">
            {currentView === 'hod' && <HODDashboard />}
            {currentView === 'professor' && <ProfessorDashboard />}
            {currentView === 'employee' && <EmployeeDashboard />}
            {currentView === 'student' && <StudentDashboard />}
          </main>
          <footer className="bg-slate-50 border-t mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
              <p>© ٢٠٢٥ نظام إدارة القسم الأكاديمي - جميع الحقوق محفوظة</p>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
