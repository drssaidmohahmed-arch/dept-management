import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { advisingSessionsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('advising_sessions').select('*');
      const advisorName = searchParams.get('advisorName');
      if (advisorName) query = query.eq('advisor_name', advisorName);
      const { data, error } = await query.order('session_date', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = advisingSessionsStore.getAll();
  const advisorName = searchParams.get('advisorName');
  if (advisorName) items = items.filter((s) => s.advisorName === advisorName);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('advising_sessions').insert({
        student_id: body.student_id, student_name: body.student_name,
        advisor_id: body.advisor_id || null, advisor_name: body.advisor_name,
        session_date: body.session_date || new Date().toISOString().split('T')[0],
        session_type: body.session_type || 'general', notes: body.notes || '',
        action_items: body.action_items || [], follow_up_date: body.follow_up_date || null,
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = advisingSessionsStore.add({
    id: genId('as'), studentId: body.student_id || '', studentName: body.student_name || '',
    advisorId: body.advisor_id, advisorName: body.advisor_name || '',
    sessionDate: body.session_date || new Date().toISOString().split('T')[0],
    sessionType: body.session_type || 'general', notes: body.notes || '',
    actionItems: body.action_items || [], followUpDate: body.follow_up_date,
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
      if (body.advisor_id !== undefined) updates.advisor_id = body.advisor_id;
      if (body.advisor_name !== undefined) updates.advisor_name = body.advisor_name;
      if (body.session_date !== undefined) updates.session_date = body.session_date;
      if (body.session_type !== undefined) updates.session_type = body.session_type;
      if (body.notes !== undefined) updates.notes = body.notes;
      if (body.action_items !== undefined) updates.action_items = body.action_items;
      if (body.follow_up_date !== undefined) updates.follow_up_date = body.follow_up_date;

      const { data, error } = await supabase.from('advising_sessions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = advisingSessionsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('advising_sessions').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  advisingSessionsStore.delete(id);
  return NextResponse.json({ success: true });
}
