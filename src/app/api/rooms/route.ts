import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { roomsStore, genId } from '@/lib/local-data';
import { serverLogActivity } from '@/lib/activity-logger';

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

export async function GET() {
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  return NextResponse.json(roomsStore.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('rooms').insert({
        name: body.name, code: body.code, building: body.building || '', floor: body.floor || 0,
        capacity: body.capacity || 40, type: body.type || 'lecture_hall', equipment: body.equipment || [],
        is_available: body.isAvailable ?? true,
      }).select().single();
      if (error) throw error;
      serverLogActivity({ action: 'room_added', entityType: 'room', entityId: data.id, entityName: data.name, details: { code: data.code, type: data.type } });
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = roomsStore.add({
    id: genId('room'), name: body.name || '', code: body.code || '', building: body.building || '',
    floor: body.floor || 0, capacity: body.capacity || 40, type: body.type || 'lecture_hall',
    equipment: body.equipment || [], isAvailable: body.isAvailable ?? true, createdAt: new Date().toISOString(),
  });
  serverLogActivity({ action: 'room_added', entityType: 'room', entityId: item.id, entityName: item.name, details: { code: item.code } });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  if (!body.id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('rooms').update({
        name: body.name, code: body.code, building: body.building, floor: body.floor,
        capacity: body.capacity, type: body.type, equipment: body.equipment,
        is_available: body.isAvailable, updated_at: new Date().toISOString(),
      }).eq('id', body.id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.code !== undefined) updates.code = body.code;
  if (body.building !== undefined) updates.building = body.building;
  if (body.floor !== undefined) updates.floor = body.floor;
  if (body.capacity !== undefined) updates.capacity = body.capacity;
  if (body.type !== undefined) updates.type = body.type;
  if (body.equipment !== undefined) updates.equipment = body.equipment;
  if (body.isAvailable !== undefined) updates.isAvailable = body.isAvailable;
  const updated = roomsStore.update(body.id, updates);
  if (!updated) return NextResponse.json({ error: 'القاعة غير موجودة' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      serverLogActivity({ action: 'room_deleted', entityType: 'room', entityId: id, entityName: 'قاعة محذوفة' });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  roomsStore.delete(id);
  serverLogActivity({ action: 'room_deleted', entityType: 'room', entityId: id, entityName: 'قاعة محذوفة' });
  return NextResponse.json({ success: true });
}
