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

      // Search by specialization (sanitized)
      const search = searchParams.get('search');
      if (search) {
        const sanitized = sanitizeSearchInput(search);
        if (sanitized) {
          query = query.ilike('specialization', `%${sanitized}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // No local fallback for faculty profiles (Supabase-only resource)
  return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const {
        member_id,
        rank,
        specialization,
        qualification,
        granting_university,
        bio,
        research_interests,
        hire_date,
      } = body;

      if (!member_id) {
        return NextResponse.json(
          { error: 'البيانات المطلوبة غير مكتملة' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('faculty_profiles')
        .insert({
          member_id,
          rank: rank || 'assistant_professor',
          specialization: specialization || '',
          qualification: qualification || '',
          granting_university: granting_university || '',
          bio: bio || '',
          research_interests: research_interests || [],
          hire_date: hire_date || null,
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

  // No local fallback for faculty profiles (Supabase-only resource)
  return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json(
      { error: 'معرف الملف الأكاديمي مطلوب' },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
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

  // No local fallback for faculty profiles (Supabase-only resource)
  return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: 'معرف الملف الأكاديمي مطلوب' },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
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

  // No local fallback for faculty profiles (Supabase-only resource)
  return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
}
