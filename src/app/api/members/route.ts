import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { membersStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('members').select('*');

      const role = searchParams.get('role');
      if (role) {
        query = query.eq('role', role);
      }

      const status = searchParams.get('status');
      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }

      const search = searchParams.get('search');
      if (search) {
        const sanitized = sanitizeSearchInput(search);
        if (sanitized) {
          query = query.or(`name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
        }
      }

      const { data, error } = await query.order('joined_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = membersStore.getAll();

  const role = searchParams.get('role');
  if (role) {
    items = items.filter((m) => m.role === role);
  }

  const status = searchParams.get('status');
  if (status === 'active') {
    items = items.filter((m) => m.isActive === true);
  } else if (status === 'inactive') {
    items = items.filter((m) => m.isActive === false);
  }

  const search = searchParams.get('search');
  if (search) {
    const sanitized = search.toLowerCase();
    items = items.filter(
      (m) =>
        m.name.toLowerCase().includes(sanitized) ||
        m.email.toLowerCase().includes(sanitized)
    );
  }

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Input validation
  if (!body.name || !body.email || !body.role || !body.position) {
    return NextResponse.json({ error: 'الحقول name و email و role و position مطلوبة' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert({
          name: body.name,
          email: body.email,
          role: body.role,
          position: body.position,
          avatar: body.avatar || '',
          is_active: body.is_active !== undefined ? body.is_active : true,
          permissions: body.permissions || [],
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
  const item = membersStore.add({
    id: genId('mem'),
    name: body.name || '',
    email: body.email || '',
    role: body.role || 'employee',
    position: body.position || '',
    avatar: body.avatar || '',
    isActive: body.is_active !== undefined ? body.is_active : true,
    permissions: body.permissions || [],
    joinedAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
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

  // Fallback to local data
  const updates: Record<string, unknown> = {};
  if (updateFields.permissions !== undefined) updates.permissions = updateFields.permissions;
  if (updateFields.is_active !== undefined) updates.isActive = updateFields.is_active;
  if (updateFields.name !== undefined) updates.name = updateFields.name;
  if (updateFields.position !== undefined) updates.position = updateFields.position;
  if (updateFields.role !== undefined) updates.role = updateFields.role;
  if (updateFields.email !== undefined) updates.email = updateFields.email;
  if (updateFields.avatar !== undefined) updates.avatar = updateFields.avatar;

  const updated = membersStore.update(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  membersStore.delete(id);
  return NextResponse.json({ success: true });
}
