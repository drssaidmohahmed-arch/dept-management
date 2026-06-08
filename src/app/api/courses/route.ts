import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { coursesStore, genId } from '@/lib/local-data';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

// Helper: try to get Supabase client, returns null if connection fails
async function getSupabaseOrFallback() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function GET() {
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('code', { ascending: true });
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  return NextResponse.json(coursesStore.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Input validation
  if (!body.code || !body.name) {
    return NextResponse.json({ error: 'حقل الكود والاسم مطلوبان' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      // Check uniqueness of code
      const { data: existing, error: checkError } = await supabase
        .from('courses')
        .select('id')
        .eq('code', body.code)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existing) {
        return NextResponse.json({ error: 'كود المقرر موجود مسبقاً' }, { status: 409 });
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          code: body.code,
          name: body.name,
          hours: body.hours !== undefined ? body.hours : 3,
          semester: body.semester || null,
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
  const existingLocal = coursesStore.getAll().find((c) => c.code === body.code);
  if (existingLocal) {
    return NextResponse.json({ error: 'كود المقرر موجود مسبقاً' }, { status: 409 });
  }

  const item = coursesStore.add({
    id: genId('c'),
    code: body.code,
    name: body.name,
    hours: body.hours !== undefined ? body.hours : 3,
    semester: body.semester || 1,
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف المقرر مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (updateFields.code !== undefined) updates.code = updateFields.code;
      if (updateFields.name !== undefined) updates.name = updateFields.name;
      if (updateFields.hours !== undefined) updates.hours = updateFields.hours;
      if (updateFields.semester !== undefined) updates.semester = updateFields.semester;

      // Check uniqueness if code is being updated
      if (updateFields.code !== undefined) {
        const { data: existing, error: checkError } = await supabase
          .from('courses')
          .select('id')
          .eq('code', updateFields.code)
          .single();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        if (existing && existing.id !== id) {
          return NextResponse.json({ error: 'كود المقرر موجود مسبقاً' }, { status: 409 });
        }
      }

      const { data, error } = await supabase
        .from('courses')
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
  const updates: Record<string, unknown> = {};
  if (updateFields.code !== undefined) updates.code = updateFields.code;
  if (updateFields.name !== undefined) updates.name = updateFields.name;
  if (updateFields.hours !== undefined) updates.hours = updateFields.hours;
  if (updateFields.semester !== undefined) updates.semester = updateFields.semester;

  const updated = coursesStore.update(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'المقرر غير موجود' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'معرف المقرر مطلوب' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  coursesStore.delete(id);
  return NextResponse.json({ success: true });
}
