export const InactivityModal = ({ onDismiss, onLogout }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="inactivity-title">
    <div className="modal-content inactivity-modal">
      <h2 id="inactivity-title">¿Sigues ahí?</h2>
      <p>Has estado inactivo por un tiempo. Por seguridad, tu sesión se cerrará pronto si no respondes.</p>
      <div className="confirm-dialog-actions">
        <button type="button" className="button button-secondary" onClick={onLogout}>
          Cerrar sesión
        </button>
        <button type="button" className="button button-primary" onClick={onDismiss}>
          Seguir aquí
        </button>
      </div>
    </div>
  </div>
);

export default InactivityModal;
