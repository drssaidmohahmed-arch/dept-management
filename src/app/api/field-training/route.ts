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

    let query = supabase.from('field_training').select('*');

    // Filter by student_id
    const studentId = searchParams.get('student_id');
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by training_field
    const trainingField = searchParams.get('training_field');
    if (trainingField) {
      query = query.eq('training_field', trainingField);
    }

    // Search by organization or title (sanitized)
    const search = searchParams.get('search');
    if (search) {
      const sanitized = sanitizeSearchInput(search);
      if (sanitized) {
        query = query.or(`organization.ilike.%${sanitized}%,title.ilike.%${sanitized}%`);
      }
    }

    const { data, error } = await query.order('start_date', { ascending: false });

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
      organization,
      supervisor_name,
      training_field,
      start_date,
      end_date,
      total_hours,
      status,
      grade,
      title,
      report_url,
      notes,
    } = body;

    if (!student_id || !organization || !start_date) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('field_training')
      .insert({
        student_id,
        organization,
        supervisor_name: supervisor_name || '',
        training_field: training_field || '',
        start_date,
        end_date: end_date || null,
        total_hours: total_hours ?? 0,
        status: status || 'planned',
        grade: grade || '',
        title: title || '',
        report_url: report_url || '',
        notes: notes || '',
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
        { error: 'معرف التدريب مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('field_training')
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
        { error: 'معرف التدريب مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('field_training')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
