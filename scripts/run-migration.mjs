import pg from 'pg';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkgxduabjctcuundkcrh.supabase.co';
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const DB_HOST = `db.${projectRef}.supabase.co`;
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('❌ يرجى توفير كلمة مرور قاعدة البيانات');
  console.error('الاستخدام: node scripts/run-migration.mjs <DB_PASSWORD>');
  console.error('');
  console.error('🔑 للحصول على كلمة المرور:');
  console.error('   1. اذهب إلى لوحة تحكم Supabase');
  console.error('   2. اختر المشروع');
  console.error('   3. Settings → Database → Database password');
  console.error('   أو من: Project Settings → Database → Connection string');
  process.exit(1);
}

const connectionString = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function runMigration() {
  const client = new pg.Client({ connectionString });
  
  try {
    console.log('🔌 جاري الاتصال بقاعدة البيانات...');
    console.log(`   Host: ${DB_HOST}`);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');
    
    const { readFileSync } = await import('fs');
    const sql = readFileSync('supabase/migrations/002_new_modules.sql', 'utf8');
    
    console.log('⚙️ جاري تنفيذ Migration...');
    await client.query(sql);
    
    console.log('✅ تم تنفيذ Migration بنجاح!');
    
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('students','faculty_profiles','rooms','teaching_assignments',
        'performance_evaluations','professional_development','advising_sessions',
        'field_training','graduation_projects','study_plans','plan_courses',
        'course_descriptions','course_sections','room_bookings')
      ORDER BY table_name;
    `);
    
    console.log(`📊 تم إنشاء ${result.rows.length} من أصل 14 جدول`);
    result.rows.forEach(r => console.log(`  ✓ ${r.table_name}`));
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
