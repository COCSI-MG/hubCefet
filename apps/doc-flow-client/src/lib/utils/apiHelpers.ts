// Utility functions for API requests with error handling control

import { AxiosRequestConfig } from 'axios';

/**
 * Creates an axios config that skips automatic error toast notifications
 * @param config - Base axios request config
 * @returns Enhanced config with error toast disabled
 */
export function skipErrorToast(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return {
    ...config,
    skipErrorToast: true,
    headers: {
      ...config.headers,
      'X-Skip-Error-Toast': 'true'
    }
  };
}

/**
 * Creates an axios config that enables automatic error toast notifications (default behavior)
 * @param config - Base axios request config  
 * @returns Standard config with error toast enabled
 */
export function enableErrorToast(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return {
    ...config,
    skipErrorToast: false,
    headers: {
      ...config.headers,
      'X-Skip-Error-Toast': 'false'
    }
  };
}

/**
 * Creates an axios config for silent requests (no loading indicators, no error toasts)
 * Useful for background operations, polling, etc.
 * @param config - Base axios request config
 * @returns Config optimized for silent operations
 */
export function silentRequest(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return {
    ...config,
    skipErrorToast: true,
    silent: true,
    headers: {
      ...config.headers,
      'X-Skip-Error-Toast': 'true',
      'X-Silent-Request': 'true'
    }
  };
}

// Extend AxiosRequestConfig to include our custom properties
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
    silent?: boolean;
  }
}