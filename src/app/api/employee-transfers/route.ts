import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { employeeTransfersStore, membersStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('employee_transfers').select('*');

      const status = searchParams.get('status');
      if (status) query = query.eq('status', status);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = employeeTransfersStore.getAll();

  const status = searchParams.get('status');
  if (status) items = items.filter((t) => t.status === status);

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('employee_transfers')
        .insert({
          employee_id: body.employee_id,
          employee_name: body.employee_name,
          current_position: body.current_position,
          requested_rank: body.requested_rank,
          requested_specialization: body.requested_specialization,
          requested_qualification: body.requested_qualification,
          courses_to_teach: body.courses_to_teach || [],
          reason: body.reason,
          supporting_docs: body.supporting_docs || [],
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
  const item = employeeTransfersStore.add({
    id: genId('et'),
    employeeId: body.employee_id || '',
    employeeName: body.employee_name || '',
    currentPosition: body.current_position || '',
    requestedRank: body.requested_rank || '',
    requestedSpecialization: body.requested_specialization || '',
    requestedQualification: body.requested_qualification || '',
    coursesToTeach: body.courses_to_teach || [],
    reason: body.reason || '',
    supportingDocs: body.supporting_docs || [],
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 });
  }

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('employee_transfers')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If approved, update member role
      if (updateFields.status === 'approved' && data) {
        const rankMap: Record<string, string> = {
          'professor': 'أستاذ', 'associate_professor': 'أستاذ مشارك',
          'assistant_professor': 'أستاذ مساعد', 'lecturer': 'محاضر', 'teaching_assistant': 'معيد',
        };
        await supabase.from('members').update({
          role: 'professor', position: rankMap[data.requested_rank] || 'محاضر',
        }).eq('id', data.employee_id);

        await supabase.from('faculty_profiles').upsert({
          member_id: data.employee_id, specialization: data.requested_specialization,
          rank: data.requested_rank, qualification: data.requested_qualification,
          bio: '', research_interests: [],
        }, { onConflict: 'member_id' });
      }

      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (updateFields.status !== undefined) updates.status = updateFields.status;
  if (updateFields.reviewed_by_name !== undefined) updates.reviewedByName = updateFields.reviewed_by_name;
  if (updateFields.review_notes !== undefined) updates.reviewNotes = updateFields.review_notes;
  if (updateFields.reviewed_by !== undefined) updates.reviewedBy = updateFields.reviewed_by;

  const updated = employeeTransfersStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'طلب التحويل غير موجود' }, { status: 404 });

  // If approved, update member locally
  if (updateFields.status === 'approved') {
    const rankMap: Record<string, string> = {
      'professor': 'أستاذ', 'associate_professor': 'أستاذ مشارك',
      'assistant_professor': 'أستاذ مساعد', 'lecturer': 'محاضر', 'teaching_assistant': 'معيد',
    };
    membersStore.update(updated.employeeId, {
      role: 'professor',
      position: rankMap[updated.requestedRank] || 'محاضر',
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;

  if (!id) return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('employee_transfers').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  employeeTransfersStore.delete(id);
  return NextResponse.json({ success: true });
}
