import { useEffect, useRef, useState } from 'react';

const isNativeHls = (video) =>
  typeof video?.canPlayType === 'function' &&
  Boolean(video.canPlayType('application/vnd.apple.mpegurl'));

export const useHlsPlayer = (videoRef, src) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const hlsInstanceRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !src) return undefined;

    const video = videoRef.current;
    setStatus('connecting');
    setError(null);

    const attachNative = () => {
      video.src = src;
      const onPlaying = () => setStatus('playing');
      const onError = () => {
        setStatus('error');
        setError({ message: 'Stream de video no disponible.' });
      };
      video.addEventListener('playing', onPlaying);
      video.addEventListener('error', onError);
      return () => {
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('error', onError);
      };
    };

    if (isNativeHls(video)) {
      return attachNative();
    }

    let cancelled = false;
    let cleanupNative;

    import('hls.js')
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          cleanupNative = attachNative();
          return;
        }
        const hls = new Hls({ enableWorker: true });
        hlsInstanceRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return;
          video.play().catch(() => {});
          setStatus('playing');
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (cancelled) return;
          if (data?.fatal) {
            setStatus('error');
            setError({ message: 'Stream de video no disponible.' });
          }
        });
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setError({ message: 'No se pudo cargar el reproductor HLS.' });
      });

    return () => {
      cancelled = true;
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
      if (cleanupNative) cleanupNative();
      video.removeAttribute('src');
      video.load();
    };
  }, [src, videoRef]);

  const retry = () => setStatus('connecting');

  return { status, error, retry };
};
