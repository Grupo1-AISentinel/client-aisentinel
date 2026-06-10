import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];

const useIdleTimer = ({
  idleMs = 5 * 60 * 1000,
  events = DEFAULT_EVENTS,
  enabled = true,
  pauseOnHidden = true,
  onIdle,
  onActive,
}) => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef(null);
  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);

  useEffect(() => {
    onIdleRef.current = onIdle;
    onActiveRef.current = onActive;
  }, [onIdle, onActive]);

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  const handleActivity = useCallback(() => {
    if (!enabled) return;
    setIsIdle((prev) => {
      if (prev) onActiveRef.current?.();
      return false;
    });
    clearIdleTimeout();
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdleRef.current?.();
    }, idleMs);
  }, [enabled, idleMs, clearIdleTimeout]);

  useEffect(() => {
    if (!enabled) {
      clearIdleTimeout();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsIdle(false);
      return undefined;
    }

    handleActivity();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    let visibilityHandler = null;
    if (pauseOnHidden) {
      visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          handleActivity();
        } else {
          clearIdleTimeout();
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }

    return () => {
      clearIdleTimeout();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
    };
  }, [enabled, events, handleActivity, clearIdleTimeout, pauseOnHidden]);

  const reset = useCallback(() => {
    handleActivity();
  }, [handleActivity]);

  return { isIdle, reset };
};

export default useIdleTimer;
