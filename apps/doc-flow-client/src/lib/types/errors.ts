// Error types and utilities for consistent error handling across the app

export interface ApiError {
  status: number;
  success: false;
  data: null;
  error: string | string[];
  message?: string | string[];
}

export interface ApiSuccess<T> {
  status: number;
  success: true;
  data: T;
  error: null;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning', 
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Common error types
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Error context for better debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  stackTrace?: string;
}

// Processed error for UI consumption
export interface ProcessedError {
  type: ErrorType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  details?: string[];
  context?: ErrorContext;
  canRetry?: boolean;
  retryAction?: () => void;
}