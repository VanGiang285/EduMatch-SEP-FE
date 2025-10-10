
export const APP_CONFIG = {
  NAME: 'EduMatch',
  DESCRIPTION: 'Nền tảng kết nối gia sư và học viên hàng đầu Việt Nam',
  VERSION: '1.0.0',
  AUTHOR: 'EduMatch Team',
  
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  FEATURES: {
    ENABLE_REGISTRATION: true,
    ENABLE_GOOGLE_AUTH: true,
    ENABLE_EMAIL_VERIFICATION: true,
    ENABLE_PASSWORD_RESET: true,
    ENABLE_TUTOR_APPLICATIONS: true,
    ENABLE_REVIEWS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: process.env.NODE_ENV === 'production',
  },
  
  SECURITY: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_TOKEN_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 1000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    IMAGE_OPTIMIZATION: true,
    LAZY_LOADING: true,
  },
  
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    MODAL_ANIMATION_DURATION: 200,
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 120,
  },
  
  EXTERNAL: {
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_ID,
    GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
} as const;

export const ENV_VARS = {
  REQUIRED: [
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_API_BASE_URL',
  ],
  OPTIONAL: [
    'NEXT_PUBLIC_GA_ID',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
  ],
} as const;

export const DEFAULT_VALUES = {
  BASE_URL: 'http://localhost:3000',
  API_BASE_URL: 'http://localhost:3000/api',
  GA_ID: '',
  GOOGLE_MAPS_API_KEY: '',
  RECAPTCHA_SITE_KEY: '',
} as const;
