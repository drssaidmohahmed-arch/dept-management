import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrolledStudentsStore, genId } from '@/lib/local-data';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('fetch failed') ||
      msg.includes('enotfound') ||
      msg.includes('econnrefused') ||
      msg.includes('etimedout') ||
      msg.includes('invalid url') ||
      msg.includes('missing') ||
      msg.includes('supabase') ||
      msg.includes('network')
    );
  }
  return false;
}

// Helper: try to get Supabase client, returns null if connection fails
async function getSupabaseOrFallback() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseOrFallback();
  const { searchParams } = new URL(request.url);

  if (supabase) {
    try {
      let query = supabase.from('enrolled_students').select('*');

      const courseCode = searchParams.get('courseCode');
      if (courseCode) query = query.eq('course_code', courseCode);

      const semester = searchParams.get('semester');
      if (semester) query = query.eq('semester', Number(semester));

      const studentId = searchParams.get('studentId');
      if (studentId) query = query.eq('student_id', studentId);

      const { data, error } = await query.order('student_id', { ascending: true });

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = enrolledStudentsStore.getAll();

  const courseCode = searchParams.get('courseCode');
  if (courseCode) items = items.filter((e) => e.courseCode === courseCode);

  const semester = searchParams.get('semester');
  if (semester) items = items.filter((e) => e.semester === Number(semester));

  const studentId = searchParams.get('studentId');
  if (studentId) items = items.filter((e) => e.studentId === studentId);

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { student_id, student_name, course_code, semester, status } = body;

  if (!student_id || !student_name || !course_code || !semester) {
    return NextResponse.json({ error: 'البيانات المطلوبة غير مكتملة' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('enrolled_students')
        .insert({ student_id, student_name, course_code, semester: Number(semester), status: status || 'active', attendance: 0 })
        .select()
        .single();

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          return NextResponse.json({ error: 'الطالب مسجل بالفعل في هذا المقرر' }, { status: 409 });
        }
        throw error;
      }

      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = enrolledStudentsStore.add({
    id: genId('en'),
    studentId: body.student_id || '',
    name: body.student_name || '',
    courseCode: body.course_code || '',
    semester: Number(body.semester) || 1,
    status: body.status || 'active',
    attendance: 0,
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, grade, mid_term_mark, final_mark, assignments_mark, attendance, status } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف التسجيل مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (grade !== undefined) updates.grade = grade;
      if (mid_term_mark !== undefined) updates.mid_term_mark = mid_term_mark;
      if (final_mark !== undefined) updates.final_mark = final_mark;
      if (assignments_mark !== undefined) updates.assignments_mark = assignments_mark;
      if (attendance !== undefined) updates.attendance = attendance;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabase
        .from('enrolled_students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const { id: _id, ...uf } = body;
  const updates: Record<string, unknown> = {};
  if (uf.grade !== undefined) updates.grade = uf.grade;
  if (uf.mid_term_mark !== undefined) updates.midTermMark = uf.mid_term_mark;
  if (uf.final_mark !== undefined) updates.finalMark = uf.final_mark;
  if (uf.assignments_mark !== undefined) updates.assignmentsMark = uf.assignments_mark;
  if (uf.attendance !== undefined) updates.attendance = uf.attendance;
  if (uf.status !== undefined) updates.status = uf.status;

  const updated = enrolledStudentsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'التسجيل غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) return NextResponse.json({ error: 'معرف التسجيل مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('enrolled_students').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  enrolledStudentsStore.delete(id);
  return NextResponse.json({ success: true });
}
