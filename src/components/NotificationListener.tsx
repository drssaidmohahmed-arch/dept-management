'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function NotificationListener() {
  useEffect(() => {
    function handleNotification(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (detail.isError) {
        toast.error(detail.message);
      } else {
        toast.success(detail.message);
      }
    }

    window.addEventListener('app-notification', handleNotification);
    return () => {
      window.removeEventListener('app-notification', handleNotification);
    };
  }, []);

  return null;
}
