import prisma from '../utils/prismaClient.js';
import https from 'https';

const STRIPE_API_BASE = 'api.stripe.com';
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';

const stripeRequest = ({ path, method = 'POST', body, idempotencyKey }) => new Promise((resolve, reject) => {
  const data = new URLSearchParams(body).toString();
  const options = {
    hostname: STRIPE_API_BASE,
    path,
    method,
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
  };

  const req = https.request(options, (res) => {
    let raw = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(raw);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject(parsed);
        }
      } catch (err) {
        reject(err);
      }
    });
  });

  req.on('error', (err) => reject(err));
  req.write(data);
  req.end();
});

export async function createOrReusePayment({ userId, paymentMethodId, planTier, idempotencyKey }) {
  if (!idempotencyKey) throw new Error('idempotencyKey required');

  // Minimal plan to amount mapping (USD cents)
  const PLAN_AMOUNTS = { basico: 999, pro: 2499, master: 4999 };
  const amount = PLAN_AMOUNTS[planTier] ?? 0;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({ where: { idempotencyKey } }).catch(() => null);
    if (existing) return existing;

    const payment = await tx.payment.create({
      data: {
        userId,
        amount,
        currency: 'usd',
        planTier,
        paymentMethodId,
        idempotencyKey,
        status: 'pending',
      },
    });

    // Create PaymentIntent at Stripe using idempotency key
    try {
      if (!STRIPE_SECRET && process.env.NODE_ENV === 'test') {
        const stripeId = `test_pi_${payment.id}_${Date.now()}`;
        const updated = await tx.payment.update({ where: { id: payment.id }, data: { stripePaymentIntentId: stripeId } });
        return updated;
      }

      const body = {
        amount: String(amount),
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: 'true',
        'metadata[paymentId]': String(payment.id),
        'metadata[idempotencyKey]': idempotencyKey,
      };

      const res = await stripeRequest({ path: '/v1/payment_intents', body, idempotencyKey });
      const stripeId = res.id;

      const updated = await tx.payment.update({ where: { id: payment.id }, data: { stripePaymentIntentId: stripeId } });
      console.info({
        userId,
        paymentId: updated.id,
        stripePaymentIntentId: stripeId,
        idempotencyKey,
        outcome: 'processed',
        timestamp: new Date().toISOString(),
      }, 'Stripe payment intent created');

      return updated;
    } catch (err) {
      // Leave payment as pending/failed depending on error
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'failed' } }).catch(() => {});
      throw err;
    }
  });
}

export async function markPaymentProcessed({ paymentId }) {
  return prisma.payment.update({ where: { id: paymentId }, data: { status: 'processed' } });
}

export default { createOrReusePayment, markPaymentProcessed };
