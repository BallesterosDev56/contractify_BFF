import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v2',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },

  microservices: {
    contracts: process.env.MICROSERVICE_CONTRACTS_URL || 'http://localhost:3001',
    templates: process.env.MICROSERVICE_TEMPLATES_URL || 'http://localhost:3002',
    ai: process.env.MICROSERVICE_AI_URL || 'http://localhost:3003',
    documents: process.env.MICROSERVICE_DOCUMENTS_URL || 'http://localhost:3004',
    signatures: process.env.MICROSERVICE_SIGNATURES_URL || 'http://localhost:3005',
    notifications: process.env.MICROSERVICE_NOTIFICATIONS_URL || 'http://localhost:3006',
    audit: process.env.MICROSERVICE_AUDIT_URL || 'http://localhost:3007',
    users: process.env.MICROSERVICE_USERS_URL || 'http://localhost:3008',
  },

  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10),
  },

  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'https://contractify-frontend.vercel.app',
};
