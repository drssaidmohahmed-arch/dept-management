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

    let query = supabase.from('advising_sessions').select('*');

    // Filter by student_id
    const studentId = searchParams.get('student_id');
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    // Filter by advisor_id
    const advisorId = searchParams.get('advisor_id');
    if (advisorId) {
      query = query.eq('advisor_id', advisorId);
    }

    // Filter by session_type
    const sessionType = searchParams.get('session_type');
    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }

    const { data, error } = await query.order('session_date', { ascending: false });

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
      advisor_id,
      session_date,
      session_type,
      topic,
      notes,
      recommendations,
      follow_up_required,
    } = body;

    if (!student_id || !advisor_id || !session_date) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('advising_sessions')
      .insert({
        student_id,
        advisor_id,
        session_date,
        session_type: session_type || 'academic',
        topic: topic || '',
        notes: notes || '',
        recommendations: recommendations || '',
        follow_up_required: follow_up_required ?? false,
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
        { error: 'معرف الجلسة مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('advising_sessions')
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
        { error: 'معرف الجلسة مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('advising_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
