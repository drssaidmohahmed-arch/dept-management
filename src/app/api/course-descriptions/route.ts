import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { courseDescriptionsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('course_descriptions').select('*');
      const courseCode = searchParams.get('courseCode');
      if (courseCode) query = query.eq('course_code', courseCode);
      const { data, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = courseDescriptionsStore.getAll();
  const courseCode = searchParams.get('courseCode');
  if (courseCode) items = items.filter((d) => d.courseCode === courseCode);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('course_descriptions').insert({
        course_code: body.course_code, description: body.description || '',
        objectives: body.objectives || [], topics: body.topics || [],
        textbooks: body.textbooks || [], ref_materials: body.ref_materials || [],
        assessment_method: body.assessment_method || '', updated_by: body.updated_by || '',
        version: body.version || 1, status: body.status || 'draft',
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = courseDescriptionsStore.add({
    id: genId('cd'), courseCode: body.course_code || '', description: body.description || '',
    objectives: body.objectives || [], topics: body.topics || [],
    textbooks: body.textbooks || [], refMaterials: body.ref_materials || [],
    assessmentMethod: body.assessment_method || '', updatedBy: body.updated_by || '',
    version: body.version || 1, status: body.status || 'draft', createdAt: new Date().toISOString(),
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
      if (body.course_code !== undefined) updates.course_code = body.course_code;
      if (body.description !== undefined) updates.description = body.description;
      if (body.objectives !== undefined) updates.objectives = body.objectives;
      if (body.topics !== undefined) updates.topics = body.topics;
      if (body.textbooks !== undefined) updates.textbooks = body.textbooks;
      if (body.ref_materials !== undefined) updates.ref_materials = body.ref_materials;
      if (body.assessment_method !== undefined) updates.assessment_method = body.assessment_method;
      if (body.updated_by !== undefined) updates.updated_by = body.updated_by;
      if (body.version !== undefined) updates.version = body.version;
      if (body.status !== undefined) updates.status = body.status;

      const { data, error } = await supabase.from('course_descriptions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = courseDescriptionsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'الوصف غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('course_descriptions').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  courseDescriptionsStore.delete(id);
  return NextResponse.json({ success: true });
}
