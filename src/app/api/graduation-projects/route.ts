import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

function sanitizeSearchInput(input: string): string {
  return input.replace(/[%_.(),]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from('graduation_projects').select('*');

    // Filter by student_id
    const studentId = searchParams.get('student_id');
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    // Filter by supervisor_id
    const supervisorId = searchParams.get('supervisor_id');
    if (supervisorId) {
      query = query.eq('supervisor_id', supervisorId);
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by project_type
    const projectType = searchParams.get('project_type');
    if (projectType) {
      query = query.eq('project_type', projectType);
    }

    // Search by title (sanitized)
    const search = searchParams.get('search');
    if (search) {
      const sanitized = sanitizeSearchInput(search);
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }
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
      student_id,
      student_name,
      supervisor_id,
      supervisor_name,
      title,
      description,
      project_type,
      status,
      grade,
      submission_date,
      defense_date,
    } = body;

    if (!student_id || !student_name || !title) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('graduation_projects')
      .insert({
        student_id,
        student_name,
        supervisor_id: supervisor_id || null,
        supervisor_name: supervisor_name || '',
        title,
        description: description || '',
        project_type: project_type || 'software',
        status: status || 'proposed',
        grade: grade || null,
        submission_date: submission_date || null,
        defense_date: defense_date || null,
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
        { error: 'معرف المشروع مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('graduation_projects')
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
        { error: 'معرف المشروع مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('graduation_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
