import { NextRequest, NextResponse } from 'next/server';

// In-memory waitlist store (for demo purposes)
const waitlistEntries: Record<string, {
  id: string;
  sectionId: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  addedAt: string;
}[]> = {};

let waitlistCounter = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');
  const courseCode = searchParams.get('courseCode');
  const studentId = searchParams.get('studentId');

  let results: typeof waitlistEntries[string] = [];

  if (sectionId) {
    results = waitlistEntries[sectionId] || [];
  } else if (courseCode) {
    // Search across all sections for a given course
    for (const entries of Object.values(waitlistEntries)) {
      const matching = entries.filter((e) => e.courseCode === courseCode);
      results.push(...matching);
    }
  } else if (studentId) {
    for (const entries of Object.values(waitlistEntries)) {
      const matching = entries.filter((e) => e.studentId === studentId);
      results.push(...matching);
    }
  } else {
    // Return all
    for (const entries of Object.values(waitlistEntries)) {
      results.push(...entries);
    }
  }

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { sectionId, courseCode, studentId, studentName } = body;

  if (!sectionId || !courseCode || !studentId || !studentName) {
    return NextResponse.json({ error: 'البيانات المطلوبة غير مكتملة' }, { status: 400 });
  }

  // Check if already on waitlist
  if (!waitlistEntries[sectionId]) {
    waitlistEntries[sectionId] = [];
  }

  const existing = waitlistEntries[sectionId].find((e) => e.studentId === studentId);
  if (existing) {
    return NextResponse.json({ error: 'الطالب موجود بالفعل في قائمة الانتظار' }, { status: 409 });
  }

  const entry = {
    id: `wl-${++waitlistCounter}`,
    sectionId,
    courseCode,
    studentId,
    studentName,
    addedAt: new Date().toISOString(),
  };

  waitlistEntries[sectionId].push(entry);

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, sectionId, studentId } = body;

  if (!id && !sectionId && !studentId) {
    return NextResponse.json({ error: 'المعرف أو بيانات الطالب مطلوبة' }, { status: 400 });
  }

  if (id) {
    for (const sectionKey of Object.keys(waitlistEntries)) {
      const idx = waitlistEntries[sectionKey].findIndex((e) => e.id === id);
      if (idx !== -1) {
        waitlistEntries[sectionKey].splice(idx, 1);
        return NextResponse.json({ success: true });
      }
    }
  }

  if (sectionId && studentId) {
    const entries = waitlistEntries[sectionId];
    if (entries) {
      const idx = entries.findIndex((e) => e.studentId === studentId);
      if (idx !== -1) {
        entries.splice(idx, 1);
        return NextResponse.json({ success: true });
      }
    }
  }

  return NextResponse.json({ error: 'لم يتم العثور على السجل' }, { status: 404 });
}
