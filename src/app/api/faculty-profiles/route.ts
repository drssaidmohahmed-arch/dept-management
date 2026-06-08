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

    let query = supabase.from('faculty_profiles').select('*');

    // Filter by member_id
    const memberId = searchParams.get('member_id');
    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    // Filter by rank
    const rank = searchParams.get('rank');
    if (rank) {
      query = query.eq('rank', rank);
    }

    // Search by name or specialization (sanitized)
    const search = searchParams.get('search');
    if (search) {
      const sanitized = sanitizeSearchInput(search);
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,specialization.ilike.%${sanitized}%`);
      }
    }

    const { data, error } = await query.order('name', { ascending: true });

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

    const {
      member_id,
      name,
      rank,
      specialization,
      department,
      email,
      phone,
      bio,
      office,
      is_active,
    } = body;

    if (!member_id || !name) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('faculty_profiles')
      .insert({
        member_id,
        name,
        rank: rank || 'assistant_professor',
        specialization: specialization || '',
        department: department || '',
        email: email || '',
        phone: phone || '',
        bio: bio || '',
        office: office || '',
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'الملف الأكاديمي موجود بالفعل' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الملف الأكاديمي مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('faculty_profiles')
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الملف الأكاديمي مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('faculty_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
