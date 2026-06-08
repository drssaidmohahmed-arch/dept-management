import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fieldTrainingStore, genId } from '@/lib/local-data';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('fetch failed') ||
      msg.includes('enotfound') ||
      msg.includes('econnrefused') ||
      msg.includes('etimedout') ||
      msg.includes('invalid url') ||
      msg.includes('missing') ||
      msg.includes('supabase') ||
      msg.includes('network')
    );
  }
  return false;
}

// Helper: try to get Supabase client, returns null if connection fails
async function getSupabaseOrFallback() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseOrFallback();
  const { searchParams } = new URL(request.url);

  if (supabase) {
    try {
      let query = supabase.from('field_training').select('*');
      const status = searchParams.get('status');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = fieldTrainingStore.getAll();
  const status = searchParams.get('status');
  if (status) items = items.filter((t) => t.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('field_training').insert({
        student_id: body.student_id, student_name: body.student_name,
        organization_name: body.organization_name, supervisor_name: body.supervisor_name || '',
        supervisor_contact: body.supervisor_contact || '',
        start_date: body.start_date || null, end_date: body.end_date || null,
        training_field: body.training_field || '', status: body.status || 'planned',
        supervisor_rating: body.supervisor_rating || null, advisor_rating: body.advisor_rating || null,
        report_submitted: body.report_submitted ?? false,
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = fieldTrainingStore.add({
    id: genId('ft'), studentId: body.student_id || '', studentName: body.student_name || '',
    organizationName: body.organization_name || '', supervisorName: body.supervisor_name || '',
    supervisorContact: body.supervisor_contact || '', startDate: body.start_date,
    endDate: body.end_date, trainingField: body.training_field || '',
    status: body.status || 'planned', supervisorRating: body.supervisor_rating,
    advisorRating: body.advisor_rating, reportSubmitted: body.report_submitted ?? false,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (body.student_id !== undefined) updates.student_id = body.student_id;
      if (body.student_name !== undefined) updates.student_name = body.student_name;
      if (body.organization_name !== undefined) updates.organization_name = body.organization_name;
      if (body.supervisor_name !== undefined) updates.supervisor_name = body.supervisor_name;
      if (body.supervisor_contact !== undefined) updates.supervisor_contact = body.supervisor_contact;
      if (body.start_date !== undefined) updates.start_date = body.start_date;
      if (body.end_date !== undefined) updates.end_date = body.end_date;
      if (body.training_field !== undefined) updates.training_field = body.training_field;
      if (body.status !== undefined) updates.status = body.status;
      if (body.supervisor_rating !== undefined) updates.supervisor_rating = body.supervisor_rating;
      if (body.advisor_rating !== undefined) updates.advisor_rating = body.advisor_rating;
      if (body.report_submitted !== undefined) updates.report_submitted = body.report_submitted;

      const { data, error } = await supabase.from('field_training').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = fieldTrainingStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('field_training').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  fieldTrainingStore.delete(id);
  return NextResponse.json({ success: true });
}
