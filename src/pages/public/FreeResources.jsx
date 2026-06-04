import { useEffect } from 'react';
import { useContent } from '../../context/ContentContext.jsx';
import { ContentGrid } from '../../components/content/ContentGrid.jsx';

const FreeResources = () => {
  const { content, loadFreeContent, loading } = useContent();

  useEffect(() => {
    loadFreeContent();
  }, []);

  const freeItems = content.filter((c) => c.is_free === 1 || c.is_free === true || c.is_free === '1');

  return (
    <div className="page-shell">
      <section className="section-surface">
        <div className="section-intro">
          <p className="eyebrow">Recursos gratuitos</p>
          <h2>Contenido gratuito para tu práctica</h2>
          <p className="section-copy">Accede a una selección de lecciones y recursos pensados para tu aprendizaje.</p>
        </div>

        <div className="feature-grid">
          {loading ? (
            <p>Cargando...</p>
          ) : freeItems.length === 0 ? (
            <p>No hay recursos gratuitos disponibles aún.</p>
          ) : (
            freeItems.map((item) => (
              <article key={item.id} className="feature-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p className="content-author">Por: {item.uploaded_by_name}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="button button-secondary">Ver</a>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default FreeResources;
