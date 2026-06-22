import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/shared/utils/api';

/**
 * useNotifications — polls the notification endpoint every `interval` ms.
 * audience: 'admin' | 'user'
 */
export default function useNotifications(audience = 'admin', interval = 30000) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const timerRef = useRef(null);

  const endpoint = audience === 'admin' ? '/notifications' : '/notifications/user';

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get(endpoint);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent — user might not be logged in yet
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetch();
    timerRef.current = setInterval(fetch, interval);
    return () => clearInterval(timerRef.current);
  }, [fetch, interval]);

  const markAllRead = useCallback(async () => {
    const url = audience === 'admin' ? '/notifications/read-all' : '/notifications/user/read-all';
    await api.patch(url);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [audience]);

  const markOneRead = useCallback(async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return { notifications, unreadCount, loading, refresh: fetch, markAllRead, markOneRead };
}
