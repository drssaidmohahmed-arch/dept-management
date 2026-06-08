import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { studentsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('students').select('*');

      const status = searchParams.get('status');
      if (status) query = query.eq('status', status);

      const level = searchParams.get('level');
      if (level) query = query.eq('level', Number(level));

      const search = searchParams.get('search');
      if (search) {
        const sanitized = search.replace(/[%_.(),]/g, '').trim();
        if (sanitized) query = query.or(`name.ilike.%${sanitized}%,student_id.ilike.%${sanitized}%`);
      }

      const { data, error } = await query.order('student_id', { ascending: true });
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = studentsStore.getAll();
  const status = searchParams.get('status');
  if (status) items = items.filter((s) => s.status === status);
  const level = searchParams.get('level');
  if (level) items = items.filter((s) => s.level === Number(level));
  const search = searchParams.get('search');
  if (search) {
    const s = search.toLowerCase();
    items = items.filter((st) => st.name.toLowerCase().includes(s) || st.studentId.toLowerCase().includes(s));
  }
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { student_id, name, level, status, email, phone, gpa, cumulative_hours, major, enrollment_year, advisor_name } = body;
  if (!student_id || !name) return NextResponse.json({ error: 'البيانات المطلوبة غير مكتملة' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('students').insert({
        student_id, name, level: level ?? 1, status: status || 'active', email: email || '', phone: phone || '',
        gpa: gpa ?? 0, cumulative_hours: cumulative_hours ?? 0, major: major || 'علوم الحاسب',
        enrollment_year: enrollment_year || new Date().getFullYear(), advisor_name: advisor_name || '',
      }).select().single();
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          return NextResponse.json({ error: 'الطالب مسجل بالفعل' }, { status: 409 });
        }
        throw error;
      }
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = studentsStore.add({
    id: genId('st'), studentId: body.student_id || '', name: body.name || '', email: body.email,
    phone: body.phone, level: body.level || 1, major: body.major || 'علوم الحاسب',
    gpa: body.gpa || 0, cumulativeHours: body.cumulative_hours || 0,
    status: body.status || 'active', advisorName: body.advisor_name,
    enrollmentYear: body.enrollment_year || new Date().getFullYear(), createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;
  if (!id) return NextResponse.json({ error: 'معرف الطالب مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('students').update(updateFields).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (updateFields.name !== undefined) updates.name = updateFields.name;
  if (updateFields.email !== undefined) updates.email = updateFields.email;
  if (updateFields.phone !== undefined) updates.phone = updateFields.phone;
  if (updateFields.level !== undefined) updates.level = updateFields.level;
  if (updateFields.major !== undefined) updates.major = updateFields.major;
  if (updateFields.gpa !== undefined) updates.gpa = updateFields.gpa;
  if (updateFields.cumulative_hours !== undefined) updates.cumulativeHours = updateFields.cumulative_hours;
  if (updateFields.status !== undefined) updates.status = updateFields.status;
  if (updateFields.advisor_name !== undefined) updates.advisorName = updateFields.advisor_name;
  const updated = studentsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'معرف الطالب مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  studentsStore.delete(id);
  return NextResponse.json({ success: true });
}
