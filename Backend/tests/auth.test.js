import request from 'supertest';
import app from '../app.js';
import { setupTestDb } from './helpers/db.setup.js';
import { normalUser, studentUser } from './fixtures/users.js';
import jwt from 'jsonwebtoken';

setupTestDb();

describe('Authentication System', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user with valid data and return 201', async () => {
      const res = await request(app).post('/api/auth/signup').send(normalUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(normalUser.email.toLowerCase());
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body.user.role).toBe('student');
    });

    it('should not allow duplicate email registration', async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
      const res = await request(app).post('/api/auth/signup').send(normalUser);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/email.*registered|duplicate/i);
    });

    it('should reject signup with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' }); // Missing password and name
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject signup with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'weak@example.com',
          password: 'weak', // Too short and no numbers
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject signup with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'notanemail',
          password: 'ValidPass123',
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
    });

    it('should login with valid credentials and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: normalUser.password,
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(normalUser.email.toLowerCase());
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: 'WrongPassword123!',
        });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('should fail login for nonexistent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('should fail login with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: normalUser.password });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail login with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: normalUser.email });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should normalize email to lowercase on login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email.toUpperCase(),
          password: normalUser.password,
        });
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(normalUser.email.toLowerCase());
    });
  });

  describe('Token Verification and Protected Routes', () => {
    let token;
    let refreshToken;
    
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: normalUser.password,
        });
      token = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should allow access to protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(normalUser.email.toLowerCase());
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject access without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/authentication required|no token/i);
    });

    it('should reject access with invalid token format', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');
      expect(res.status).toBe(401);
    });

    it('should reject access with malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer malformed.token.here');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject access with empty Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
    });

    it('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('name');
      expect(res.body.user).toHaveProperty('role');
    });
  });

  describe('POST /api/auth/refresh - Token Renewal', () => {
    let refreshToken;
    let expiredToken;

    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: normalUser.password,
        });
      refreshToken = res.body.refreshToken;

      // Create an expired token for testing
      expiredToken = jwt.sign(
        { id: 1, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' } // Already expired
      );
    });

    it('should refresh token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.token).not.toBe(refreshToken); // New token should be different
    });

    it('should fail refresh with missing refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail refresh with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/invalid|expired/i);
    });

    it('should fail refresh with expired refresh token', async () => {
      // Create a token that has expired
      const oldRefreshToken = jwt.sign(
        { id: 1, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefreshToken });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail refresh for nonexistent user', async () => {
      const fakeRefreshToken = jwt.sign(
        { id: 99999, role: 'student' }, // Non-existent user
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: fakeRefreshToken });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return new tokens with refreshed token', async () => {
      const firstRefresh = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(firstRefresh.status).toBe(200);
      const newToken = firstRefresh.body.token;
      const newRefreshToken = firstRefresh.body.refreshToken;

      // Verify the new token can be used
      const verifyRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newToken}`);
      expect(verifyRes.status).toBe(200);
    });
  });

  describe('POST /api/auth/logout', () => {
    let token;

    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(normalUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: normalUser.password,
        });
      token = res.body.token;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/logout.*successful/i);
    });

    it('should allow logout without token (stateless)', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
    });
  });

  describe('Error Handling Consistency', () => {
    it('should return consistent error for authentication failures', async () => {
      // Test 1: No token
      const res1 = await request(app).get('/api/auth/me');
      expect(res1.status).toBe(401);
      expect(res1.body).toHaveProperty('error');

      // Test 2: Invalid token
      const res2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid');
      expect(res2.status).toBe(401);
      expect(res2.body).toHaveProperty('error');

      // Test 3: Expired token
      const expiredToken = jwt.sign(
        { id: 1, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      const res3 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res3.status).toBe(401);
      expect(res3.body).toHaveProperty('error');
    });

    it('should return consistent error for wrong credentials', async () => {
      await request(app).post('/api/auth/signup').send(normalUser);

      // Wrong password
      const res1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: 'WrongPassword123!',
        });
      expect(res1.status).toBe(401);
      expect(res1.body.error).toMatch(/invalid credentials/i);

      // Non-existent user
      const res2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        });
      expect(res2.status).toBe(401);
      expect(res2.body.error).toMatch(/invalid credentials/i);
    });
  });

  describe('Admin Authorization', () => {
    it('should reject non-admin users from admin routes', async () => {
      // Register and login as regular student
      await request(app).post('/api/auth/signup').send(normalUser);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: normalUser.email,
          password: normalUser.password,
        });
      const token = loginRes.body.token;

      // Try to access admin route
      const res = await request(app)
        .get('/api/auth/students')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/admin/i);
    });
  });
});
