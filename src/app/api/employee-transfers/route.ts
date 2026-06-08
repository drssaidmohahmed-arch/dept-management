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

    let query = supabase.from('employee_transfers').select('*');

    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
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

    const { data, error } = await supabase
      .from('employee_transfers')
      .insert({
        employee_id: body.employee_id,
        employee_name: body.employee_name,
        current_position: body.current_position,
        requested_rank: body.requested_rank,
        requested_specialization: body.requested_specialization,
        requested_qualification: body.requested_qualification,
        courses_to_teach: body.courses_to_teach || [],
        reason: body.reason,
        supporting_docs: body.supporting_docs || [],
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
      return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('employee_transfers')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update member role to professor and create faculty profile
    if (updateFields.status === 'approved' && data) {
      const rankMap: Record<string, string> = {
        'professor': 'أستاذ',
        'associate_professor': 'أستاذ مشارك',
        'assistant_professor': 'أستاذ مساعد',
        'lecturer': 'محاضر',
        'teaching_assistant': 'معيد',
      };

      await supabase
        .from('members')
        .update({
          role: 'professor',
          position: rankMap[data.requested_rank] || 'محاضر',
        })
        .eq('id', data.employee_id);

      // Create faculty profile
      await supabase
        .from('faculty_profiles')
        .upsert({
          member_id: data.employee_id,
          specialization: data.requested_specialization,
          rank: data.requested_rank,
          qualification: data.requested_qualification,
          bio: '',
          research_interests: [],
        }, { onConflict: 'member_id' });
    }

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
      return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('employee_transfers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
