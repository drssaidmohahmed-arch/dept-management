'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HourglassIcon,
} from 'lucide-react'
import { useStore, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '@/lib/store'

const REQUEST_TYPES = [
  'إضافة مقرر',
  'سحب مقرر',
  'إثبات حضور',
  'طلب وثيقة',
  'تغيير شعبة',
  'أخرى',
]

export default function StudentRequests() {
  const { requests, addStudentRequest } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('إضافة مقرر')

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return

    addStudentRequest({
      title,
      description,
      type,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      studentName: 'أحمد محمد',
    })

    setTitle('')
    setDescription('')
    setType('إضافة مقرر')
    setDialogOpen(false)
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const otherRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            طلباتي
          </h3>
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {pendingRequests.length} طلب معلق
            </Badge>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 ml-2" />
              تقديم طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تقديم طلب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>نوع الطلب</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-title">عنوان الطلب</Label>
                <Input
                  id="req-title"
                  placeholder="أدخل عنوان الطلب..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-desc">تفاصيل الطلب</Label>
                <Textarea
                  id="req-desc"
                  placeholder="اشرح طلبك بالتفصيل..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!title.trim() || !description.trim()}
              >
                <ClipboardList className="w-4 h-4 ml-2" />
                إرسال الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
            <HourglassIcon className="w-4 h-4" />
            طلبات معلقة
          </h4>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}

      {/* Other Requests */}
      <div>
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          جميع الطلبات
        </h4>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد طلبات حالياً</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function RequestCard({ request }: { request: { id: string; title: string; description: string; status: string; date: string; studentName: string; type: string } }) {
  const statusIcon = {
    pending: <HourglassIcon className="w-4 h-4 text-yellow-600" />,
    approved: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    rejected: <XCircle className="w-4 h-4 text-red-600" />,
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow border-r-4 ${
        request.status === 'pending'
          ? 'border-r-amber-400'
          : request.status === 'approved'
          ? 'border-r-emerald-400'
          : 'border-r-red-400'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-bold text-base">{request.title}</h4>
              <Badge className={`${REQUEST_STATUS_COLORS[request.status]} text-xs border`}>
                {statusIcon[request.status as keyof typeof statusIcon]}
                <span className="mr-1">{REQUEST_STATUS_LABELS[request.status]}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">{request.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {request.date}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
