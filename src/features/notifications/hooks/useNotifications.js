import { useEffect } from 'react';
import { socketService } from '../../../shared/socket/socketClient.js';
import { notificationsApi } from '../../../shared/api/adminApi.js';
import { SOCKET_EVENTS } from '../../../shared/utils/constants.js';
import { useNotificationStore } from '../stores/notificationStore.js';

export const useNotifications = () => {
  const setItems = useNotificationStore((s) => s.setItems);
  const prepend = useNotificationStore((s) => s.prepend);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const setLastReadAt = useNotificationStore((s) => s.setLastReadAt);

  useEffect(() => {
    let cancelled = false;

    const fetchInitial = async () => {
      try {
        const [listResponse, countResponse] = await Promise.all([
          notificationsApi.getMy({ limit: 30 }),
          notificationsApi.getUnreadCount(),
        ]);
        if (cancelled) return;
        setItems(listResponse?.items || []);
        setUnreadCount(countResponse?.count || 0);
        if (countResponse?.lastReadAt) setLastReadAt(countResponse.lastReadAt);
      } catch {
        if (!cancelled) {
          setItems([]);
          setUnreadCount(0);
        }
      }
    };

    fetchInitial();

    const sock = socketService.connect();
    if (!sock)
      return () => {
        cancelled = true;
      };

    const handleNew = (payload) => {
      if (payload?._id) prepend(payload);
    };

    sock.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNew);

    return () => {
      cancelled = true;
      sock.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNew);
    };
  }, [setItems, prepend, setUnreadCount, setLastReadAt]);
};
