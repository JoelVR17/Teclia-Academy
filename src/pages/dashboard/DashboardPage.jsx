import { ContentGrid } from '../../components/content/ContentGrid.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const DashboardPage = () => {
  const { content, loading } = useContent();
  const { user } = useAuth();

  if (loading) {
    return <div className="loading">Cargando contenido...</div>;
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>👋 Bienvenido, {user?.name}!</h1>
          <p>Explora todo el contenido disponible para tu aprendizaje</p>
        </div>

        <ContentGrid content={content} isAdmin={false} />
      </div>
    </div>
  );
};

export default DashboardPage;
