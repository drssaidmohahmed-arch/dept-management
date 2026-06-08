import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MIGRATION_TABLES = [
  'students',
  'faculty_profiles',
  'rooms',
  'teaching_assignments',
  'performance_evaluations',
  'professional_development',
  'advising_sessions',
  'field_training',
  'graduation_projects',
  'study_plans',
  'plan_courses',
  'course_descriptions',
  'course_sections',
  'room_bookings',
  'employee_transfers',
  'activity_log',
];

export async function GET() {
  try {
    const supabase = await createClient();
    let tableCount = 0;

    for (const table of MIGRATION_TABLES) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        tableCount++;
      }
    }

    return NextResponse.json({
      migrated: tableCount === MIGRATION_TABLES.length,
      tableCount,
      totalTables: MIGRATION_TABLES.length,
      tables: MIGRATION_TABLES,
    });
  } catch {
    return NextResponse.json({
      migrated: false,
      tableCount: 0,
      totalTables: MIGRATION_TABLES.length,
      tables: MIGRATION_TABLES,
    });
  }
}
