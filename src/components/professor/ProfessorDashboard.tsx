'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  BookOpen,
  Users,
  Calendar,
  Megaphone,
} from 'lucide-react'
import {
  useStore,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
} from '@/lib/store'

export default function ProfessorDashboard() {
  const { announcements: allAnnouncements, stats } = useStore()

  // Filter announcements for professors
  const professorAnnouncements = allAnnouncements.filter(
    a => a.targetRole === 'all' || a.targetRole === 'professors'
  )

  // Separate urgent and normal
  const urgentAnnouncements = professorAnnouncements.filter(a => a.priority === 'urgent')
  const otherAnnouncements = professorAnnouncements.filter(a => a.priority !== 'urgent')

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{professorAnnouncements.length}</p>
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
              <BookOpen className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.totalCourses}</p>
              <p className="text-sm text-muted-foreground">المقررات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">٣٢</p>
              <p className="text-sm text-muted-foreground">الطلاب المسجلين</p>
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
            {professorAnnouncements.length > 0 && (
              <Badge variant="destructive" className="mr-2 min-w-[24px] text-center text-xs">
                {professorAnnouncements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1">
            <Calendar className="w-4 h-4 ml-2" />
            الجدول الأسبوعي
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

          {/* Other Announcements */}
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            جميع الإعلانات
          </h3>
          <div className="space-y-3">
            {professorAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد إعلانات حالياً</p>
                </CardContent>
              </Card>
            ) : (
              professorAnnouncements.map((announcement) => (
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

        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">الجدول الأسبوعي</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="p-3 text-right font-bold bg-slate-50">الوقت</th>
                      <th className="p-3 text-center font-bold bg-slate-50">الأحد</th>
                      <th className="p-3 text-center font-bold bg-slate-50">الاثنين</th>
                      <th className="p-3 text-center font-bold bg-slate-50">الثلاثاء</th>
                      <th className="p-3 text-center font-bold bg-slate-50">الأربعاء</th>
                      <th className="p-3 text-center font-bold bg-slate-50">الخميس</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">٨:٠٠ - ٩:٣٠</td>
                      <td className="p-3 text-center bg-blue-50 rounded-lg">برمجة الحاسب<br/>CS102</td>
                      <td className="p-3 text-center">—</td>
                      <td className="p-3 text-center bg-emerald-50">قواعد البيانات<br/>CS202</td>
                      <td className="p-3 text-center">—</td>
                      <td className="p-3 text-center bg-amber-50">هياكل البيانات<br/>CS103</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">١٠:٠٠ - ١١:٣٠</td>
                      <td className="p-3 text-center bg-emerald-50">قواعد البيانات<br/>CS202</td>
                      <td className="p-3 text-center bg-blue-50 rounded-lg">أنظمة التشغيل<br/>OS101</td>
                      <td className="p-3 text-center">—</td>
                      <td className="p-3 text-center bg-blue-50">برمجة الحاسب<br/>CS102</td>
                      <td className="p-3 text-center">—</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium">١٢:٠٠ - ١:٣٠</td>
                      <td className="p-3 text-center">—</td>
                      <td className="p-3 text-center bg-amber-50 rounded-lg">هياكل البيانات<br/>CS103</td>
                      <td className="p-3 text-center bg-blue-50">أنظمة التشغيل<br/>OS101</td>
                      <td className="p-3 text-center">—</td>
                      <td className="p-3 text-center bg-emerald-50">قواعد البيانات<br/>CS202</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
