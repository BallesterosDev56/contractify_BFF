import { FastifyRequest, FastifyReply } from 'fastify';
import * as admin from 'firebase-admin';
import { UnauthorizedError } from '../utils/errors.js';
import type { UserContext } from '../types/index.js';
import { config } from '../config/env.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserContext;
  }
}

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): void {
  if (firebaseApp) {
    return;
  }

  const { firebase } = config;

  if (!firebase.projectId || !firebase.privateKey || !firebase.clientEmail) {
    throw new Error('Firebase configuration is missing. Please check your environment variables.');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebase.projectId,
      privateKey: firebase.privateKey,
      clientEmail: firebase.clientEmail,
    }),
  });
}

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    if (!firebaseApp) {
      initializeFirebase();
    }

    const decodedToken = await admin.auth(firebaseApp).verifyIdToken(token);

    request.user = {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role as string | undefined,
      claims: decodedToken,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return;
    }

    const token = authHeader.substring(7);

    if (!firebaseApp) {
      initializeFirebase();
    }

    const decodedToken = await admin.auth(firebaseApp).verifyIdToken(token);

    request.user = {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role as string | undefined,
      claims: decodedToken,
    };
  } catch {
    // Silently fail for optional auth
  }
}
