import { useEffect, useRef, useState } from 'react';

const ERROR_MESSAGES = {
  NotAllowedError: 'Permiso de cámara denegado. Habilítelo en los ajustes del navegador.',
  NotFoundError: 'No se encontró ninguna cámara en este dispositivo.',
  OverconstrainedError: 'La cámara solicitada no está disponible.',
  NotReadableError: 'La cámara está siendo usada por otra aplicación.',
  SecurityError: 'El acceso a cámara requiere HTTPS en producción.',
};

const buildConstraints = (deviceId, facingMode) => {
  const video = {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15 },
  };
  if (typeof deviceId === 'string' && deviceId.length > 0) {
    video.deviceId = { exact: deviceId };
  } else if (facingMode) {
    video.facingMode = facingMode;
  }
  return { video, audio: false };
};

const messageFor = (err) =>
  ERROR_MESSAGES[err?.name] || err?.message || 'Error desconocido al acceder a la cámara.';

export const useMediaStream = ({ deviceId, facingMode, enabled = true }) => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setError(null);
    setStatus('connecting');

    if (!enabled) {
      setStatus('idle');
      return undefined;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setError({
        name: 'UnsupportedError',
        message: 'Su navegador no soporta acceso a cámara.',
      });
      return undefined;
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setStatus('error');
      setError({
        name: 'SecurityError',
        message: 'El acceso a cámara requiere HTTPS en producción.',
      });
      return undefined;
    }

    const constraints = buildConstraints(deviceId, facingMode);
    let activeStream = null;

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((mediaStream) => {
        if (cancelledRef.current) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        activeStream = mediaStream;
        setStream(mediaStream);
        setStatus('playing');
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        setStatus('error');
        setError({ name: err.name || 'Error', message: messageFor(err) });
      });

    return () => {
      cancelledRef.current = true;
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId, facingMode, enabled]);

  const retry = () => {
    setStatus('connecting');
    setError(null);
  };

  return { stream, status, error, retry };
};
