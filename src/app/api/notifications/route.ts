import { NextResponse } from 'next/server';

// In-memory notification data (shared with client-side store via API)
interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'request';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  entityType?: string;
  entityId?: string;
}

let notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'warning',
    title: 'طلاب على إنذار أكاديمي',
    message: 'يوجد 3 طلاب على إنذار أكاديمي في الفصل الحالي ويتطلبون متابعة فورية.',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    link: '#students',
    entityType: 'student',
  },
  {
    id: 'notif-2',
    type: 'request',
    title: 'طلبات بانتظار المراجعة',
    message: 'يوجد 5 طلبات معلقة بانتظار مراجعتك والموافقة عليها.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '#requests',
    entityType: 'request',
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'إعلان جديد تم نشره',
    message: 'تم نشر إعلان "اجتماع مجلس القسم" بواسطة رئيس القسم.',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    link: '#announcements',
    entityType: 'announcement',
  },
  {
    id: 'notif-4',
    type: 'success',
    title: 'تم قبول طلب تحويل',
    message: 'تم قبول طلب تحويل الموظف أحمد محمد إلى قسم علوم الحاسب.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: '#transfers',
    entityType: 'transfer',
  },
  {
    id: 'notif-5',
    type: 'error',
    title: 'تسجيل وصل للحد الأقصى',
    message: 'وصل عدد المسجلين في مقرر CS305 - ذكاء اصطناعي إلى الحد الأقصى (40 طالب).',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    link: '#curriculum',
    entityType: 'course',
  },
  {
    id: 'notif-6',
    type: 'info',
    title: 'تحديث في الجدول الدراسي',
    message: 'تم تحديث وقت محاضرة مقرر هياكل البيانات يوم الأحد القادم.',
    read: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    link: '#scheduling',
    entityType: 'schedule',
  },
];

// GET: Return all notifications
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const unreadOnly = searchParams.get('unread') === 'true';
  const search = searchParams.get('search');

  let result = [...notifications];

  if (type) {
    result = result.filter((n) => n.type === type);
  }

  if (unreadOnly) {
    result = result.filter((n) => !n.read);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
    );
  }

  // Sort by createdAt descending
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    notifications: result,
    unreadCount: notifications.filter((n) => !n.read).length,
  });
}

// POST: Add a new notification
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { type, title, message, link, entityType, entityId } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'النوع والعنوان والرسالة مطلوبة' },
        { status: 400 }
      );
    }

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as NotificationItem['type'],
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      link,
      entityType,
      entityId,
    };

    notifications = [newNotification, ...notifications];

    return NextResponse.json({
      notification: newNotification,
      unreadCount: notifications.filter((n) => !n.read).length,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'فشل معالجة الطلب' },
      { status: 400 }
    );
  }
}

// PUT: Mark as read / mark all as read
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      notifications = notifications.map((n) => ({ ...n, read: true }));
      return NextResponse.json({
        success: true,
        unreadCount: 0,
      });
    }

    if (id) {
      const notification = notifications.find((n) => n.id === id);
      if (!notification) {
        return NextResponse.json(
          { error: 'الإشعار غير موجود' },
          { status: 404 }
        );
      }
      notifications = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return NextResponse.json({
        success: true,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    }

    return NextResponse.json(
      { error: 'يجب تحديد id أو markAll' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'فشل معالجة الطلب' },
      { status: 400 }
    );
  }
}
