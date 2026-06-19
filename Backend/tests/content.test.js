import request from 'supertest';
import app from '../app.js';
import { setupTestDb, promoteUserToAdmin } from './helpers/db.setup.js';
import { normalUser, adminUser } from './fixtures/users.js';
import { validContent } from './fixtures/content.js';

setupTestDb();

describe('Content endpoints', () => {
  let adminToken;

  beforeAll(async () => {
    // app is statically imported so available here
  });

  beforeEach(async () => {
    // create an admin account in DB directly by signing up and promoting
    await request(app).post('/api/auth/signup').send({ name: adminUser.name, email: adminUser.email, password: adminUser.password });

    // escalate to admin by updating DB before login so token reflects admin role
    await promoteUserToAdmin(adminUser.email);

    const loginRes = await request(app).post('/api/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = loginRes.body.token;
  });

  it('GET /api/content should return array (200)', async () => {
    const res = await request(app).get('/api/content');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(Array.isArray(res.body.content)).toBe(true);
  });

  it('Admin can upload content via POST /api/content/upload', async () => {
    const res = await request(app)
      .post('/api/content/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validContent);

    // controller returns 200 with content
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(res.body.content).toHaveProperty('title', validContent.title);
  });

  it('Non-admin cannot upload content', async () => {
    // create normal user and login
    await request(app).post('/api/auth/signup').send(normalUser);
    const r = await request(app).post('/api/auth/login').send({ email: normalUser.email, password: normalUser.password });
    const token = r.body.token;

    const res = await request(app)
      .post('/api/content/upload')
      .set('Authorization', `Bearer ${token}`)
      .send(validContent);

    expect(res.status).toBe(403);
  });

  it('GET /api/content/:id returns 404 for missing id', async () => {
    const res = await request(app).get('/api/content/99999');
    expect([404,400]).toContain(res.status);
  });
});
