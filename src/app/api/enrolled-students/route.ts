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
