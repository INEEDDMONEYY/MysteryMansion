import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '@/shared/utils/api';

const ServerReadyContext = createContext(false);

const POLL_INTERVAL_MS = 3000;           // retry every 3s while warming up
const KEEP_ALIVE_INTERVAL_MS = 5 * 60 * 1000; // 5-min keep-alive once warm
const MAX_WAIT_MS = 60 * 1000;           // give up and proceed after 60s
const WARM_STORAGE_KEY = 'mm_server_warm_at';
// The free-tier host sleeps after ~15 min idle, so a success within the last
// 10 min means it's still awake and the startup screen can be skipped.
const WARM_TTL_MS = 10 * 60 * 1000;

const wasRecentlyWarm = () => {
  try {
    const at = Number(sessionStorage.getItem(WARM_STORAGE_KEY));
    return Number.isFinite(at) && Date.now() - at < WARM_TTL_MS;
  } catch {
    return false;
  }
};

const markWarm = () => {
  try {
    sessionStorage.setItem(WARM_STORAGE_KEY, String(Date.now()));
  } catch {
    // storage unavailable — the gate just runs on every load
  }
};

export function ServerReadyProvider({ children }) {
  const [serverReady, setServerReady] = useState(wasRecentlyWarm);
  const startedAt = useRef(Date.now());
  const keepAliveRef = useRef(null);

  useEffect(() => {
    let pollTimer = null;
    let cancelled = false;

    const ping = async () => {
      try {
        await api.get('/health');
        if (cancelled) return;
        markWarm();
        setServerReady(true);
        // Switch to periodic keep-alive to prevent future cold starts
        keepAliveRef.current = setInterval(() => {
          api.get('/health').then(markWarm).catch(() => {});
        }, KEEP_ALIVE_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        if (Date.now() - startedAt.current >= MAX_WAIT_MS) {
          // Timed out — let the app through anyway
          setServerReady(true);
        } else {
          pollTimer = setTimeout(ping, POLL_INTERVAL_MS);
        }
      }
    };

    ping();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
      clearInterval(keepAliveRef.current);
    };
  }, []);

  return (
    <ServerReadyContext.Provider value={serverReady}>
      {children}
    </ServerReadyContext.Provider>
  );
}

export function useServerReady() {
  return useContext(ServerReadyContext);
}
