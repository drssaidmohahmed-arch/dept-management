'use client';

import React, { createContext, useContext, useCallback, useEffect, useSyncExternalStore, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AuthUser,
  UserRole,
  authenticateUser,
} from './mock-users';

const AUTH_STORAGE_KEY = 'academic_auth_user';
const AUTH_EVENT = 'auth-state-change';
const INIT_EVENT = 'auth-init-change';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AuthUser;
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return null;
}

function storeUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function emitAuthChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function subscribeToAuth(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}

// Initialization flag outside React to track first client render
let isClientInitialized = false;

function subscribeToInit(callback: () => void) {
  window.addEventListener(INIT_EVENT, callback);
  return () => window.removeEventListener(INIT_EVENT, callback);
}

function getIsInitialized() {
  return isClientInitialized;
}

function getServerIsInitialized() {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribeToAuth, getStoredUser, () => null);
  const isInitialized = useSyncExternalStore(subscribeToInit, getIsInitialized, getServerIsInitialized);
  const router = useRouter();
  const pathname = usePathname();
  const pendingRedirect = useRef(false);

  // Mark as initialized and handle redirect after hydration
  useEffect(() => {
    isClientInitialized = true;
    window.dispatchEvent(new Event(INIT_EVENT));

    if (!user && pathname !== '/login' && pathname !== '/migrate') {
      pendingRedirect.current = true;
      router.replace('/login');
    }
  }, []);

  // Handle redirect when user becomes null after initialization
  useEffect(() => {
    if (!isInitialized || pendingRedirect.current) return;
    if (pathname === '/login' || pathname === '/migrate') return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, isInitialized, pathname, router]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const authenticatedUser = authenticateUser(email, password);
      if (!authenticatedUser) {
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      storeUser(authenticatedUser);
      emitAuthChange();
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    storeUser(null);
    emitAuthChange();
    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    login,
    logout,
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
