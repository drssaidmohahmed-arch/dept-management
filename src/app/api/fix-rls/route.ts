import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// SQL to fix RLS policies for original tables
const RLS_FIX_SQL = `
DO $$ BEGIN
  BEGIN ALTER TABLE announcements ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE student_requests ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE members ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE professor_requests ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE enrolled_students ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE courses ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE professor_courses ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Announcements full access" ON announcements;
  DROP POLICY IF EXISTS "Student requests full access" ON student_requests;
  DROP POLICY IF EXISTS "Members full access" ON members;
  DROP POLICY IF EXISTS "Professor requests full access" ON professor_requests;
  DROP POLICY IF EXISTS "Enrolled students full access" ON enrolled_students;
  DROP POLICY IF EXISTS "Courses full access" ON courses;
  DROP POLICY IF EXISTS "Professor courses full access" ON professor_courses;
END $$;

CREATE POLICY "Announcements full access" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Student requests full access" ON student_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Members full access" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Professor requests full access" ON professor_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enrolled students full access" ON enrolled_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Courses full access" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Professor courses full access" ON professor_courses FOR ALL USING (true) WITH CHECK (true);
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال كلمة مرور قاعدة البيانات' },
        { status: 400 }
      );
    }

    const connectionString = `postgresql://postgres:${encodeURIComponent(password.trim())}@db.dkgxduabjctcuundkcrh.supabase.co:5432/postgres`;

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      statement_timeout: 30000,
      query_timeout: 30000,
      connection_timeout: 15000,
    });

    await client.connect();

    try {
      await client.query(RLS_FIX_SQL);
    } catch (queryError: unknown) {
      const err = queryError as Error & { code?: string };
      const errorCode = err.code || '';
      const errorMessage = err.message || 'خطأ غير معروف';

      const isAlreadyExists = errorCode === '42P07' || errorMessage.includes('already exists');

      await client.end();

      if (isAlreadyExists) {
        return NextResponse.json({
          success: true,
          warning: true,
          message: 'تم تحديث سياسات RLS مع بعض التحذيرات',
        });
      }

      await client.end();
      return NextResponse.json({
        success: false,
        error: `خطأ في تنفيذ SQL: ${errorMessage}`,
        code: errorCode,
      });
    }

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'تم إصلاح سياسات RLS بنجاح! الآن جميع العمليات تعمل بشكل صحيح.',
    });
  } catch (authError: unknown) {
    const err = authError as Error;
    const errorMessage = err.message || '';

    if (errorMessage.includes('authentication failed') || errorMessage.includes('password authentication')) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      return NextResponse.json(
        { success: false, error: 'تعذر الاتصال بخادم قاعدة البيانات' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: `حدث خطأ: ${errorMessage}` },
      { status: 500 }
    );
  }
}
