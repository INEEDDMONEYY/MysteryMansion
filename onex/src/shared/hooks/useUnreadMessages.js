import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/shared/utils/api';

/**
 * useUnreadMessages — polls the unread message count every `interval` ms.
 */
export default function useUnreadMessages(interval = 30000) {
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/unread/count');
      setUnreadCount(Number(data?.unreadCount) || 0);
    } catch {
      // silent — user might not be logged in yet
    }
  }, []);

  useEffect(() => {
    fetch();
    timerRef.current = setInterval(fetch, interval);
    return () => clearInterval(timerRef.current);
  }, [fetch, interval]);

  return { unreadCount, refresh: fetch };
}
