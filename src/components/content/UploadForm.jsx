import { useState } from 'react';
import axios from 'axios';
import { useContent } from '../../context/ContentContext.jsx';
import { BACKEND_BASE_URL } from '../../services/api.js';
import { CONTENT_PLANS } from '../../utils/plans.js';

export const UploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('video');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [planTier, setPlanTier] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { addContent } = useContent();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || (!url && !file)) {
      setError('Título y URL o un archivo son requeridos');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('type', type);
      if (url) form.append('url', url);
      if (file) form.append('file', file);
      form.append('plan_tier', planTier);
      form.append('is_free', planTier === 'free' ? '1' : '0');

      const res = await axios.post(`${BACKEND_BASE_URL}/api/content/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      addContent(res.data.content);
      setSuccess(true);
      setTitle('');
      setDescription('');
      setUrl('');
      setType('video');
      setFile(null);
      setPlanTier('free');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <h2>Añadir contenido</h2>
      <p className="hint">Sube tu lección y elige para qué plan estará disponible.</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Contenido agregado correctamente.</div>}

      <div className="form-group">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Lección 1 - Acordes Mayores"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el contenido brevemente..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Tipo de Contenido</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="audio">Audio</option>
            <option value="image">Imagen</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="planTier">Plan requerido</label>
          <select id="planTier" value={planTier} onChange={(e) => setPlanTier(e.target.value)}>
            {CONTENT_PLANS.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="url">URL del Contenido (opcional si subes un archivo)</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/contenido"
        />
      </div>

      <div className="form-group">
        <label htmlFor="file">Archivo (video/pdf/audio/imagen)</label>
        <input id="file" type="file" onChange={(e) => setFile(e.target.files[0] || null)} accept="video/*,application/pdf,audio/*,image/*" />
      </div>

      <button type="submit" disabled={loading} className="button button-primary button-block">
        {loading ? 'Subiendo...' : 'Añadir contenido'}
      </button>
    </form>
  );
};
