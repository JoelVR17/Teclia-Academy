import request from 'supertest';
import app from '../app.js';

(async () => {
  try {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Debug User', email: 'debug@teclia.dev', password: 'DebugPass123!' });
    console.log('status', res.status);
    console.log('body', res.body);
  } catch (error) {
    console.error('debug error', error);
  }
})();
