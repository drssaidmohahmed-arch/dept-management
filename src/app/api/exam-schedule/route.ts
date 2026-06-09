import { NextRequest, NextResponse } from 'next/server';

// In-memory store for exam schedule (no Supabase table needed)
interface ExamScheduleEntry {
  id: string;
  courseCode: string;
  courseName: string;
  roomId: string;
  roomName: string;
  instructorName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  semester: number;
  academicYear: string;
  createdAt: string;
}

const examSchedule: ExamScheduleEntry[] = [
  {
    id: 'exam-1', courseCode: 'CS101', courseName: 'مقدمة في علوم الحاسب',
    roomId: 'room-1', roomName: 'قاعة A101', instructorName: 'د. أحمد محمد الشريف',
    examDate: '2025-06-15', startTime: '09:00', endTime: '11:00',
    status: 'scheduled', semester: 3, academicYear: '1446', createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-2', courseCode: 'CS201', courseName: 'هياكل البيانات',
    roomId: 'room-2', roomName: 'قاعة B201', instructorName: 'د. أحمد محمد الشريف',
    examDate: '2025-06-16', startTime: '09:00', endTime: '11:30',
    status: 'scheduled', semester: 3, academicYear: '1446', createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-3', courseCode: 'MATH101', courseName: 'رياضيات متقدمة',
    roomId: 'room-1', roomName: 'قاعة A101', instructorName: 'د. فاطمة علي الحسن',
    examDate: '2025-06-17', startTime: '13:00', endTime: '15:00',
    status: 'scheduled', semester: 3, academicYear: '1446', createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-4', courseCode: 'CS202', courseName: 'قواعد البيانات',
    roomId: 'room-3', roomName: 'معمل الحاسب 1', instructorName: 'د. فاطمة علي الحسن',
    examDate: '2025-06-18', startTime: '09:00', endTime: '11:00',
    status: 'scheduled', semester: 3, academicYear: '1446', createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-5', courseCode: 'CS305', courseName: 'ذكاء اصطناعي',
    roomId: 'room-2', roomName: 'قاعة B201', instructorName: 'د. فاطمة علي الحسن',
    examDate: '2025-06-19', startTime: '09:00', endTime: '12:00',
    status: 'scheduled', semester: 3, academicYear: '1446', createdAt: new Date().toISOString(),
  },
  {
    id: 'exam-6', courseCode: 'CS205', courseName: 'شبكات الحاسب ١',
    roomId: 'room-1', roomName: 'قاعة A101', instructorName: 'د. خالد عبدالله العمري',
    examDate: '2025-06-15', startTime: '13:00', endTime: '15:00',
    status: 'scheduled', semester: 3, academicYear: '1446', createdAt: new Date().toISOString(),
  },
];

let counter = examSchedule.length;

function generateId(): string {
  counter++;
  return `exam-${counter}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let items = [...examSchedule];

  const status = searchParams.get('status');
  if (status) items = items.filter((e) => e.status === status);

  const courseId = searchParams.get('courseCode');
  if (courseId) items = items.filter((e) => e.courseCode === courseId);

  return NextResponse.json(items.sort((a, b) => a.examDate.localeCompare(b.examDate) || a.startTime.localeCompare(b.startTime)));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { courseCode, courseName, roomId, roomName, instructorName, examDate, startTime, endTime } = body;

  if (!courseCode || !examDate || !startTime || !endTime) {
    return NextResponse.json({ error: 'الحقول المطلوبة غير مكتملة' }, { status: 400 });
  }

  // Conflict detection: same room, same date, overlapping time
  const conflict = examSchedule.find(
    (e) =>
      e.roomId === roomId &&
      e.examDate === examDate &&
      e.status !== 'cancelled' &&
      startTime < e.endTime &&
      endTime > e.startTime
  );

  if (conflict) {
    return NextResponse.json(
      {
        error: 'تعارض في الموعد!',
        details: `القاعة ${conflict.roomName} محجوزة من ${conflict.startTime} إلى ${conflict.endTime} لمقرر ${conflict.courseName}`,
      },
      { status: 409 }
    );
  }

  const item: ExamScheduleEntry = {
    id: generateId(),
    courseCode: courseCode || '',
    courseName: courseName || '',
    roomId: roomId || '',
    roomName: roomName || '',
    instructorName: instructorName || '',
    examDate: examDate || '',
    startTime: startTime || '',
    endTime: endTime || '',
    status: 'scheduled',
    semester: body.semester || 3,
    academicYear: body.academicYear || '1446',
    createdAt: new Date().toISOString(),
  };

  examSchedule.push(item);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'معرف الامتحان مطلوب' }, { status: 400 });
  }

  const index = examSchedule.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 });
  }

  const updated = { ...examSchedule[index] };
  if (body.courseCode !== undefined) updated.courseCode = body.courseCode;
  if (body.courseName !== undefined) updated.courseName = body.courseName;
  if (body.roomId !== undefined) updated.roomId = body.roomId;
  if (body.roomName !== undefined) updated.roomName = body.roomName;
  if (body.instructorName !== undefined) updated.instructorName = body.instructorName;
  if (body.examDate !== undefined) updated.examDate = body.examDate;
  if (body.startTime !== undefined) updated.startTime = body.startTime;
  if (body.endTime !== undefined) updated.endTime = body.endTime;
  if (body.status !== undefined) updated.status = body.status;

  // Conflict detection for room/time changes
  if (body.roomId || body.examDate || body.startTime || body.endTime) {
    const conflict = examSchedule.find(
      (e) =>
        e.id !== id &&
        e.roomId === updated.roomId &&
        e.examDate === updated.examDate &&
        e.status !== 'cancelled' &&
        updated.startTime < e.endTime &&
        updated.endTime > e.startTime
    );
    if (conflict) {
      return NextResponse.json(
        {
          error: 'تعارض في الموعد!',
          details: `القاعة ${conflict.roomName} محجوزة من ${conflict.startTime} إلى ${conflict.endTime} لمقرر ${conflict.courseName}`,
        },
        { status: 409 }
      );
    }
  }

  examSchedule[index] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'معرف الامتحان مطلوب' }, { status: 400 });
  }

  const index = examSchedule.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 });
  }

  examSchedule.splice(index, 1);
  return NextResponse.json({ success: true });
}