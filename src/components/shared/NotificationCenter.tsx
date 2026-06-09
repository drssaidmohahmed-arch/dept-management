'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ClipboardList,
  Clock,
  ExternalLink,
  X,
  Trash2,
} from 'lucide-react';
import {
  useNotifications,
  useUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  addNotification,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_ICON_COLORS,
} from '@/lib/notification-store';
import type { AppNotification, NotificationType } from '@/lib/notification-store';

// ============ Notification Icon Helper ============

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'success':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return XCircle;
    case 'info':
      return Info;
    case 'request':
      return ClipboardList;
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============ Notification Bell (Dropdown) ============

interface NotificationBellProps {
  onViewAll?: () => void;
}

export function NotificationBell({ onViewAll }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount = useUnreadNotificationCount();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 8);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-slate-100 transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="الإشعارات"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        ) : (
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full min-w-4 h-4 sm:min-w-5 sm:h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden" dir="rtl">
          {/* Header */}
          <div className="bg-gradient-to-l from-blue-600 to-blue-800 text-white p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <h3 className="font-semibold text-sm sm:text-base">الإشعارات</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0">
                    {unreadCount} جديد
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-white/80 hover:text-white hover:bg-white/10 text-[10px] sm:text-xs h-7 px-2"
                  >
                    <CheckCheck className="w-3.5 h-3.5 ml-1" />
                    تعيين الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notification List */}
          <ScrollArea className="max-h-80 sm:max-h-96">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs sm:text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentNotifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                      onClick={() => handleMarkRead(notif.id)}
                    >
                      <div className="flex items-start gap-2.5 flex-row-reverse">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${NOTIFICATION_TYPE_ICON_COLORS[notif.type]} bg-slate-50`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-xs sm:text-sm font-medium truncate ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-row-reverse">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                            <Badge className={`text-[9px] px-1.5 py-0 ${NOTIFICATION_TYPE_COLORS[notif.type]}`}>
                              {NOTIFICATION_TYPE_LABELS[notif.type]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 8 && (
            <div className="border-t p-2 bg-slate-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setOpen(false);
                  onViewAll?.();
                }}
              >
                عرض جميع الإشعارات
                <ExternalLink className="w-3 h-3 mr-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Notification History (Full Page) ============

interface NotificationHistoryProps {
  onBack?: () => void;
}

export function NotificationHistory({ onBack }: NotificationHistoryProps) {
  const notifications = useNotifications();
  const unreadCount = useUnreadNotificationCount();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    if (readFilter === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (readFilter === 'read') {
      filtered = filtered.filter((n) => n.read);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [notifications, typeFilter, readFilter, searchQuery]);

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleAddTestNotification = (type: NotificationType) => {
    const titles: Record<NotificationType, string> = {
      success: 'تم إنجاز مهمة بنجاح',
      warning: 'تنبيه جديد',
      error: 'حدث خطأ',
      info: 'معلومة جديدة',
      request: 'طلب جديد',
    };
    const messages: Record<NotificationType, string> = {
      success: 'تمت عملية التحديث بنجاح في النظام.',
      warning: 'يوجد بيانات تحتاج مراجعة فورية.',
      error: 'فشل الاتصال بقاعدة البيانات مؤقتاً.',
      info: 'تم تحديث إعدادات النظام.',
      request: 'طلب جديد بانتظار الموافقة.',
    };
    addNotification({
      type,
      title: titles[type],
      message: messages[type],
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-700 to-blue-900 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">سجل الإشعارات</h2>
                <p className="text-blue-200 text-xs">
                  {unreadCount > 0
                    ? `${unreadCount} إشعار غير مقروء من أصل ${notifications.length}`
                    : `جميع الإشعارات (${notifications.length})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs border border-white/20"
                >
                  <CheckCheck className="w-3.5 h-3.5 ml-1" />
                  قراءة الكل
                </Button>
              )}
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white/80 hover:text-white hover:bg-white/15 text-xs"
                >
                  <X className="w-4 h-4 ml-1" />
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {([
          { label: 'الإجمالي', value: notifications.length, color: 'bg-slate-50 text-slate-700', icon: Bell },
          { label: 'غير مقروء', value: unreadCount, color: 'bg-blue-50 text-blue-700', icon: BellRing },
          { label: 'نجاح', value: notifications.filter(n => n.type === 'success').length, color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
          { label: 'تحذيرات', value: notifications.filter(n => n.type === 'warning').length, color: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
          { label: 'طلبات', value: notifications.filter(n => n.type === 'request').length, color: 'bg-violet-50 text-violet-700', icon: ClipboardList },
        ] as const).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-row-reverse">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold truncate">{stat.value}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الإشعارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-36 text-sm">
                <Filter className="w-4 h-4 ml-1.5 shrink-0" />
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="success">نجاح</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
                <SelectItem value="info">معلومة</SelectItem>
                <SelectItem value="request">طلب</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-full sm:w-36 text-sm">
                <Check className="w-4 h-4 ml-1.5 shrink-0" />
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="unread">غير مقروء</SelectItem>
                <SelectItem value="read">مقروء</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">لا توجد إشعارات مطابقة</p>
            <p className="text-xs mt-1">جرّب تغيير معايير البحث أو الفلتر</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = getNotificationIcon(notif.type);
            return (
              <Card key={notif.id} className={`overflow-hidden hover:shadow-md transition-shadow ${!notif.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${NOTIFICATION_TYPE_ICON_COLORS[notif.type]} bg-slate-50`}>
                      <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className={`font-semibold text-sm sm:text-base ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notif.title}
                          </h3>
                          <Badge className={`text-[9px] sm:text-[10px] ${NOTIFICATION_TYPE_COLORS[notif.type]}`}>
                            {NOTIFICATION_TYPE_LABELS[notif.type]}
                          </Badge>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleMarkRead(notif.id)}
                              title="تعيين كمقروء"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mt-1">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground flex-row-reverse">
                        <span className="flex items-center gap-1 flex-row-reverse">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 flex-row-reverse">
                          {new Date(notif.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {notif.entityType && (
                          <Badge variant="outline" className="text-[9px]">
                            {notif.entityType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Test Notification Buttons (for demo) */}
      <Card className="overflow-hidden border-dashed">
        <CardHeader className="p-3 sm:p-4 pb-1">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5 text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            اختبار الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-1">
          <div className="flex flex-wrap gap-2">
            {(['success', 'warning', 'error', 'info', 'request'] as NotificationType[]).map((type) => {
              const TestIcon = getNotificationIcon(type);
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTestNotification(type)}
                  className={`text-[10px] sm:text-xs gap-1 ${NOTIFICATION_TYPE_COLORS[type]}`}
                >
                  <TestIcon className="w-3 h-3" />
                  {NOTIFICATION_TYPE_LABELS[type]}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
