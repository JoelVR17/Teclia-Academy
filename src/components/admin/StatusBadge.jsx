export const StatusBadge = ({ status, type = 'status' }) => {
  if (type === 'plan') {
    const planStyles = {
      free: 'badge-plan badge-plan-free',
      basico: 'badge-plan badge-plan-basico',
      pro: 'badge-plan badge-plan-pro',
      master: 'badge-plan badge-plan-master',
    };
    const planLabels = {
      free: 'Free',
      basico: 'Básico',
      pro: 'Pro',
      master: 'Master',
    };
    const tier = status || 'free';
    return (
      <span className={planStyles[tier] || 'badge-plan badge-plan-free'}>
        {planLabels[tier] || tier}
      </span>
    );
  }

  if (type === 'content-type') {
    const typeStyles = {
      video: 'badge badge-type badge-type-video',
      pdf: 'badge badge-type badge-type-pdf',
      audio: 'badge badge-type badge-type-audio',
      image: 'badge badge-type badge-type-image',
    };
    return (
      <span className={typeStyles[status] || 'badge badge-type'}>
        {(status || '').toUpperCase()}
      </span>
    );
  }

  if (type === 'publish-status') {
    const pub = status === 'published' ? 'published' : 'draft';
    return (
      <span className={`badge badge-publish badge-publish-${pub}`}>
        {pub === 'published' ? 'Publicado' : 'Borrador'}
      </span>
    );
  }

  const statusStyles = {
    active: 'badge-status badge-status-active',
    inactive: 'badge-status badge-status-inactive',
    suspended: 'badge-status badge-status-suspended',
    pending: 'badge-status badge-status-pending',
    graduated: 'badge-status badge-status-graduated',
  };
  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
    pending: 'Pendiente',
    graduated: 'Graduado',
  };
  return (
    <span className={statusStyles[status] || 'badge-status badge-status-inactive'}>
      {statusLabels[status] || status || 'Desconocido'}
    </span>
  );
};

export default StatusBadge;
