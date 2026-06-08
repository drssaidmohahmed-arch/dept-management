import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { professorRequestsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('professor_requests').select('*');

      const status = searchParams.get('status');
      if (status) {
        query = query.eq('status', status);
      }

      const target = searchParams.get('target');
      if (target) {
        query = query.eq('target', target);
      }

      const category = searchParams.get('category');
      if (category) {
        query = query.eq('category', category);
      }

      const search = searchParams.get('search');
      if (search) {
        const sanitized = sanitizeSearchInput(search);
        if (sanitized) {
          query = query.or(`subject.ilike.%${sanitized}%,description.ilike.%${sanitized}%,target_student_name.ilike.%${sanitized}%`);
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
  let items = professorRequestsStore.getAll();

  const status = searchParams.get('status');
  if (status) items = items.filter((r) => r.status === status);

  const target = searchParams.get('target');
  if (target) items = items.filter((r) => r.target === target);

  const category = searchParams.get('category');
  if (category) items = items.filter((r) => r.category === category);

  const search = searchParams.get('search');
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(
      (r) =>
        r.subject.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        (r.targetStudentName?.toLowerCase().includes(s) ?? false)
    );
  }

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Input validation
  if (!body.category || !body.target || !body.subject || !body.description) {
    return NextResponse.json({ error: 'الحقول category و target و subject و description مطلوبة' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('professor_requests')
        .insert({
          category: body.category,
          target: body.target,
          target_student_id: body.target_student_id || null,
          target_student_name: body.target_student_name || null,
          subject: body.subject,
          description: body.description,
          priority: body.priority || 'normal',
          status: 'pending',
          response: null,
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
  const item = professorRequestsStore.add({
    id: genId('pr'),
    category: body.category || 'other',
    target: body.target || 'department',
    targetStudentId: body.target_student_id,
    targetStudentName: body.target_student_name,
    subject: body.subject || '',
    description: body.description || '',
    priority: body.priority || 'normal',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, created_at, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updateFields.category !== undefined) updates.category = updateFields.category;
      if (updateFields.target !== undefined) updates.target = updateFields.target;
      if (updateFields.target_student_id !== undefined) updates.target_student_id = updateFields.target_student_id;
      if (updateFields.target_student_name !== undefined) updates.target_student_name = updateFields.target_student_name;
      if (updateFields.subject !== undefined) updates.subject = updateFields.subject;
      if (updateFields.description !== undefined) updates.description = updateFields.description;
      if (updateFields.priority !== undefined) updates.priority = updateFields.priority;
      if (updateFields.status !== undefined) updates.status = updateFields.status;
      if (updateFields.response !== undefined) updates.response = updateFields.response;

      const { data, error } = await supabase
        .from('professor_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (updateFields.status !== undefined) updates.status = updateFields.status;
  if (updateFields.response !== undefined) updates.response = updateFields.response;

  const updated = professorRequestsStore.update(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
  }
  return NextResponse.json(updated);
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
        .from('professor_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  professorRequestsStore.delete(id);
  return NextResponse.json({ success: true });
}
