import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { announcementsStore, genId } from '@/lib/local-data';

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
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  return NextResponse.json(announcementsStore.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: body.title,
          content: body.content,
          priority: body.priority || 'normal',
          target_role: body.targetRole || 'all',
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
  const item = announcementsStore.add({
    id: genId('ann'),
    title: body.title || '',
    content: body.content || '',
    priority: body.priority || 'normal',
    targetRole: body.targetRole || 'all',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  announcementsStore.delete(id);
  return NextResponse.json({ success: true });
}
