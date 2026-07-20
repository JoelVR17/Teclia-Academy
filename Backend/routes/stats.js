import express from 'express';
import { recordVisit, getVisitStats } from '../controllers/statsController.js';
import { verifyToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/visit', recordVisit);
router.get('/visits', verifyToken, adminOnly, getVisitStats);

export default router;
