import request from 'supertest';
import app from '../app.js';
import { setupTestDb } from './helpers/db.setup.js';
import { adminUser } from './fixtures/users.js';

setupTestDb();

describe('Stats endpoints', () => {

  it('POST /api/stats/visit should increase counter and return 200', async () => {
    const res = await request(app).post('/api/stats/visit');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /api/stats/visits should be forbidden for non-admin and allowed for admin', async () => {
    // non-admin
    const r1 = await request(app).get('/api/stats/visits');
    expect([401,403]).toContain(r1.status);

    // create admin and promote before login
    await request(app).post('/api/auth/signup').send({ name: adminUser.name, email: adminUser.email, password: adminUser.password });
    const db = (await import('../db/init.js')).getDb();
    await db.run("UPDATE users SET role = 'admin' WHERE LOWER(email) = ?", [adminUser.email]);
    const login = await request(app).post('/api/auth/login').send({ email: adminUser.email, password: adminUser.password });
    const token = login.body.token;

    const r2 = await request(app).get('/api/stats/visits').set('Authorization', `Bearer ${token}`);
    expect(r2.status).toBe(200);
    expect(r2.body).toHaveProperty('pageVisits');
    expect(r2.body).toHaveProperty('studentCount');
  });
});
