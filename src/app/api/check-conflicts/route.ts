import { NextRequest, NextResponse } from 'next/server';
import { detectConflicts, detectAllConflicts } from '@/lib/conflict-detector';
import type { ScheduleEntry } from '@/lib/conflict-detector';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'حدث خطأ غير متوقع';
}

// POST: Check conflicts for a new entry against existing entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { newEntry, existingEntries } = body as {
      newEntry: ScheduleEntry;
      existingEntries: ScheduleEntry[];
    };

    if (!newEntry || !newEntry.startTime || !newEntry.endTime) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة (الوقت مطلوب)' },
        { status: 400 }
      );
    }

    const conflicts = detectConflicts(newEntry, existingEntries || []);

    return NextResponse.json({
      hasConflicts: conflicts.length > 0,
      conflicts,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
