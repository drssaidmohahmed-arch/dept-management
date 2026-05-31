'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookOpen, Clock } from 'lucide-react'
import { useCourses } from '@/lib/store'

const SEMESTER_LABELS: Record<number, string> = {
  1: 'الفصل الأول',
  2: 'الفصل الثاني',
  3: 'الفصل الثالث',
  4: 'الفصل الرابع',
  5: 'الفصل الخامس',
  6: 'الفصل السادس',
}

export default function AcademicCourses() {
  const courses = useCourses()
  const [selectedSemester, setSelectedSemester] = useState<number>(1)

  const filteredCourses = courses.filter(c => c.semester === selectedSemester)
  const totalHours = filteredCourses.reduce((acc, c) => acc + c.hours, 0)
  const gradedCourses = filteredCourses.filter(c => c.grade)

  // Calculate GPA (simplified)
  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0,
  }

  const totalPoints = gradedCourses.reduce(
    (acc, c) => acc + (gradePoints[c.grade || ''] || 0) * c.hours,
    0
  )
  const totalGradedHours = gradedCourses.reduce((acc, c) => acc + c.hours, 0)
  const gpa = totalGradedHours > 0 ? (totalPoints / totalGradedHours).toFixed(2) : '—'

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          المقررات الدراسية
        </CardTitle>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={String(selectedSemester)} onValueChange={(v) => setSelectedSemester(Number(v))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <SelectItem key={sem} value={String(sem)}>
                  {SEMESTER_LABELS[sem]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-sm">
            <Clock className="w-3.5 h-3.5 ml-1" />
            {totalHours} ساعة
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-800 text-sm border border-emerald-300">
            المعدل: {gpa}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-3 text-right font-bold bg-slate-50 rounded-tr-lg">#</th>
                <th className="p-3 text-right font-bold bg-slate-50">رمز المقرر</th>
                <th className="p-3 text-right font-bold bg-slate-50">اسم المقرر</th>
                <th className="p-3 text-center font-bold bg-slate-50">الساعات</th>
                <th className="p-3 text-center font-bold bg-slate-50 rounded-tl-lg">التقدير</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, index) => (
                <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-muted-foreground">{index + 1}</td>
                  <td className="p-3 font-mono font-medium text-blue-700">{course.code}</td>
                  <td className="p-3">{course.name}</td>
                  <td className="p-3 text-center">{course.hours}</td>
                  <td className="p-3 text-center">
                    {course.grade ? (
                      <Badge
                        className={`text-xs border ${
                          gradePoints[course.grade] && gradePoints[course.grade] >= 3.5
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : gradePoints[course.grade] && gradePoints[course.grade] >= 2.5
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : course.grade
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {course.grade}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>لا توجد مقررات لهذا الفصل</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
