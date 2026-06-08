import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { roomBookingsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('room_bookings').select('*');
      const roomId = searchParams.get('roomId');
      if (roomId) query = query.eq('room_id', roomId);
      const { data, error } = await query.order('booking_date', { ascending: true });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = roomBookingsStore.getAll();
  const roomId = searchParams.get('roomId');
  if (roomId) items = items.filter((b) => b.roomId === roomId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('room_bookings').insert({
        room_id: body.room_id, room_name: body.room_name || '',
        booked_by: body.booked_by || '', booking_date: body.booking_date || '',
        start_time: body.start_time || '', end_time: body.end_time || '',
        purpose: body.purpose || '', status: body.status || 'pending',
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = roomBookingsStore.add({
    id: genId('rb'), roomId: body.room_id || '', roomName: body.room_name || '',
    bookedBy: body.booked_by || '', bookingDate: body.booking_date || '',
    startTime: body.start_time || '', endTime: body.end_time || '',
    purpose: body.purpose || '', status: body.status || 'pending',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('room_bookings').update(updateFields).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  Object.keys(updateFields).forEach((k) => { updates[k] = updateFields[k]; });
  const updated = roomBookingsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('room_bookings').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  roomBookingsStore.delete(id);
  return NextResponse.json({ success: true });
}
