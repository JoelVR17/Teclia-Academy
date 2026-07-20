import express from 'express';
import { createCheckout } from '../controllers/paymentsController.js';
import { verifyToken } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import * as paymentSchemas from '../schemas/payment.schema.js';

const router = express.Router();

router.post(
  '/checkout',
  verifyToken,
  validate(paymentSchemas.checkout),
  createCheckout
);

export default router;
