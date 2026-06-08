'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Database,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Play,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface MigrationStatus {
  migrated: boolean;
  tableCount: number;
  totalTables: number;
  tables: string[];
}

type MigrationResult = {
  success: boolean;
  warning?: boolean;
  message?: string;
  error?: string;
  detail?: string;
};

export default function MigratePage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [sqlContent, setSqlContent] = useState('');
  const [sqlLoading, setSqlLoading] = useState(true);

  // Auto migration state
  const [dbPassword, setDbPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  const checkMigration = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/migration-status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ migrated: false, tableCount: 0, totalTables: 14, tables: [] });
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setVerifying(true);
      try {
        const res = await fetch('/api/migration-status');
        const data = await res.json();
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setStatus({ migrated: false, tableCount: 0, totalTables: 14, tables: [] });
      } finally {
        if (!cancelled) {
          setVerifying(false);
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch('/migration.sql')
      .then((res) => res.text())
      .then((text) => {
        setSqlContent(text);
        setSqlLoading(false);
      })
      .catch(() => setSqlLoading(false));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = sqlContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAutoMigration = async () => {
    if (!dbPassword.trim()) return;

    setExecuting(true);
    setMigrationResult(null);

    try {
      const res = await fetch('/api/run-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: dbPassword.trim() }),
      });

      const data = await res.json();
      setMigrationResult(data);

      // If successful, re-check migration status
      if (data.success) {
        setTimeout(() => checkMigration(), 1500);
      }
    } catch {
      setMigrationResult({
        success: false,
        error: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-emerald-600 to-emerald-800 text-white py-5 px-4 sm:py-7">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Database className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">تشغيل قاعدة البيانات</h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                إعداد جداول النظام الجديدة
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        {/* Status Card */}
        <Card className="mb-6 border-2">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                حالة قاعدة البيانات
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={checkMigration}
                disabled={verifying}
                className="flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">التحقق</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : status ? (
              <div className="space-y-4">
                {status.migrated ? (
                  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-emerald-800 text-sm sm:text-base">
                        قاعدة البيانات محدثة بالكامل ✓
                      </h3>
                      <p className="text-emerald-700 text-xs sm:text-sm mt-1">
                        تم تثبيت جميع الجداول ({status.tableCount}/{status.totalTables}) بنجاح.
                        يمكنك الآن استخدام جميع وظائف النظام.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-800 text-sm sm:text-base">
                        تحتاج تحديث قاعدة البيانات ⚠
                      </h3>
                      <p className="text-amber-700 text-xs sm:text-sm mt-1">
                        تم العثور على {status.tableCount} من {status.totalTables} جدول فقط.
                        يرجى تشغيل الـ Migration لتثبيت الجداول المتبقية.
                      </p>
                    </div>
                  </div>
                )}

                {/* Table Progress */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    تقدم التثبيت: {status.tableCount}/{status.totalTables}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        status.migrated
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${(status.tableCount / status.totalTables) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {status.tables.map((table) => (
                      <Badge
                        key={table}
                        variant="outline"
                        className={`text-[10px] sm:text-xs ${
                          status.migrated
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}
                      >
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                تعذر التحقق من حالة قاعدة البيانات.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Auto Execute Migration Card */}
        {!status?.migrated && (
          <Card className="mb-6 border-2 border-dashed border-emerald-300 bg-gradient-to-bl from-emerald-50/50 to-transparent">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                تنفيذ تلقائي للـ Migration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                يمكنك تنفيذ الـ Migration تلقائياً مباشرةً من هنا باستخدام كلمة مرور قاعدة البيانات في Supabase.
                اذهب إلى{' '}
                <span className="font-semibold text-slate-700">Database → Settings → Database password</span>{' '}
                في لوحة تحكم Supabase.
              </p>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  كلمة مرور قاعدة البيانات
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة مرور قاعدة بيانات Supabase..."
                    value={dbPassword}
                    onChange={(e) => {
                      setDbPassword(e.target.value);
                      // Clear previous result when user starts typing again
                      if (migrationResult) setMigrationResult(null);
                    }}
                    disabled={executing}
                    className="pl-10 text-left font-mono"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Execute Button */}
              <Button
                onClick={handleAutoMigration}
                disabled={executing || !dbPassword.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6"
              >
                {executing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري تنفيذ الـ Migration...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    تنفيذ الـ Migration تلقائياً
                  </>
                )}
              </Button>

              {/* Progress while executing */}
              {executing && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 animate-pulse">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700">
                      جاري إنشاء الجداول والبيانات الأولية...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      قد تستغرق العملية بضع ثوانٍ. يرجى عدم إغلاق الصفحة.
                    </p>
                  </div>
                </div>
              )}

              {/* Result */}
              {migrationResult && !executing && (
                <div
                  className={`rounded-xl p-4 ${
                    migrationResult.success
                      ? migrationResult.warning
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-emerald-50 border border-emerald-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {migrationResult.success ? (
                      migrationResult.warning ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      )
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <h4
                        className={`font-bold text-sm sm:text-base ${
                          migrationResult.success
                            ? migrationResult.warning
                              ? 'text-amber-800'
                              : 'text-emerald-800'
                            : 'text-red-800'
                        }`}
                      >
                        {migrationResult.success
                          ? migrationResult.warning
                            ? 'تم التنفيذ مع تحذيرات ⚠'
                            : 'تم التنفيذ بنجاح! ✓'
                          : 'فشل في تنفيذ الـ Migration ✗'}
                      </h4>
                      <p
                        className={`text-xs sm:text-sm ${
                          migrationResult.success
                            ? migrationResult.warning
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                            : 'text-red-700'
                        }`}
                      >
                        {migrationResult.success
                          ? migrationResult.message
                          : migrationResult.error}
                      </p>
                      {migrationResult.warning && migrationResult.detail && (
                        <p className="text-[10px] sm:text-xs text-amber-600 mt-1 font-mono break-all" dir="ltr">
                          {migrationResult.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Re-check button after success */}
                  {migrationResult.success && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkMigration}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        التحقق من حالة قاعدة البيانات
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Supabase SQL Editor Link */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  أو افتح محرر SQL في Supabase مباشرةً
                </div>
                <a
                  href="https://supabase.com/dashboard/project/dkgxduabjctcuundkcrh/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  محرر SQL في Supabase
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card - only show if not migrated */}
        {!status?.migrated && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <CardTitle className="text-base sm:text-lg">خطوات التثبيت اليدوي</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    ١
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800">
                      انسخ كود SQL
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      اضغط على زر &quot;نسخ&quot; أدناه لنسخ كود الـ Migration بالكامل.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    ٢
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800">
                      افتح محرر SQL في Supabase
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      اذهب إلى لوحة تحكم Supabase ← SQL Editor (أو استخدم الواجهة البرمجية).
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    ٣
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800">
                      الصق الكود ونفذه
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      الصق كود SQL في المحرر ثم اضغط &quot;Run&quot; لتنفيذ الاستعلام.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    ٤
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800">
                      تحقق من التثبيت
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      ارجع إلى هذه الصفحة واضغط &quot;التحقق من Migration&quot; للتأكد من نجاح التثبيت.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SQL Code Block */}
        {!status?.migrated && (
          <Card>
            <CardHeader className="p-4 sm:p-5 pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg">كود Migration (SQL)</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlExpanded(!sqlExpanded)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {sqlExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">طي</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">توسيع</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        تم النسخ!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        نسخ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              {sqlLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                <div
                  className={`relative rounded-xl border bg-slate-900 overflow-hidden ${
                    sqlExpanded ? 'max-h-[600px]' : 'max-h-64'
                  } overflow-y-auto transition-all duration-300`}
                >
                  {!sqlExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />
                  )}
                  <pre className="p-4 sm:p-5 text-xs sm:text-sm text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap break-all" dir="ltr">
                    <code>{sqlContent}</code>
                  </pre>
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                ({sqlContent.length.toLocaleString('ar-SA')} حرف)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Verify Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={checkMigration}
            disabled={verifying}
            size="lg"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base px-6 sm:px-8 h-12 sm:h-14"
          >
            {verifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                التحقق من Migration
              </>
            )}
          </Button>
        </div>

        {/* Already migrated message */}
        {status?.migrated && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div className="text-right">
                <p className="font-bold text-emerald-800 text-sm sm:text-base">
                  كل شيء جاهز!
                </p>
                <p className="text-emerald-600 text-xs sm:text-sm mt-0.5">
                  جميع الجداول مثبتة وعاملة
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 mx-auto text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  العودة للنظام
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-3 px-4 mt-auto">
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground">
          © ٢٠٢٥ نظام إدارة القسم الأكاديمي - صفحة تشغيل قاعدة البيانات
        </p>
      </footer>
    </div>
  );
}
