import { useEffect } from 'react';
import api from './api';

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Pings /api/health immediately on mount then every 5 minutes.
 * Keeps Render's free-tier server alive during loading screens.
 */
export default function useServerPing() {
  useEffect(() => {
    const ping = () => {
      api.get('/health').catch(() => {
        // Silently ignore — ping is best-effort
      });
    };

    ping();
    const id = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
