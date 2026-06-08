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

    let query = supabase.from('professional_development').select('*');

    // Filter by faculty_id
    const facultyId = searchParams.get('faculty_id');
    if (facultyId) {
      query = query.eq('faculty_id', facultyId);
    }

    // Filter by activity_type
    const activityType = searchParams.get('activity_type');
    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
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
      faculty_id,
      faculty_name,
      activity_type,
      title,
      provider,
      location,
      start_date,
      end_date,
      status,
      hours,
    } = body;

    if (!faculty_id || !faculty_name || !activity_type || !title) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('professional_development')
      .insert({
        faculty_id,
        faculty_name,
        activity_type,
        title,
        provider: provider || '',
        location: location || '',
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || 'planned',
        hours: hours ?? 0,
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
        { error: 'معرف النشاط مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('professional_development')
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
        { error: 'معرف النشاط مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('professional_development')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
