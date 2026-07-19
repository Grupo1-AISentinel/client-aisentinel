import { useEffect, useRef } from 'react';
import { socketService } from '../../../shared/socket/socketClient.js';
import { SOCKET_EVENTS } from '../../../shared/utils/constants.js';
import { useDetectionStore } from '../stores/detectionStore.js';

const PRUNE_INTERVAL_MS = 1000;

export const useDetectionAlerts = () => {
  const addDetection = useDetectionStore((s) => s.addDetection);
  const pruneExpired = useDetectionStore((s) => s.pruneExpired);
  const pruneRef = useRef(pruneExpired);

  useEffect(() => {
    pruneRef.current = pruneExpired;
  }, [pruneExpired]);

  useEffect(() => {
    const sock = socketService.connect();
    if (!sock) return undefined;

    const handleAlert = (payload) => {
      const cameraId = payload?.cameraId || payload?.camera_id;
      if (!cameraId) return;
      addDetection(payload);
    };

    socketService.on(SOCKET_EVENTS.DETECTION_ALERT, handleAlert);

    const pruneInterval = setInterval(() => pruneRef.current?.(), PRUNE_INTERVAL_MS);

    return () => {
      clearInterval(pruneInterval);
      socketService.off(SOCKET_EVENTS.DETECTION_ALERT, handleAlert);
    };
  }, [addDetection]);
};
