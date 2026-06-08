import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teachingAssignmentsStore, genId } from '@/lib/local-data';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

// Helper: try to get Supabase client, returns null if connection fails
async function getSupabaseOrFallback() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET() {
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('teaching_assignments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  return NextResponse.json(teachingAssignmentsStore.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Input validation
  if (!body.faculty_name || !body.course_code || !body.semester || !body.academic_year) {
    return NextResponse.json({ error: 'حقول اسم الأستاذ وكود المقرر والفصل والسنة الأكاديمية مطلوبة' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('teaching_assignments')
        .insert({
          faculty_name: body.faculty_name,
          course_code: body.course_code,
          course_name: body.course_name || '',
          semester: body.semester,
          academic_year: body.academic_year,
          teaching_hours: body.teaching_hours !== undefined ? body.teaching_hours : 0,
          notes: body.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = teachingAssignmentsStore.add({
    id: genId('ta'),
    professorName: body.faculty_name,
    courseCode: body.course_code,
    courseName: body.course_name || '',
    section: body.section || 1,
    roomName: body.room_name || '',
    day: body.day || 'saturday',
    startTime: body.start_time || '08:00',
    endTime: body.end_time || '09:30',
    sessionType: body.session_type || 'lecture',
    academicYear: body.academic_year,
    semester: Number(body.semester) || 1,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف التكليف مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (updateFields.faculty_name !== undefined) updates.faculty_name = updateFields.faculty_name;
      if (updateFields.course_code !== undefined) updates.course_code = updateFields.course_code;
      if (updateFields.course_name !== undefined) updates.course_name = updateFields.course_name;
      if (updateFields.semester !== undefined) updates.semester = updateFields.semester;
      if (updateFields.academic_year !== undefined) updates.academic_year = updateFields.academic_year;
      if (updateFields.teaching_hours !== undefined) updates.teaching_hours = updateFields.teaching_hours;
      if (updateFields.notes !== undefined) updates.notes = updateFields.notes;

      const { data, error } = await supabase
        .from('teaching_assignments')
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
  const updates: Record<string, unknown> = {};
  if (updateFields.faculty_name !== undefined) updates.professorName = updateFields.faculty_name;
  if (updateFields.course_code !== undefined) updates.courseCode = updateFields.course_code;
  if (updateFields.course_name !== undefined) updates.courseName = updateFields.course_name;
  if (updateFields.semester !== undefined) updates.semester = Number(updateFields.semester) || 1;
  if (updateFields.academic_year !== undefined) updates.academicYear = updateFields.academic_year;
  if (updateFields.teaching_hours !== undefined) updates.teachingHours = updateFields.teaching_hours;
  if (updateFields.notes !== undefined) updates.notes = updateFields.notes;
  if (updateFields.day !== undefined) updates.day = updateFields.day;
  if (updateFields.start_time !== undefined) updates.startTime = updateFields.start_time;
  if (updateFields.end_time !== undefined) updates.endTime = updateFields.end_time;
  if (updateFields.section !== undefined) updates.section = updateFields.section;
  if (updateFields.room_name !== undefined) updates.roomName = updateFields.room_name;
  if (updateFields.session_type !== undefined) updates.sessionType = updateFields.session_type;

  const updated = teachingAssignmentsStore.update(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'التكليف غير موجود' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف التكليف مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('teaching_assignments').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  teachingAssignmentsStore.delete(id);
  return NextResponse.json({ success: true });
}
