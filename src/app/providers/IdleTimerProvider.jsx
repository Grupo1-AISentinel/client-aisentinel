import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../features/auth/stores/authStore.js';
import { authService } from '../../features/auth/services/authService.js';
import useIdleTimer from '../../shared/hooks/useIdleTimer.js';
import IdleWarningModal from '../../shared/components/feedback/IdleWarningModal.jsx';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const WARNING_DURATION_MS = 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;

const IdleTimerProvider = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showWarning, setShowWarning] = useState(false);
  const heartbeatRef = useRef(null);

  const performLogout = useCallback(
    (reason) => {
      try {
        authService.logout();
      } catch {
        /* el store tolera fallos */
      }
      setShowWarning(false);
      if (reason) toast(reason, { icon: '⏱️', duration: 4000 });
      navigate('/', { replace: true });
    },
    [navigate]
  );

  const handleIdle = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleActive = useCallback(() => {
    setShowWarning(false);
  }, []);

  const { reset: resetIdleTimer } = useIdleTimer({
    idleMs: IDLE_TIMEOUT_MS,
    enabled: isAuthenticated,
    onIdle: handleIdle,
    onActive: handleActive,
  });

  const handleContinue = useCallback(() => {
    resetIdleTimer();
    setShowWarning(false);
  }, [resetIdleTimer]);

  const handleLogoutNow = useCallback(() => {
    performLogout(null);
  }, [performLogout]);

  const handleAutoLogout = useCallback(() => {
    performLogout('Sesión cerrada por inactividad');
  }, [performLogout]);

  useEffect(() => {
    if (!showWarning) return undefined;
    const timeout = setTimeout(handleAutoLogout, WARNING_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [showWarning, handleAutoLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      return undefined;
    }

    const sendHeartbeat = () => {
      authService.heartbeat().catch(() => {
        /* omitir errores transitorios del heartbeat */
      });
    };

    // Esperar al primer intervalo para evitar golpear el backend en el render inicial
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return (
    <>
      {children}
      <IdleWarningModal
        open={showWarning}
        countdownSeconds={Math.ceil(WARNING_DURATION_MS / 1000)}
        onContinue={handleContinue}
        onLogoutNow={handleLogoutNow}
      />
    </>
  );
};

export default IdleTimerProvider;
