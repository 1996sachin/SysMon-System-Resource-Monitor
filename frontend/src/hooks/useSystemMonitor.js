import { useState, useEffect, useRef, useCallback } from 'react';

// In Docker: nginx proxies /ws/ → backend, so use same host/port as the page.
// In dev: fall back to localhost:8000 directly.
export const WS_URL = process.env.REACT_APP_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/monitor/`;

export function useSystemMonitor() {
  const [data, setData]           = useState(null);
  const [status, setStatus]       = useState('connecting'); // connecting | connected | error
  const [history, setHistory]     = useState([]);
  const wsRef                     = useRef(null);
  const reconnectRef              = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen  = () => setStatus('connected');
      ws.onclose = () => {
        setStatus('error');
        reconnectRef.current = setTimeout(connect, 3000);
      };
      ws.onerror = () => setStatus('error');
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        setData(d);
        setHistory(prev => {
          const next = [...prev, {
            time:         d.timestamp,
            cpu:          d.cpu?.percent ?? 0,
            ram:          d.ram?.percent ?? 0,
            disk:         d.disks?.[0]?.percent ?? 0,
          }];
          return next.length > 120 ? next.slice(-120) : next;
        });
      };
    } catch (_) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { data, status, history };
}
