'use client';

import { useSyncExternalStore, useCallback } from 'react';

// ============ Types ============

export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'request';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  entityType?: string;
  entityId?: string;
}

// ============ In-Memory Store ============

let notifications: AppNotification[] = [];
const listeners = new Set<() => void>();

const EMPTY_ARRAY: unknown[] = [];

// ============ Seed some initial notifications for demo ============

function seedNotifications() {
  const now = new Date();
  const hour = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  notifications = [
    {
      id: 'notif-1',
      type: 'warning',
      title: 'طلاب على إنذار أكاديمي',
      message: 'يوجد 3 طلاب على إنذار أكاديمي في الفصل الحالي ويتطلبون متابعة فورية.',
      read: false,
      createdAt: hour(1),
      link: '#students',
      entityType: 'student',
    },
    {
      id: 'notif-2',
      type: 'request',
      title: 'طلبات بانتظار المراجعة',
      message: 'يوجد 5 طلبات معلقة بانتظار مراجعتك والموافقة عليها.',
      read: false,
      createdAt: hour(2),
      link: '#requests',
      entityType: 'request',
    },
    {
      id: 'notif-3',
      type: 'info',
      title: 'إعلان جديد تم نشره',
      message: 'تم نشر إعلان "اجتماع مجلس القسم" بواسطة رئيس القسم.',
      read: false,
      createdAt: hour(3),
      link: '#announcements',
      entityType: 'announcement',
    },
    {
      id: 'notif-4',
      type: 'success',
      title: 'تم قبول طلب تحويل',
      message: 'تم قبول طلب تحويل الموظف أحمد محمد إلى قسم علوم الحاسب.',
      read: true,
      createdAt: hour(24),
      link: '#transfers',
      entityType: 'transfer',
    },
    {
      id: 'notif-5',
      type: 'error',
      title: 'تسجيل وصل للحد الأقصى',
      message: 'وصل عدد المسجلين في مقرر CS305 - ذكاء اصطناعي إلى الحد الأقصى (40 طالب).',
      read: true,
      createdAt: hour(48),
      link: '#curriculum',
      entityType: 'course',
    },
    {
      id: 'notif-6',
      type: 'info',
      title: 'تحديث في الجدول الدراسي',
      message: 'تم تحديث وقت محاضرة مقرر هياكل البيانات يوم الأحد القادم.',
      read: true,
      createdAt: hour(72),
      link: '#scheduling',
      entityType: 'schedule',
    },
  ];
}

seedNotifications();

// ============ Store Functions ============

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  const newNotification: AppNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications = [newNotification, ...notifications];
  emitChange();

  // Also fire toast via custom event
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app-notification', {
      detail: { message: notification.title, isError: notification.type === 'error' },
    });
    window.dispatchEvent(event);
  }

  return newNotification;
}

export function markAsRead(id: string) {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  emitChange();
}

export function markAllAsRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  emitChange();
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function getAll(): AppNotification[] {
  return [...notifications];
}

export function getUnread(): AppNotification[] {
  return notifications.filter((n) => !n.read);
}

// ============ React Hook ============

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): AppNotification[] {
  return notifications;
}

export function useNotifications(): AppNotification[] {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribe(listener),
    []
  );
  return useSyncExternalStore(subscribeFn, getSnapshot);
}

export function useUnreadNotificationCount(): number {
  const subscribeFn = useCallback(
    (listener: () => void) => subscribe(listener),
    []
  );
  return useSyncExternalStore(
    subscribeFn,
    () => getUnreadCount()
  );
}

// ============ Notification Type Helpers ============

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  success: 'نجاح',
  warning: 'تحذير',
  error: 'خطأ',
  info: 'معلومة',
  request: 'طلب',
};

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  request: 'bg-violet-100 text-violet-700 border-violet-200',
};

export const NOTIFICATION_TYPE_ICON_COLORS: Record<NotificationType, string> = {
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  request: 'text-violet-600',
};
