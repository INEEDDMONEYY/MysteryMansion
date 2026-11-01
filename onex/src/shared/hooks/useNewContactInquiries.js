import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/utils/api';

// Polls the number of new (unhandled) contact-form inquiries for the admin sidebar.
export default function useNewContactInquiries(interval = 60000) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/contact-inquiries/new-count');
      setCount(Number(data?.count) || 0);
    } catch {
      // silent — admin session may not be ready yet
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, interval);
    window.addEventListener('contact-inquiries-updated', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('contact-inquiries-updated', refresh);
    };
  }, [refresh, interval]);

  return { count, refresh };
}
