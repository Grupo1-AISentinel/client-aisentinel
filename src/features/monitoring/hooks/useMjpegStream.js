import { useEffect, useRef, useState } from 'react';

const STALL_THRESHOLD_MS = 10_000;
const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 10_000;

export const useMjpegStream = (src) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const lastImageAtRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const watchdogRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setImgSrc(null);
      setStatus('idle');
      return undefined;
    }
    setStatus('connecting');
    setError(null);

    const connect = () => {
      const ts = Date.now();
      setImgSrc(`${src}${src.includes('?') ? '&' : '?'}_t=${ts}`);
    };

    const scheduleReconnect = () => {
      const delay = backoffRef.current;
      reconnectTimerRef.current = setTimeout(connect, delay);
      backoffRef.current = Math.min(MAX_BACKOFF_MS, delay * 2);
    };

    const handleLoad = () => {
      backoffRef.current = INITIAL_BACKOFF_MS;
      lastImageAtRef.current = Date.now();
      setStatus('playing');
    };

    const handleError = () => {
      setError({ message: 'Stream MJPEG no disponible. Reintentando…' });
      setStatus('reconnecting');
      scheduleReconnect();
    };

    const img = new Image();
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = `${src}${src.includes('?') ? '&' : '?'}_t=${Date.now()}`;

    watchdogRef.current = setInterval(() => {
      if (!lastImageAtRef.current) return;
      if (Date.now() - lastImageAtRef.current > STALL_THRESHOLD_MS) {
        setStatus('reconnecting');
        setError({ message: 'Stream MJPEG sin datos. Reintentando…' });
        scheduleReconnect();
      }
    }, 5_000);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (watchdogRef.current) clearInterval(watchdogRef.current);
    };
  }, [src]);

  return { status, error, imgSrc };
};
