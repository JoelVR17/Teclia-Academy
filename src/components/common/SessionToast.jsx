import { useEffect, useState } from 'react';

export const SessionToast = ({ message, visible, onDismiss }) => {
  useEffect(() => {
    if (!visible) return undefined;

    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="session-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export const useSessionToast = () => {
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showSessionExpiredToast = () => {
    setToast({
      visible: true,
      message: 'Tu sesión expiró. Inicia sesión de nuevo.',
    });
  };

  const dismissToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return { toast, showSessionExpiredToast, dismissToast };
};
