import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { graduationProjectsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('graduation_projects').select('*');
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
  let items = graduationProjectsStore.getAll();
  const status = searchParams.get('status');
  if (status) items = items.filter((p) => p.status === status);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('graduation_projects').insert({
        student_id: body.student_id, student_name: body.student_name,
        title: body.title, description: body.description || '',
        supervisor_id: body.supervisor_id || null, supervisor_name: body.supervisor_name || '',
        project_type: body.project_type || 'software', status: body.status || 'proposed',
        grade: body.grade || null, submission_date: body.submission_date || null,
        defense_date: body.defense_date || null,
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = graduationProjectsStore.add({
    id: genId('gp'), studentId: body.student_id || '', studentName: body.student_name || '',
    title: body.title || '', description: body.description || '',
    supervisorId: body.supervisor_id, supervisorName: body.supervisor_name || '',
    projectType: body.project_type || 'software', status: body.status || 'proposed',
    grade: body.grade, submissionDate: body.submission_date, defenseDate: body.defense_date,
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
      if (body.title !== undefined) updates.title = body.title;
      if (body.description !== undefined) updates.description = body.description;
      if (body.supervisor_id !== undefined) updates.supervisor_id = body.supervisor_id;
      if (body.supervisor_name !== undefined) updates.supervisor_name = body.supervisor_name;
      if (body.project_type !== undefined) updates.project_type = body.project_type;
      if (body.status !== undefined) updates.status = body.status;
      if (body.grade !== undefined) updates.grade = body.grade;
      if (body.submission_date !== undefined) updates.submission_date = body.submission_date;
      if (body.defense_date !== undefined) updates.defense_date = body.defense_date;

      const { data, error } = await supabase.from('graduation_projects').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = graduationProjectsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'المشروع غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('graduation_projects').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  graduationProjectsStore.delete(id);
  return NextResponse.json({ success: true });
}
