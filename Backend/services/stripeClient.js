import Stripe from 'stripe';

let stripeInstance = null;

/**
 * Returns a shared Stripe client, or null if STRIPE_SECRET_KEY is not set.
 * Tests can replace getStripe via jest mocks of this module.
 */
export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey);
  }

  return stripeInstance;
};

/** Reset cached client (useful in tests when env changes). */
export const resetStripeClient = () => {
  stripeInstance = null;
};
