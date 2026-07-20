import { useState } from 'react';
import { STUDENT_PLANS } from '../../utils/plans.js';

export const PlanAssignModal = ({ student, currentPlan, onSave, onCancel }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(student.id, selectedPlan);
      setFeedback({ type: 'success', message: `Plan actualizado a ${STUDENT_PLANS.find(p => p.value === selectedPlan)?.label || 'Sin plan'}` });
      setTimeout(() => onCancel(), 1500);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error al actualizar el plan. Intente de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
      <div className="modal-content plan-assign-modal">
        <h2 id="plan-modal-title">Asignar plan - {student.name}</h2>

        <div className="plan-assign-current">
          <span className="plan-assign-current-label">Plan actual:</span>
          <span className="plan-assign-current-value">{STUDENT_PLANS.find(p => p.value === currentPlan)?.label || 'Sin plan'}</span>
        </div>

        <div className="form-group">
          <label htmlFor="plan-select">Seleccionar nuevo plan</label>
          <select
            id="plan-select"
            className="plan-select"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            disabled={saving}
          >
            {STUDENT_PLANS.map((plan) => (
              <option key={plan.value || 'none'} value={plan.value}>
                {plan.label}
              </option>
            ))}
          </select>
        </div>

        {feedback && (
          <div className={`plan-feedback plan-feedback-${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="confirm-dialog-actions">
          <button type="button" className="button button-secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="button button-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanAssignModal;
