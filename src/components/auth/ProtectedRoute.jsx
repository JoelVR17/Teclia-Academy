import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

// role: optional prop to restrict to a specific role (e.g. 'admin')
export const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="page-shell">
        <h1>403 - Acceso denegado</h1>
        <p>No tienes permisos suficientes para acceder a esta sección.</p>
        <a href="/" className="button button-primary">Volver a inicio</a>
      </div>
    );
  }

  return children;
};
