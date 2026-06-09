'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GraduationCap, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_USERS, ROLE_LABELS } from '@/lib/mock-users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (isAuthenticated) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-l from-slate-800 to-slate-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              نظام إدارة القسم الأكاديمي
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Login Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl md:text-2xl">
                تسجيل الدخول
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                أدخل بياناتك للوصول إلى لوحة التحكم
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 text-center">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    placeholder="example@univ.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="h-11 text-left"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="h-11 text-left pl-10"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts Card */}
          <Card className="border border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground text-center">
                حسابات تجريبية للعرض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_USERS.map((mockUser) => (
                  <button
                    key={mockUser.id}
                    type="button"
                    onClick={() => fillDemo(mockUser.email, mockUser.password)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border bg-background hover:bg-accent transition-colors text-right disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                      {mockUser.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{mockUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate" dir="ltr">
                        {mockUser.email} / {mockUser.password}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {ROLE_LABELS[mockUser.role]}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-3 px-4 mt-auto">
        <p className="text-center text-xs text-muted-foreground">
          © ٢٠٢٥ نظام إدارة القسم الأكاديمي - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
