import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from('performance_evaluations').select('*');

    // Filter by faculty_id
    const facultyId = searchParams.get('faculty_id');
    if (facultyId) {
      query = query.eq('faculty_id', facultyId);
    }

    // Filter by evaluation_type
    const evaluationType = searchParams.get('evaluation_type');
    if (evaluationType) {
      query = query.eq('evaluation_type', evaluationType);
    }

    // Filter by semester
    const semester = searchParams.get('semester');
    if (semester) {
      query = query.eq('semester', Number(semester));
    }

    // Filter by academic_year
    const academicYear = searchParams.get('academic_year');
    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

    const {
      faculty_id,
      faculty_name,
      evaluation_type,
      academic_year,
      semester,
      teaching_score,
      research_score,
      service_score,
      overall_score,
      comments,
    } = body;

    if (!faculty_id || !evaluation_type || !semester || !academic_year) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('performance_evaluations')
      .insert({
        faculty_id,
        faculty_name: faculty_name || '',
        evaluation_type,
        academic_year,
        semester: Number(semester),
        teaching_score: teaching_score ?? 0,
        research_score: research_score ?? 0,
        service_score: service_score ?? 0,
        overall_score: overall_score ?? 0,
        comments: comments || '',
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
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف التقييم مطلوب' },
        { status: 400 }
      );
    }

    // Convert semester to number if present
    if (updateFields.semester !== undefined) {
      updateFields.semester = Number(updateFields.semester);
    }

    const { data, error } = await supabase
      .from('performance_evaluations')
      .update(updateFields)
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
        { error: 'معرف التقييم مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('performance_evaluations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
