import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env.js';
import { MicroserviceError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { UserContext } from '../types/index.js';

export class MicroserviceClient {
  private client: AxiosInstance;
  private serviceName: string;

  constructor(baseURL: string, serviceName: string) {
    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL,
      timeout: config.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add user context
    this.client.interceptors.request.use((requestConfig) => {
      // User context will be added by the route handler
      return requestConfig;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          logger.error(
            `Microservice ${serviceName} error:`,
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          logger.error(`Microservice ${serviceName} timeout:`, error.message);
        } else {
          logger.error(`Microservice ${serviceName} error:`, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private addUserContext(headers: Record<string, string>, user?: UserContext): void {
    if (user) {
      headers['X-User-Id'] = user.userId;
      headers['X-User-Email'] = user.email;
      if (user.role) {
        headers['X-User-Role'] = user.role;
      }
    }
  }

  async get<T>(
    path: string,
    params?: Record<string, unknown>,
    user?: UserContext
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.get<T>(path, {
        params,
        headers,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(
    path: string,
    data?: unknown,
    user?: UserContext
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.post<T>(path, data, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async patch<T>(
    path: string,
    data?: unknown,
    user?: UserContext
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.patch<T>(path, data, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T>(
    path: string,
    data?: unknown,
    user?: UserContext
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.put<T>(path, data, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T>(path: string, user?: UserContext): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.delete<T>(path, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getStream(
    path: string,
    params?: Record<string, unknown>,
    user?: UserContext
  ): Promise<Buffer> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.get(path, {
        params,
        headers,
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async postStream(
    path: string,
    data?: unknown,
    user?: UserContext
  ): Promise<Buffer> {
    try {
      const headers: Record<string, string> = {};
      this.addUserContext(headers, user);

      const response = await this.client.post(path, data, {
        headers,
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new MicroserviceError(
          `Microservice ${this.serviceName} returned error: ${axiosError.response.status}`,
          this.serviceName,
          axiosError.response.status
        );
      } else if (axiosError.request) {
        throw new MicroserviceError(
          `Microservice ${this.serviceName} is unreachable`,
          this.serviceName,
          503
        );
      }
    }
  }
}

export const contractsClient = new MicroserviceClient(
  config.microservices.contracts,
  'contracts'
);

export const templatesClient = new MicroserviceClient(
  config.microservices.templates,
  'templates'
);

export const aiClient = new MicroserviceClient(
  config.microservices.ai,
  'ai'
);

export const documentsClient = new MicroserviceClient(
  config.microservices.documents,
  'documents'
);

export const signaturesClient = new MicroserviceClient(
  config.microservices.signatures,
  'signatures'
);

export const notificationsClient = new MicroserviceClient(
  config.microservices.notifications,
  'notifications'
);

export const auditClient = new MicroserviceClient(
  config.microservices.audit,
  'audit'
);

export const usersClient = new MicroserviceClient(
  config.microservices.users,
  'users'
);
