import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { studentRequestsStore, genId } from '@/lib/local-data';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  // Handle Supabase error objects
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (obj.message && typeof obj.message === 'string') return String(obj.message);
    if (obj.error && typeof obj.error === 'string') return String(obj.error);
  }
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

function sanitizeSearchInput(input: string): string {
  return input.replace(/[%_.(),]/g, '').trim();
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
      let query = supabase.from('student_requests').select('*');

      const status = searchParams.get('status');
      if (status) query = query.eq('status', status);

      const search = searchParams.get('search');
      if (search) {
        const sanitized = sanitizeSearchInput(search);
        if (sanitized) {
          query = query.or(`type.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = studentRequestsStore.getAll();
  const status = searchParams.get('status');
  if (status) items = items.filter((r) => r.status === status);
  const search = searchParams.get('search');
  if (search) {
    const sanitized = search.toLowerCase();
    items = items.filter(
      (r) =>
        r.type.toLowerCase().includes(sanitized) ||
        r.description.toLowerCase().includes(sanitized)
    );
  }
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Input validation
  if (!body.type || !body.description) {
    return NextResponse.json({ error: 'الحقل type و description مطلوبان' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('student_requests')
        .insert({
          type: body.type,
          description: body.description,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = studentRequestsStore.add({
    id: genId('req'),
    type: body.type || '',
    description: body.description || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, status, response, reviewed_by, reviewed_by_name } = body;

  if (!id) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (!supabase) {
    return NextResponse.json({ error: 'خطأ في الاتصال بقاعدة البيانات' }, { status: 500 });
  }

  try {
    const updatePayload: Record<string, unknown> = {};
    if (status !== undefined) updatePayload.status = status;
    if (response !== undefined) updatePayload.response = response;
    if (reviewed_by_name !== undefined) updatePayload.reviewed_by_name = reviewed_by_name;

    // When status changes to approved/rejected, add review metadata
    if (status === 'approved' || status === 'rejected') {
      updatePayload.reviewed_at = new Date().toISOString();
      if (reviewed_by) updatePayload.reviewed_by = reviewed_by;
    }

    const { data, error } = await supabase
      .from('student_requests')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (data && data.length > 0) {
      return NextResponse.json(data[0]);
    }

    return NextResponse.json({ error: 'فشل تحديث الطلب في قاعدة البيانات' }, { status: 500 });
  } catch (error: unknown) {
    console.error('[student-requests PUT] Exception:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('student_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  studentRequestsStore.delete(id);
  return NextResponse.json({ success: true });
}
