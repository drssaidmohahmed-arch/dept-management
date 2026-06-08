import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('course_sections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase
      .from('course_sections')
      .insert({
        course_code: body.courseCode,
        section_number: body.sectionNumber || 1,
        professor_name: body.professorName || '',
        room_id: body.roomId,
        room_name: body.roomName || '',
        capacity: body.capacity || 40,
        enrolled: body.enrolled || 0,
        schedule_days: body.scheduleDays || [],
        schedule_time: body.scheduleTime || '',
        semester: body.semester || 1,
        academic_year: body.academicYear || '',
        status: body.status || 'open',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { data, error } = await supabase
      .from('course_sections')
      .update({
        course_code: body.courseCode,
        section_number: body.sectionNumber,
        professor_name: body.professorName,
        room_id: body.roomId,
        room_name: body.roomName,
        capacity: body.capacity,
        enrolled: body.enrolled,
        schedule_days: body.scheduleDays,
        schedule_time: body.scheduleTime,
        semester: body.semester,
        academic_year: body.academicYear,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
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
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }
    const { error } = await supabase.from('course_sections').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
