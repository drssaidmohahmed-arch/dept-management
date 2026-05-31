'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Bell,
  Megaphone,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react'
import {
  useStore,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TARGET_ROLE_LABELS,
  type Priority,
  type TargetRole,
} from '@/lib/store'

export default function HODDashboard() {
  const { announcements, stats, addAnnouncement, deleteAnnouncement } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [targetRole, setTargetRole] = useState<TargetRole>('all')

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return

    addAnnouncement({
      title,
      content,
      priority,
      targetRole,
      date: new Date().toISOString().split('T')[0],
      authorName: 'أ.د. محمد العلي',
    })

    setTitle('')
    setContent('')
    setPriority('normal')
    setTargetRole('all')
    setDialogOpen(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-700">{stats.totalAnnouncements}</p>
              <p className="text-xs text-muted-foreground">إجمالي الإعلانات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-700">{stats.urgentCount}</p>
              <p className="text-xs text-muted-foreground">عاجل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-700">{stats.importantCount}</p>
              <p className="text-xs text-muted-foreground">مهم</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-700">{stats.professorAnnouncements}</p>
              <p className="text-xs text-muted-foreground">للهيئة التدريسية</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-cyan-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-cyan-700">{stats.employeeAnnouncements}</p>
              <p className="text-xs text-muted-foreground">للموظفين</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-orange-700">{stats.studentAnnouncements}</p>
              <p className="text-xs text-muted-foreground">للطلاب</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-announcements" className="w-full">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="all-announcements">
              <Bell className="w-4 h-4 ml-2" />
              جميع الإعلانات
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 ml-2" />
              الإحصائيات
            </TabsTrigger>
          </TabsList>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 ml-2" />
                إنشاء إعلان جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إنشاء إعلان جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الإعلان</Label>
                  <Input
                    id="title"
                    placeholder="أدخل عنوان الإعلان..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">محتوى الإعلان</Label>
                  <Textarea
                    id="content"
                    placeholder="أدخل محتوى الإعلان بالتفصيل..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الأولوية</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">عاجل</SelectItem>
                        <SelectItem value="important">مهم</SelectItem>
                        <SelectItem value="normal">عادي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الفئة المستهدفة</Label>
                    <Select value={targetRole} onValueChange={(v) => setTargetRole(v as TargetRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الجميع</SelectItem>
                        <SelectItem value="professors">أعضاء هيئة التدريس</SelectItem>
                        <SelectItem value="employees">الموظفون الإداريون</SelectItem>
                        <SelectItem value="students">الطلاب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!title.trim() || !content.trim()}
                >
                  <Megaphone className="w-4 h-4 ml-2" />
                  نشر الإعلان
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="all-announcements">
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد إعلانات حالياً. قم بإنشاء إعلان جديد.</p>
                </CardContent>
              </Card>
            ) : (
              announcements.map((announcement) => (
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
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
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
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                          {announcement.content}
                        </p>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  إحصائيات الإعلانات حسب الأولوية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-sm font-medium text-red-800">عاجل</span>
                    <span className="text-lg font-bold text-red-700">{stats.urgentCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-sm font-medium text-amber-800">مهم</span>
                    <span className="text-lg font-bold text-amber-700">{stats.importantCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                    <span className="text-sm font-medium text-green-800">عادي</span>
                    <span className="text-lg font-bold text-green-700">{stats.normalCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  إحصائيات حسب الفئة المستهدفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-sm font-medium">الإعلانات العامة</span>
                    <span className="text-lg font-bold">{announcements.filter(a => a.targetRole === 'all').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="text-sm font-medium text-blue-800">أعضاء هيئة التدريس</span>
                    <span className="text-lg font-bold text-blue-700">{stats.professorAnnouncements}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-50 border border-cyan-100">
                    <span className="text-sm font-medium text-cyan-800">الموظفون الإداريون</span>
                    <span className="text-lg font-bold text-cyan-700">{stats.employeeAnnouncements}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                    <span className="text-sm font-medium text-orange-800">الطلاب</span>
                    <span className="text-lg font-bold text-orange-700">{stats.studentAnnouncements}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ملخص عام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">{stats.totalAnnouncements}</p>
                    <p className="text-sm text-muted-foreground mt-1">إجمالي الإعلانات</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-2xl font-bold text-blue-700">{stats.totalRequests}</p>
                    <p className="text-sm text-muted-foreground mt-1">طلبات الطلاب</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <p className="text-2xl font-bold text-orange-700">{stats.pendingRequests}</p>
                    <p className="text-sm text-muted-foreground mt-1">طلبات معلقة</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-cyan-50 border border-cyan-100">
                    <p className="text-2xl font-bold text-cyan-700">{stats.totalCourses}</p>
                    <p className="text-sm text-muted-foreground mt-1">المقررات الدراسية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
