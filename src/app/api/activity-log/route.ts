import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  if (error && typeof error === 'object' && 'details' in error) return String((error as any).details);
  return 'حدث خطأ غير متوقع';
}

async function getSupabaseOrFallback() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

// In-memory fallback store for activity log
const activityLog: Array<{
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  performedBy: string;
  performedByName: string;
  details: string;
  createdAt: string;
}> = [];

let logCounter = 0;

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseOrFallback();
  const { searchParams } = new URL(request.url);

  if (supabase) {
    try {
      let query = supabase.from('activity_log').select('*').order('created_at', { ascending: false });

      const entityType = searchParams.get('entityType');
      if (entityType) query = query.eq('entity_type', entityType);

      const limit = searchParams.get('limit');
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json(data);
    } catch (_error: unknown) {
      // Any error (table not found, network, etc.) → fall back to in-memory data
    }
  }

  // Fallback to in-memory store
  let items = [...activityLog].reverse();

  const entityType = searchParams.get('entityType');
  if (entityType) items = items.filter((l) => l.entityType === entityType);

  const limit = searchParams.get('limit');
  if (limit) items = items.slice(0, Number(limit));

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { action, entity_type, entity_id, entity_name, performed_by, performed_by_name, details } = body;

  const supabase = await getSupabaseOrFallback();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          action,
          entity_type: entity_type,
          entity_id: entity_id,
          entity_name: entity_name,
          performed_by: performed_by,
          performed_by_name: performed_by_name,
          details: details || null,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
  }

  // Fallback to in-memory store
  logCounter++;
  const item = {
    id: `log-${logCounter}`,
    action: action || 'unknown',
    entityType: entity_type || 'unknown',
    entityId: entity_id || '',
    entityName: entity_name || '',
    performedBy: performed_by || '',
    performedByName: performed_by_name || '',
    details: details || '',
    createdAt: new Date().toISOString(),
  };
  activityLog.push(item);
  return NextResponse.json(item, { status: 201 });
}
