let logoutHandler = null;
let sessionExpiredToastHandler = null;
let isLoggingOut = false;

let abortController = new AbortController();

export const getRequestSignal = () => abortController.signal;

export const abortPendingRequests = () => {
  abortController.abort();
  abortController = new AbortController();
};

export const registerLogoutHandler = (fn) => {
  logoutHandler = fn;
};

export const registerSessionExpiredToastHandler = (fn) => {
  sessionExpiredToastHandler = fn;
};

export const invokeLogout = ({ reason = 'expired', showToast = false, redirectTo = null } = {}) => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  const runLogout = () => {
    if (logoutHandler) {
      logoutHandler({ reason, redirectTo });
    }
  };

  if (showToast && sessionExpiredToastHandler) {
    sessionExpiredToastHandler();
    setTimeout(runLogout, 1500);
  } else {
    runLogout();
  }

  setTimeout(() => {
    isLoggingOut = false;
  }, 2000);
};
