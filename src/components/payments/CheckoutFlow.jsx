import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import StripeCardForm from './StripeCardForm.jsx';

const PLANS = [
  { label: 'Básico',  price: '$9.99',  value: 'basico'  },
  { label: 'Pro',     price: '$24.99', value: 'pro'     },
  { label: 'Master',  price: '$49.99', value: 'master'  },
];

const STORAGE_KEY = 'checkout_plan';

export const CheckoutFlow = ({ initialPlan, onComplete, renderPaymentForm }) => {
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

  // Step 3: payment_method (tokenized securely by Stripe Elements)
  if (step === 'payment_method' && planData) {
    const handlePaymentSuccess = () => {
      sessionStorage.removeItem(STORAGE_KEY);
      setTimeout(() => onComplete?.(), 1200);
    };

    const paymentForm = renderPaymentForm
      ? renderPaymentForm({ plan: planData, onSuccess: handlePaymentSuccess })
      : (
        <StripeCardForm
          submitLabel="Pagar ahora"
          successMessage={`Método de pago del plan ${planData.label} enviado correctamente.`}
          onSuccess={handlePaymentSuccess}
        />
      );

    return (
      <div className="checkout-step">
        <h3>Método de pago</h3>
        <p className="checkout-hint">Plan: <strong>{planData.label}</strong> — {planData.price}</p>
        <button type="button" className="button button-secondary" onClick={() => setStep('review')}>
          Atrás
        </button>
        {paymentForm}
      </div>
    );
  }

  return null;
};

export default CheckoutFlow;
