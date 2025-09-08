// Environment Configuration
export const ENV = {
  DEV: __DEV__,
  PRODUCTION: !__DEV__,
  STAGING: false, // Can be set via build configuration
} as const;

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  // In React Native, environment variables are available at build time
  // For runtime configuration, you might want to use a config service
  return process.env[key] || fallback;
};

// API Configuration based on environment
export const API_CONFIG = {
  BASE_URL: getEnvVar(
    "EXPO_PUBLIC_API_URL",
    ENV.DEV ? "https://pipx.malspy.com" : "https://pipx.malspy.com"
  ),
  // BASE_URL: getEnvVar('EXPO_PUBLIC_API_URL', ENV.DEV ? 'http://10.0.2.2:8000' : 'https://pipx.malspy.com'),
  TIMEOUT: parseInt(getEnvVar("EXPO_PUBLIC_API_TIMEOUT", "30000"), 10),
  RETRY_ATTEMPTS: parseInt(getEnvVar("EXPO_PUBLIC_RETRY_ATTEMPTS", "3"), 10),
  RETRY_DELAY: parseInt(getEnvVar("EXPO_PUBLIC_RETRY_DELAY", "1000"), 10),
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// Stripe Configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: getEnvVar(
    "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    ENV.DEV
      ? "pk_test_51RLzzg2edcFTnSWhu3WizF9U0m3OwSr17ExD2hUMkrVqLJozhJm9HEiXKBXPV8BmhbUpQU8twEcy0rvCXkf7lGdf008owmFFYT"
      : "pk_live_your_live_key_here"
  ),
  MERCHANT_ID: getEnvVar(
    "EXPO_PUBLIC_STRIPE_MERCHANT_ID",
    "merchant.com.pipx.trading"
  ),
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_TYPE: "userType",
  USER_NAME: "user_name",
  USER_EMAIL: "user_email",
  REFRESH_TOKEN: "refreshToken",
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: "PipX Trading",
  VERSION: "1.0.0",
  BUILD_NUMBER: 1,
} as const;
