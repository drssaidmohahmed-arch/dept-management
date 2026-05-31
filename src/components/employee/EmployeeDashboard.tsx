'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Briefcase,
  Users,
  Calendar,
  Megaphone,
  ClipboardCheck,
} from 'lucide-react'
import {
  useStore,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from '@/lib/store'

export default function EmployeeDashboard() {
  const { announcements: allAnnouncements, stats } = useStore()

  // Filter announcements for employees
  const employeeAnnouncements = allAnnouncements.filter(
    a => a.targetRole === 'all' || a.targetRole === 'employees'
  )

  const urgentAnnouncements = employeeAnnouncements.filter(a => a.priority === 'urgent')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-cyan-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-cyan-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-700">{employeeAnnouncements.length}</p>
              <p className="text-sm text-muted-foreground">الإعلانات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{urgentAnnouncements.length}</p>
              <p className="text-sm text-muted-foreground">إعلانات عاجلة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">١٢</p>
              <p className="text-sm text-muted-foreground">المهام المكتملة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">٥</p>
              <p className="text-sm text-muted-foreground">مهام معلقة</p>
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
            {employeeAnnouncements.length > 0 && (
              <Badge variant="destructive" className="mr-2 min-w-[24px] text-center text-xs">
                {employeeAnnouncements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">
            <ClipboardCheck className="w-4 h-4 ml-2" />
            المهام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          {/* Urgent Section */}
          {urgentAnnouncements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                إعلانات عاجلة
              </h3>
              <div className="space-y-3">
                {urgentAnnouncements.map((a) => (
                  <Card key={a.id} className="border-r-4 border-r-red-500 bg-red-50/30">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold">{a.title}</h4>
                        <Badge className={`${PRIORITY_COLORS.urgent} text-xs border`}>
                          {PRIORITY_LABELS.urgent}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {a.authorName}
                        </span>
                        <Separator orientation="vertical" className="h-3.5" />
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {a.date}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Announcements */}
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            جميع الإعلانات
          </h3>
          <div className="space-y-3">
            {employeeAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد إعلانات حالياً</p>
                </CardContent>
              </Card>
            ) : (
              employeeAnnouncements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={`border-r-4 ${
                    announcement.priority === 'urgent'
                      ? 'border-r-red-500'
                      : announcement.priority === 'important'
                      ? 'border-r-amber-500'
                      : 'border-r-green-500'
                  } hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-bold text-base">{announcement.title}</h4>
                      <Badge className={`${PRIORITY_COLORS[announcement.priority]} text-xs border`}>
                        {PRIORITY_LABELS[announcement.priority]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {TARGET_ROLE_LABELS[announcement.targetRole]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{announcement.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">قائمة المهام</h3>
              <div className="space-y-3">
                {[
                  { task: 'مراجعة ملفات الطلاب الجدد', status: 'done', priority: 'high' },
                  { task: 'تحديث بيانات الدورات', status: 'done', priority: 'medium' },
                  { task: 'إعداد التقرير الشهري', status: 'pending', priority: 'high' },
                  { task: 'تنسيق جدول الامتحانات', status: 'pending', priority: 'high' },
                  { task: 'مراجعة طلبات التخرج', status: 'pending', priority: 'medium' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.status === 'done'
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-amber-50 border-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className={`text-sm ${item.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                        {item.task}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.priority === 'high' ? 'text-red-600 border-red-300' : 'text-amber-600 border-amber-300'
                      }`}
                    >
                      {item.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
