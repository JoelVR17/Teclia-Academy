import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard?reason=forbidden" replace />;
  }

  return children;
};
