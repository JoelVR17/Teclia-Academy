import { ContentGrid } from '../../components/content/ContentGrid.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import axios from 'axios';
import { BACKEND_BASE_URL } from '../../services/api.js';

export const AdminContentPage = () => {
  const { content, removeContent } = useContent();

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contenido?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(
          `${BACKEND_BASE_URL}/api/content/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        removeContent(id);
      } catch (err) {
        alert('Error al eliminar contenido: ' + err.response?.data?.error);
      }
    }
  };

  const stats = {
    total: content.length,
    videos: content.filter(c => c.type === 'video').length,
    pdfs: content.filter(c => c.type === 'pdf').length,
    audios: content.filter(c => c.type === 'audio').length,
    images: content.filter(c => c.type === 'image').length,
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Gestor de contenido</h1>
          <p>Administra el contenido publicado en la plataforma</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.videos}</div>
            <div className="stat-label">Videos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pdfs}</div>
            <div className="stat-label">PDFs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.audios}</div>
            <div className="stat-label">Audios</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.images}</div>
            <div className="stat-label">Imágenes</div>
          </div>
        </div>

        <ContentGrid
          content={content}
          onDelete={handleDelete}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default AdminContentPage;
