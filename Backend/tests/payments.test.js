import { jest } from '@jest/globals';

const mockCreateSession = jest.fn();

await jest.unstable_mockModule('../services/stripeClient.js', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCreateSession,
      },
    },
  }),
  resetStripeClient: jest.fn(),
}));

const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { setupTestDb } = await import('./helpers/db.setup.js');
const { studentUser } = await import('./fixtures/users.js');
const { getDb } = await import('../db/init.js');

setupTestDb();

describe('POST /api/payments/checkout', () => {
  let token;

  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_PRICE_BASICO = 'price_basico_test';
    process.env.STRIPE_PRICE_PRO = 'price_pro_test';
    process.env.STRIPE_PRICE_MASTER = 'price_master_test';
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  beforeEach(async () => {
    mockCreateSession.mockReset();
    mockCreateSession.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    await request(app).post('/api/auth/signup').send(studentUser);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: studentUser.email, password: studentUser.password });
    token = loginRes.body.token;
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .send({ plan: 'pro' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for missing plan', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid plan', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ plan: 'enterprise' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should create checkout session and persist pending payment', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ plan: 'pro' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_123',
      sessionId: 'cs_test_123',
    });

    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        line_items: [{ price: 'price_pro_test', quantity: 1 }],
        client_reference_id: expect.any(String),
        metadata: expect.objectContaining({ plan: 'pro' }),
      })
    );

    const db = getDb();
    const rows = await db.exec(
      "SELECT plan_tier, stripe_session_id, amount_cents, status FROM payments WHERE stripe_session_id = ?",
      ['cs_test_123']
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].values.length).toBe(1);
    const [planTier, sessionId, amountCents, status] = rows[0].values[0];
    expect(planTier).toBe('pro');
    expect(sessionId).toBe('cs_test_123');
    expect(amountCents).toBe(2499);
    expect(status).toBe('pending');
  });

  it('should return 502 with safe message when Stripe fails', async () => {
    mockCreateSession.mockRejectedValueOnce(new Error('Stripe API unavailable'));

    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ plan: 'basico' });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Unable to create checkout session' });
    expect(JSON.stringify(res.body)).not.toMatch(/Stripe API unavailable/);
  });
});
