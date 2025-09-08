// import { STRIPE_PUBLISHABLE_KEY, MERCHANT_IDENTIFIER } from '@env';
import { STRIPE_CONFIG } from './environment';

const STRIPE_PUBLISHABLE_KEY="", MERCHANT_IDENTIFIER = ""

// Use environment variables if available, otherwise use config values
export const ENV = {
  STRIPE: {
    PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY || STRIPE_CONFIG.PUBLISHABLE_KEY,
    MERCHANT_IDENTIFIER: MERCHANT_IDENTIFIER || STRIPE_CONFIG.MERCHANT_ID,
  }
};

export default ENV;
