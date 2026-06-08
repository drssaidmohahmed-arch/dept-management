import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { courseSectionsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('course_sections').select('*');
      const courseCode = searchParams.get('courseCode');
      if (courseCode) query = query.eq('course_code', courseCode);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = courseSectionsStore.getAll();
  const courseCode = searchParams.get('courseCode');
  if (courseCode) items = items.filter((s) => s.courseCode === courseCode);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('course_sections').insert({
        course_code: body.course_code, section_number: body.section_number || 1,
        professor_name: body.professor_name || '', room_id: body.room_id || null,
        room_name: body.room_name || '', capacity: body.capacity || 40,
        enrolled: body.enrolled || 0, schedule_days: body.schedule_days || [],
        schedule_time: body.schedule_time || '', semester: body.semester || 1,
        academic_year: body.academic_year || '', status: body.status || 'open',
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = courseSectionsStore.add({
    id: genId('cs'), courseCode: body.course_code || '',
    sectionNumber: body.section_number || 1, professorName: body.professor_name || '',
    roomId: body.room_id, roomName: body.room_name || '', capacity: body.capacity || 40,
    enrolled: body.enrolled || 0, scheduleDays: body.schedule_days || [],
    scheduleTime: body.schedule_time || '', semester: body.semester || 1,
    academicYear: body.academic_year || '', status: body.status || 'open',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (body.course_code !== undefined) updates.course_code = body.course_code;
      if (body.section_number !== undefined) updates.section_number = body.section_number;
      if (body.professor_name !== undefined) updates.professor_name = body.professor_name;
      if (body.room_id !== undefined) updates.room_id = body.room_id;
      if (body.room_name !== undefined) updates.room_name = body.room_name;
      if (body.capacity !== undefined) updates.capacity = body.capacity;
      if (body.enrolled !== undefined) updates.enrolled = body.enrolled;
      if (body.schedule_days !== undefined) updates.schedule_days = body.schedule_days;
      if (body.schedule_time !== undefined) updates.schedule_time = body.schedule_time;
      if (body.semester !== undefined) updates.semester = body.semester;
      if (body.academic_year !== undefined) updates.academic_year = body.academic_year;
      if (body.status !== undefined) updates.status = body.status;

      const { data, error } = await supabase.from('course_sections').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = courseSectionsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'الشعبة غير موجودة' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('course_sections').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  courseSectionsStore.delete(id);
  return NextResponse.json({ success: true });
}
