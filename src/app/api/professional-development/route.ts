import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { professionalDevelopmentStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('professional_development').select('*');
      const facultyName = searchParams.get('facultyName');
      if (facultyName) query = query.eq('faculty_name', facultyName);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = professionalDevelopmentStore.getAll();
  const facultyName = searchParams.get('facultyName');
  if (facultyName) items = items.filter((d) => d.facultyName === facultyName);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('professional_development').insert({
        faculty_id: body.faculty_id || null, faculty_name: body.faculty_name,
        title: body.title, activity_type: body.activity_type, provider: body.provider || '',
        location: body.location || '', start_date: body.start_date || null, end_date: body.end_date || null,
        hours: body.hours || 0, status: body.status || 'planned',
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = professionalDevelopmentStore.add({
    id: genId('pd'), facultyId: body.faculty_id, facultyName: body.faculty_name || '',
    title: body.title || '', activityType: body.activity_type, provider: body.provider || '',
    location: body.location || '', startDate: body.start_date, endDate: body.end_date,
    hours: body.hours || 0, status: body.status || 'planned', createdAt: new Date().toISOString(),
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
      if (body.faculty_id !== undefined) updates.faculty_id = body.faculty_id;
      if (body.faculty_name !== undefined) updates.faculty_name = body.faculty_name;
      if (body.title !== undefined) updates.title = body.title;
      if (body.activity_type !== undefined) updates.activity_type = body.activity_type;
      if (body.provider !== undefined) updates.provider = body.provider;
      if (body.location !== undefined) updates.location = body.location;
      if (body.start_date !== undefined) updates.start_date = body.start_date;
      if (body.end_date !== undefined) updates.end_date = body.end_date;
      if (body.hours !== undefined) updates.hours = body.hours;
      if (body.status !== undefined) updates.status = body.status;

      const { data, error } = await supabase.from('professional_development').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = professionalDevelopmentStore.update(id, updates);
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
      const { error } = await supabase.from('professional_development').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  professionalDevelopmentStore.delete(id);
  return NextResponse.json({ success: true });
}
