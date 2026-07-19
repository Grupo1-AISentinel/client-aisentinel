import { useEffect, useRef } from 'react';
import { socketService } from '../../../shared/socket/socketClient.js';
import { SOCKET_EVENTS } from '../../../shared/utils/constants.js';
import { useDetectionStore } from '../stores/detectionStore.js';
import { getAdminClient } from '../../../shared/api/clients.js';

export const useLiveDetections = () => {
  const setLiveFrame = useDetectionStore((s) => s.setLiveFrame);
  const setPyimageConnected = useDetectionStore((s) => s.setPyimageConnected);
  const fetchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // El admin solo emite `pyimage:status` cuando el estado CAMBIA. Si el
    // frontend se conecta despues de un cambio, se lo pierde. Por eso
    // consultamos el endpoint HTTP al montar para sincronizar el estado actual.
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      const fetchInitial = async () => {
        try {
          const client = getAdminClient();
          const res = await client.get('/admin/pyimage-status', { timeout: 5000 });
          if (cancelled || !res) return;
          if (typeof res.connected === 'boolean') {
            setPyimageConnected(res.connected);
          }
        } catch {
          // Silenciar: el socket se encargara de confirmar el estado real.
        }
      };
      fetchInitial();
    }

    const sock = socketService.connect();
    if (!sock)
      return () => {
        cancelled = true;
      };

    const handleLiveFrame = (payload) => {
      if (!payload?.cameraId) return;
      setLiveFrame(payload.cameraId, payload);
    };

    const handlePyimageStatus = (payload) => {
      if (typeof payload?.connected === 'boolean') {
        setPyimageConnected(payload.connected);
      }
    };

    sock.on(SOCKET_EVENTS.DETECTION_LIVE_FRAME, handleLiveFrame);
    sock.on(SOCKET_EVENTS.PYIMAGE_STATUS, handlePyimageStatus);

    return () => {
      cancelled = true;
      sock.off(SOCKET_EVENTS.DETECTION_LIVE_FRAME, handleLiveFrame);
      sock.off(SOCKET_EVENTS.PYIMAGE_STATUS, handlePyimageStatus);
    };
  }, [setLiveFrame, setPyimageConnected]);
};
