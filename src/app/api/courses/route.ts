import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('code', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
