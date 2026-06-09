'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, LogOut, Sun, Moon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ROLE_LABELS } from '@/lib/mock-users';
import { useEffect, useState } from 'react';

export function AuthNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Don't show nav on login page or migrate page
  if (!isAuthenticated || pathname === '/login' || pathname === '/migrate') {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        {/* App Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-slate-900" />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
            نظام إدارة القسم الأكاديمي
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-8 h-8 sm:w-9 sm:h-9"
            aria-label="تبديل الوضع الليلي"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-800 dark:text-white truncate max-w-[180px]">
                {user?.name}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 dark:bg-slate-700 dark:text-slate-200">
                {user?.role ? ROLE_LABELS[user.role] : ''}
              </Badge>
            </div>
            <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
              <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold">
                {user?.avatar}
              </AvatarFallback>
            </Avatar>
            {/* Mobile: just show role badge */}
            <Badge variant="secondary" className="sm:hidden text-[10px] px-1.5 py-0 dark:bg-slate-700 dark:text-slate-200">
              {user?.role ? ROLE_LABELS[user.role] : ''}
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-8 dark:bg-slate-700" />

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
            <span className="sm:hidden">خروج</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}