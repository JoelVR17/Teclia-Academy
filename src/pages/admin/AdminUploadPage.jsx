import { UploadForm } from '../../components/content/UploadForm.jsx';
import { ContentGrid } from '../../components/content/ContentGrid.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import axios from 'axios';
import { BACKEND_BASE_URL } from '../../services/api.js';

export const AdminUploadPage = () => {
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

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Gestionar contenido</h1>
          <p>Publica recursos claros y profesionales para tu comunidad. Accede a todos los contenidos desde este panel.</p>
        </div>

        <div className="admin-grid">
          <div className="admin-upload-section">
            <UploadForm />
          </div>

          <div className="admin-content-section">
            <h2>Contenido Reciente</h2>
            <ContentGrid
              content={content.slice(0, 5)}
              onDelete={handleDelete}
              isAdmin={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadPage;
