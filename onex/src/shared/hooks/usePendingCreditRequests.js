import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/utils/api';

// Polls the number of credit requests waiting for admin review.
export default function usePendingCreditRequests(interval = 30000) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/credit-requests/pending-count');
      setCount(Number(data?.count) || 0);
    } catch {
      // silent — admin session may not be ready yet
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, interval);
    window.addEventListener('credit-requests-updated', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('credit-requests-updated', refresh);
    };
  }, [refresh, interval]);

  return { count, refresh };
}
