import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

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

    // Read the migration SQL file
    const sqlPath = join(process.cwd(), 'public', 'migration.sql');
    let sql: string;
    try {
      sql = readFileSync(sqlPath, 'utf-8');
    } catch {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على ملف migration.sql' },
        { status: 500 }
      );
    }

    if (!sql || sql.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'ملف migration.sql فارغ' },
        { status: 500 }
      );
    }

    // Connect to Supabase Postgres directly
    const connectionString = `postgresql://postgres:${encodeURIComponent(password.trim())}@db.dkgxduabjctcuundkcrh.supabase.co:5432/postgres`;

    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      // Set a reasonable timeout for large migrations
      statement_timeout: 120000,
      query_timeout: 120000,
      connection_timeout: 30000,
    });

    await client.connect();

    try {
      await client.query(sql);
    } catch (queryError: unknown) {
      const err = queryError as Error & { code?: string; detail?: string };
      const errorCode = err.code || '';
      const errorMessage = err.message || 'خطأ غير معروف';

      // If tables already exist, it's a partial success scenario
      const isAlreadyExists =
        errorCode === '42P07' || // duplicate_table
        errorCode === '42710' || // duplicate_object
        errorCode === '42P06' || // duplicate_schema
        errorCode === '42P10' || // duplicate_column
        errorCode === '42701' || // duplicate_column (another variant)
        errorMessage.includes('already exists') ||
        errorMessage.includes('already exists');

      // If it's just "already exists" errors for some objects, still consider it
      // but report which ones failed
      if (isAlreadyExists) {
        await client.end();
        return NextResponse.json({
          success: true,
          warning: true,
          message: 'تم تنفيذ الـ Migration مع بعض التحذيرات - بعض الجداول أو العناصر كانت موجودة مسبقاً',
          detail: errorMessage,
        });
      }

      // Check for missing referenced tables/functions (e.g., members, courses, update_updated_at_column)
      const isMissingRelation =
        errorCode === '42P01' || // undefined_table
        errorCode === '42883' || // undefined_function
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('does not exist');

      await client.end();

      if (isMissingRelation) {
        return NextResponse.json({
          success: false,
          error: `خطأ في التبعيات: ${errorMessage}. يرجى التأكد من أن الـ Migration الأول تم تنفيذه أولاً.`,
          code: errorCode,
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
      warning: false,
      message: 'تم تنفيذ الـ Migration بنجاح! تم إنشاء جميع الجداول والبيانات الأولية.',
    });
  } catch (authError: unknown) {
    const err = authError as Error;

    // Authentication errors from pg
    const errorMessage = err.message || '';

    if (
      errorMessage.includes('authentication failed') ||
      errorMessage.includes('password authentication') ||
      errorMessage.includes('invalid password') ||
      errorMessage.includes('no password supplied')
    ) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور غير صحيحة. يرجى التحقق من كلمة مرور قاعدة البيانات.' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      return NextResponse.json(
        { success: false, error: 'تعذر الاتصال بخادم قاعدة البيانات. يرجى التحقق من الاتصال بالإنترنت.' },
        { status: 503 }
      );
    }

    if (
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('connect ETIMEDOUT') ||
      errorMessage.includes('Connection terminated')
    ) {
      return NextResponse.json(
        { success: false, error: 'تعذر الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `حدث خطأ غير متوقع: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
