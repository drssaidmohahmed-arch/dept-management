import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

function sanitizeSearchInput(input: string): string {
  // Remove characters that could break Supabase PostgREST filter syntax
  return input.replace(/[%_.(),]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from('enrolled_students').select('*');

    // Filter by course code
    const courseCode = searchParams.get('courseCode');
    if (courseCode) {
      query = query.eq('course_code', courseCode);
    }

    // Filter by semester
    const semester = searchParams.get('semester');
    if (semester) {
      query = query.eq('semester', Number(semester));
    }

    // Filter by student ID
    const studentId = searchParams.get('studentId');
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    // Search by student ID or name (sanitized)
    const search = searchParams.get('search');
    if (search) {
      const sanitized = sanitizeSearchInput(search);
      if (sanitized) {
        query = query.or(`student_id.ilike.%${sanitized}%,student_name.ilike.%${sanitized}%`);
      }
    }

    const { data, error } = await query.order('student_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { student_id, student_name, course_code, semester, status } = body;

    if (!student_id || !student_name || !course_code || !semester) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('enrolled_students')
      .insert({
        student_id,
        student_name,
        course_code,
        semester: Number(semester),
        status: status || 'active',
        attendance: 0,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'الطالب مسجل بالفعل في هذا المقرر' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, grade, mid_term_mark, final_mark, assignments_mark, attendance, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف التسجيل مطلوب' },
        { status: 400 }
      );
    }

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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'معرف التسجيل مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('enrolled_students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
