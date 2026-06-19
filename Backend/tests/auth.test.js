import request from 'supertest';
import app from '../app.js';
import { setupTestDb } from './helpers/db.setup.js';
import { normalUser } from './fixtures/users.js';

setupTestDb();

describe('Auth endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user with valid data and return 200', async () => {
      const res = await request(app).post('/api/auth/signup').send(normalUser);
      expect([200,201]).toContain(res.status);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', normalUser.email.toLowerCase());
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
    });

    it('should not allow duplicate email', async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
      const res = await request(app).post('/api/auth/signup').send(normalUser);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
    });

    it('should login with valid credentials and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: normalUser.email, password: normalUser.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: normalUser.email, password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('should fail for nonexistent user', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'nope@test.com', password: 'abc' });
      expect(res.status).toBe(401);
    });
  });

  describe('Protected routes and logout', () => {
    let token;
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
      const r = await request(app).post('/api/auth/login').send({ email: normalUser.email, password: normalUser.password });
      token = r.body.token;
    });

    it('GET /api/auth/me should return user when authorized', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('GET /api/auth/me should 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/logout should return success', async () => {
      const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Refresh endpoint (not implemented)', () => {
    it('should return 404 for refresh if route not present', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});
      expect([404,400,401]).toContain(res.status);
    });
  });
});
