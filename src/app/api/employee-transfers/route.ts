import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { employeeTransfersStore, membersStore, genId } from '@/lib/local-data';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  if (error && typeof error === 'object' && 'details' in error) return String((error as any).details);
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
    } catch (_error: unknown) {
      // Any error (table not found, network, etc.) → fall back to local data
    }
  }

  // Fallback to local data when Supabase is unavailable or table doesn't exist
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
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updateFields.employee_id !== undefined) updates.employee_id = updateFields.employee_id;
      if (updateFields.employee_name !== undefined) updates.employee_name = updateFields.employee_name;
      if (updateFields.current_position !== undefined) updates.current_position = updateFields.current_position;
      if (updateFields.requested_rank !== undefined) updates.requested_rank = updateFields.requested_rank;
      if (updateFields.requested_specialization !== undefined) updates.requested_specialization = updateFields.requested_specialization;
      if (updateFields.requested_qualification !== undefined) updates.requested_qualification = updateFields.requested_qualification;
      if (updateFields.courses_to_teach !== undefined) updates.courses_to_teach = updateFields.courses_to_teach;
      if (updateFields.reason !== undefined) updates.reason = updateFields.reason;
      if (updateFields.supporting_docs !== undefined) updates.supporting_docs = updateFields.supporting_docs;
      if (updateFields.status !== undefined) updates.status = updateFields.status;
      if (updateFields.reviewed_by_name !== undefined) updates.reviewed_by_name = updateFields.reviewed_by_name;
      if (updateFields.review_notes !== undefined) updates.review_notes = updateFields.review_notes;
      if (updateFields.reviewed_by !== undefined) updates.reviewed_by = updateFields.reviewed_by;
      if (updateFields.new_department !== undefined) updates.new_department = updateFields.new_department;

      const { data, error } = await supabase
        .from('employee_transfers')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      // data might be empty array if RLS prevented the update
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'فشل تحديث طلب التحويل في قاعدة البيانات' }, { status: 500 });
      }

      const updatedRecord = data[0];

      // If approved, update member role, department, log activity, and manage faculty profile
      if (updateFields.status === 'approved' && updatedRecord) {
        const rankMap: Record<string, string> = {
          'professor': 'أستاذ', 'associate_professor': 'أستاذ مشارك',
          'assistant_professor': 'أستاذ مساعد', 'lecturer': 'محاضر', 'teaching_assistant': 'معيد',
        };

        // Build member update object
        const memberUpdate: Record<string, unknown> = {
          role: 'professor',
          position: rankMap[updatedRecord.requested_rank] || 'محاضر',
        };

        // 1. Update member's department if new_department is provided in the transfer
        if (updatedRecord.new_department) {
          memberUpdate.department = updatedRecord.new_department;
        }

        await supabase.from('members').update(memberUpdate).eq('id', updatedRecord.employee_id);

        // 2. Log the transfer approval to activity_log
        await supabase.from('activity_log').insert({
          action: 'employee_transfer_approved',
          entity_type: 'employee_transfer',
          entity_id: updatedRecord.id,
          entity_name: updatedRecord.employee_name,
          performed_by: updatedRecord.reviewed_by,
          performed_by_name: updatedRecord.reviewed_by_name,
          details: {
            transfer_id: updatedRecord.id,
            employee_name: updatedRecord.employee_name,
            employee_id: updatedRecord.employee_id,
            requested_rank: updatedRecord.requested_rank,
            new_department: updatedRecord.new_department || null,
          },
        });

        // 3. Create/update faculty_profile only if the new role is teaching-related
        const teachingRoles = new Set([
          'professor', 'associate_professor', 'assistant_professor',
          'lecturer', 'ta', 'teaching_assistant',
        ]);
        const newRole = (updatedRecord.requested_role || updatedRecord.requested_rank || '').toLowerCase();

        if (teachingRoles.has(newRole)) {
          await supabase.from('faculty_profiles').upsert({
            member_id: updatedRecord.employee_id,
            name: updatedRecord.employee_name,
            department: updatedRecord.new_department || null,
            specialization: updatedRecord.requested_specialization || null,
            qualification: updatedRecord.requested_qualification || null,
            status: 'active',
          }, { onConflict: 'member_id' });
        }
      }

      return NextResponse.json(updatedRecord);
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
  if (updateFields.new_department !== undefined) updates.newDepartment = updateFields.new_department;

  const updated = employeeTransfersStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'طلب التحويل غير موجود' }, { status: 404 });

  // If approved, update member locally
  if (updateFields.status === 'approved') {
    const rankMap: Record<string, string> = {
      'professor': 'أستاذ', 'associate_professor': 'أستاذ مشارك',
      'assistant_professor': 'أستاذ مساعد', 'lecturer': 'محاضر', 'teaching_assistant': 'معيد',
    };

    const memberUpdate: Record<string, unknown> = {
      role: 'professor',
      position: rankMap[updated.requestedRank] || 'محاضر',
    };

    // Update department if new_department is present
    if (updated.newDepartment) {
      memberUpdate.department = updated.newDepartment;
    }

    membersStore.update(updated.employeeId, memberUpdate);

    // Create/update faculty profile for teaching-related roles
    const teachingRoles = new Set([
      'professor', 'associate_professor', 'assistant_professor',
      'lecturer', 'ta', 'teaching_assistant',
    ]);
    const newRole = (updated.requestedRank || '').toLowerCase();
    if (teachingRoles.has(newRole)) {
      // Faculty profile managed via Supabase when available; local fallback updates member only
    }
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
