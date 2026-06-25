import { useCallback, useEffect, useRef, useState } from 'react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const WARNING_BEFORE = 60 * 1000;

export const useInactivityTimer = (onTimeout, enabled = true) => {
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef(null);
  const warningRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setShowWarning(false);
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current?.();
    }, INACTIVITY_TIMEOUT);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove', 'click'];
    const handler = () => resetTimer();
    events.forEach((e) => document.addEventListener(e, handler, { passive: true }));
    resetTimer();
    return () => {
      events.forEach((e) => document.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [enabled, resetTimer]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  return { showWarning, dismissWarning };
};
