import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const PLANS = [
  { label: 'Básico',  price: '$9.99',  value: 'basico'  },
  { label: 'Pro',     price: '$24.99', value: 'pro'     },
  { label: 'Master',  price: '$49.99', value: 'master'  },
];

const STORAGE_KEY = 'checkout_plan';

export const CheckoutFlow = ({ initialPlan, onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return 'review';
    if (initialPlan) return 'review';
    return 'select_plan';
  });
  const [selectedPlan, setSelectedPlan] = useState(() => {
    return initialPlan || sessionStorage.getItem(STORAGE_KEY) || null;
  });
  const [status, setStatus] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Persist plan selection
  useEffect(() => {
    if (selectedPlan) {
      sessionStorage.setItem(STORAGE_KEY, selectedPlan);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedPlan]);

  const planData = PLANS.find((p) => p.label === selectedPlan || p.value === selectedPlan);

  // Step 1: select_plan
  if (step === 'select_plan') {
    return (
      <div className="checkout-step">
        <h3>Selecciona tu plan</h3>
        <div className="checkout-plans">
          {PLANS.map((plan) => (
            <button
              key={plan.value}
              type="button"
              className={`checkout-plan-card ${selectedPlan === plan.label ? 'active' : ''}`}
              onClick={() => { setSelectedPlan(plan.label); }}
            >
              <strong>{plan.label}</strong>
              <span className="checkout-price">{plan.price}</span>
            </button>
          ))}
        </div>
        <button
          className="button button-primary"
          disabled={!selectedPlan}
          onClick={() => {
            if (!user) {
              // auth_required — redirect to login
              const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
              navigate(`/auth/login?returnTo=${returnTo}`);
              return;
            }
            setStep('review');
          }}
        >
          {user ? 'Continuar' : 'Inicia sesión para continuar'}
        </button>
      </div>
    );
  }

  // Step 2: review
  if (step === 'review' && planData) {
    return (
      <div className="checkout-step">
        <h3>Revisa tu compra</h3>
        <div className="checkout-summary">
          <div className="checkout-summary-row">
            <span>Plan</span>
            <strong>{planData.label}</strong>
          </div>
          <div className="checkout-summary-row">
            <span>Precio</span>
            <strong>{planData.price}</strong>
          </div>
          <div className="checkout-summary-row">
            <span>Moneda</span>
            <span>USD</span>
          </div>
          <div className="checkout-summary-row">
            <span>Usuario</span>
            <span>{user?.email}</span>
          </div>
        </div>
        <div className="checkout-actions">
          <button className="button button-secondary" onClick={() => setStep('select_plan')}>
            Atrás
          </button>
          <button className="button button-primary" onClick={() => setStep('payment_method')}>
            Ir a pagar
          </button>
        </div>
      </div>
    );
  }

  // Step 3: payment_method (mock / testing mode)
  if (step === 'payment_method') {
    const handleMockSubmit = async (e) => {
      e.preventDefault();
      setProcessing(true);
      setStatus(null);
      await new Promise((r) => setTimeout(r, 1500));
      setStatus({ type: 'success', message: `¡Pago simulado exitoso para ${planData.label}!` });
      sessionStorage.removeItem(STORAGE_KEY);
      setProcessing(false);
      setTimeout(() => onComplete?.(), 1200);
    };

    return (
      <div className="checkout-step">
        <span className="checkout-mock-badge">Simulador de pago</span>
        <h3>Método de pago</h3>
        <p className="checkout-hint">Plan: <strong>{planData.label}</strong> — {planData.price}</p>
        <form onSubmit={handleMockSubmit} className="checkout-form">
          <div className="form-group">
            <label htmlFor="co-card">Número de tarjeta</label>
            <input id="co-card" type="text" inputMode="numeric" placeholder="4242 4242 4242 4242"
              disabled={processing} />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="co-expiry">Expiración</label>
              <input id="co-expiry" type="text" placeholder="12/28" disabled={processing} />
            </div>
            <div className="form-group half-width">
              <label htmlFor="co-cvc">CVC</label>
              <input id="co-cvc" type="text" inputMode="numeric" placeholder="123" disabled={processing} />
            </div>
          </div>

          {status && (
            <div className={`payment-status ${status.type}`}>{status.message}</div>
          )}

          <div className="checkout-actions">
            <button type="button" className="button button-secondary" onClick={() => setStep('review')} disabled={processing}>
              Atrás
            </button>
            <button type="submit" className="button button-primary" disabled={processing}>
              {processing ? 'Procesando...' : 'Simular pago'}
            </button>
          </div>
          <p className="checkout-mock-note">Los datos no se almacenan ni procesan. Simulador de pruebas.</p>
        </form>
      </div>
    );
  }

  return null;
};

export default CheckoutFlow;