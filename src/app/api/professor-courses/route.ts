import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { professorCoursesStore, genId } from '@/lib/local-data';

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
      const { data, error } = await supabase.from('professor_courses').select('*').order('course_code', { ascending: true });
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  return NextResponse.json(professorCoursesStore.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Input validation
  if (!body.course_code || !body.professor_name) {
    return NextResponse.json({ error: 'حقل كود المقرر واسم الأستاذ مطلوبان' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('professor_courses')
        .insert({
          course_code: body.course_code,
          name: body.name || '',
          hours: body.hours !== undefined ? body.hours : 3,
          professor_name: body.professor_name,
          semester: body.semester || null,
          enrolled_count: body.enrolled_count !== undefined ? body.enrolled_count : 0,
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
  const item = professorCoursesStore.add({
    id: crypto.randomUUID(),
    code: body.course_code,
    name: body.name || '',
    hours: body.hours !== undefined ? body.hours : 3,
    professorName: body.professor_name,
    semester: body.semester || 1,
    enrolledCount: body.enrolled_count !== undefined ? body.enrolled_count : 0,
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف التخصيص مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (updateFields.course_code !== undefined) updates.course_code = updateFields.course_code;
      if (updateFields.name !== undefined) updates.name = updateFields.name;
      if (updateFields.hours !== undefined) updates.hours = updateFields.hours;
      if (updateFields.professor_name !== undefined) updates.professor_name = updateFields.professor_name;
      if (updateFields.semester !== undefined) updates.semester = updateFields.semester;
      if (updateFields.enrolled_count !== undefined) updates.enrolled_count = updateFields.enrolled_count;

      const { data, error } = await supabase
        .from('professor_courses')
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
  if (updateFields.course_code !== undefined) updates.code = updateFields.course_code;
  if (updateFields.name !== undefined) updates.name = updateFields.name;
  if (updateFields.hours !== undefined) updates.hours = updateFields.hours;
  if (updateFields.professor_name !== undefined) updates.professorName = updateFields.professor_name;
  if (updateFields.semester !== undefined) updates.semester = updateFields.semester;
  if (updateFields.enrolled_count !== undefined) updates.enrolledCount = updateFields.enrolled_count;

  const updated = professorCoursesStore.update(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'التخصيص غير موجود' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف التخصيص مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('professor_courses').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  professorCoursesStore.delete(id);
  return NextResponse.json({ success: true });
}
