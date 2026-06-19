import express from 'express';
import { recordVisit, getVisitStats, getUserStats, getContentStats } from '../controllers/statsController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import * as statsSchemas from '../schemas/stats.schema.js';

const router = express.Router();

router.post('/visit', recordVisit);
router.get('/visits', verifyToken, adminOnly, getVisitStats);
router.get('/user/:id', verifyToken, adminOnly, validate(statsSchemas.userStats, { target: 'params' }), getUserStats);
router.get('/content/:id', verifyToken, adminOnly, validate(statsSchemas.contentStats, { target: 'params' }), getContentStats);

export default router;
