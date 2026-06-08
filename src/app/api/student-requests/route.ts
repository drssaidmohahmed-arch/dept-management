import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

function sanitizeSearchInput(input: string): string {
  return input.replace(/[%_.(),]/g, '').trim();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase.from('student_requests').select('*');

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    // Search by type or description (sanitized)
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

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
