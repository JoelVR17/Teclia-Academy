import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getStoredToken, isTokenExpired } from '../../utils/jwt.js';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, clearSession } = useAuth();
  const location = useLocation();
  const storedToken = getStoredToken();
  const currentPath = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!loading && storedToken && isTokenExpired(storedToken)) {
      clearSession({ reason: 'expired' });
    }
  }, [loading, storedToken, clearSession]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (storedToken && isTokenExpired(storedToken)) {
    return <Navigate to="/auth/login?reason=expired" replace />;
  }

  if (!user) {
    const redirect = encodeURIComponent(currentPath);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }

  return children;
};
