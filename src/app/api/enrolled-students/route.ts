import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Search by student ID or name
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`student_id.ilike.%${search}%,student_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order('student_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
