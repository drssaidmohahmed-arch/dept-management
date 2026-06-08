import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { performanceEvaluationsStore, genId } from '@/lib/local-data';

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
      let query = supabase.from('performance_evaluations').select('*');
      const facultyName = searchParams.get('facultyName');
      if (facultyName) query = query.eq('faculty_name', facultyName);
      const academicYear = searchParams.get('academicYear');
      if (academicYear) query = query.eq('academic_year', academicYear);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data when Supabase is unavailable
  let items = performanceEvaluationsStore.getAll();
  const facultyName = searchParams.get('facultyName');
  if (facultyName) items = items.filter((e) => e.facultyName === facultyName);
  const academicYear = searchParams.get('academicYear');
  if (academicYear) items = items.filter((e) => e.academicYear === academicYear);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('performance_evaluations').insert({
        faculty_id: body.faculty_id || null, faculty_name: body.faculty_name,
        evaluation_type: body.evaluation_type, academic_year: body.academic_year || '',
        semester: body.semester || 1, teaching_score: body.teaching_score,
        research_score: body.research_score, service_score: body.service_score,
        overall_score: body.overall_score, comments: body.comments || '',
      }).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const item = performanceEvaluationsStore.add({
    id: genId('pe'), facultyId: body.faculty_id, facultyName: body.faculty_name || '',
    evaluationType: body.evaluation_type, academicYear: body.academic_year || '',
    semester: body.semester || 1, teachingScore: body.teaching_score || 0,
    researchScore: body.research_score || 0, serviceScore: body.service_score || 0,
    overallScore: body.overall_score || 0, comments: body.comments || '',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'معرف التقييم مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const updates: Record<string, unknown> = {};
      if (body.faculty_id !== undefined) updates.faculty_id = body.faculty_id;
      if (body.faculty_name !== undefined) updates.faculty_name = body.faculty_name;
      if (body.evaluation_type !== undefined) updates.evaluation_type = body.evaluation_type;
      if (body.academic_year !== undefined) updates.academic_year = body.academic_year;
      if (body.semester !== undefined) updates.semester = body.semester;
      if (body.teaching_score !== undefined) updates.teaching_score = body.teaching_score;
      if (body.research_score !== undefined) updates.research_score = body.research_score;
      if (body.service_score !== undefined) updates.service_score = body.service_score;
      if (body.overall_score !== undefined) updates.overall_score = body.overall_score;
      if (body.comments !== undefined) updates.comments = body.comments;

      const { data, error } = await supabase.from('performance_evaluations').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [k, v] of Object.entries(body)) { if (k !== 'id') updates[k] = v; }
  const updated = performanceEvaluationsStore.update(id, updates);
  if (!updated) return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => ({ id: '' }));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'معرف التقييم مطلوب' }, { status: 400 });

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { error } = await supabase.from('performance_evaluations').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to local data
  performanceEvaluationsStore.delete(id);
  return NextResponse.json({ success: true });
}
