/**
 * Type definitions for the BFF
 */

export interface UserContext {
  userId: string;
  email: string;
  role?: string;
  claims?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface MicroserviceResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}
