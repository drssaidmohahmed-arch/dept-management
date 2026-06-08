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

    // Search by organization_name or student_name (sanitized)
    const search = searchParams.get('search');
    if (search) {
      const sanitized = sanitizeSearchInput(search);
      if (sanitized) {
        query = query.or(`organization_name.ilike.%${sanitized}%,student_name.ilike.%${sanitized}%`);
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
      student_name,
      organization_name,
      supervisor_name,
      supervisor_contact,
      training_field,
      start_date,
      end_date,
      status,
      supervisor_rating,
      advisor_rating,
      report_submitted,
    } = body;

    if (!student_id || !student_name || !organization_name) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('field_training')
      .insert({
        student_id,
        student_name,
        organization_name,
        supervisor_name: supervisor_name || '',
        supervisor_contact: supervisor_contact || '',
        training_field: training_field || 'تقنية معلومات',
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || 'planned',
        supervisor_rating: supervisor_rating ?? null,
        advisor_rating: advisor_rating ?? null,
        report_submitted: report_submitted ?? false,
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
