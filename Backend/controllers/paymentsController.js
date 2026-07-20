import { getDb, saveDatabase } from '../db/init.js';
import { getStripe } from '../services/stripeClient.js';

const PLAN_AMOUNT_CENTS = {
  basico: 999,
  pro: 2499,
  master: 4999,
};

const PLAN_PRICE_ENV = {
  basico: 'STRIPE_PRICE_BASICO',
  pro: 'STRIPE_PRICE_PRO',
  master: 'STRIPE_PRICE_MASTER',
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

export const createCheckout = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    const priceEnvKey = PLAN_PRICE_ENV[plan];
    const priceId = priceEnvKey ? process.env[priceEnvKey] : null;

    if (!priceId) {
      return res.status(400).json({
        error: `Stripe price is not configured for plan "${plan}". Set ${priceEnvKey}.`,
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({ error: 'Payment service is not configured' });
    }

    const frontendUrl = getFrontendUrl();

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${frontendUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/?payment=cancel`,
        client_reference_id: String(userId),
        metadata: {
          plan,
          userId: String(userId),
        },
      });
    } catch (stripeErr) {
      console.error('Stripe checkout session error:', stripeErr);
      return res.status(502).json({ error: 'Unable to create checkout session' });
    }

    const db = getDb();
    const amountCents = PLAN_AMOUNT_CENTS[plan];

    await db.run(
      `INSERT INTO payments (user_id, plan_tier, stripe_session_id, amount_cents, status)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, plan, session.id, amountCents, 'pending']
    );
    saveDatabase();

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('createCheckout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
