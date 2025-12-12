/**
 * API Client
 * ===========
 *
 * Centralized API client for making HTTP requests.
 * Handles authentication, error handling, and request/response formatting.
 *
 * HANDOVER NOTES:
 * - All API calls should go through this client
 * - Automatically attaches auth tokens from localStorage
 * - Handles token refresh and retry logic
 * - Provides consistent error handling across the app
 */

import { ApiResponse, ApiError } from '@/lib/db/schema';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// TYPES
// ============================================================================

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  skipAuth?: boolean;
  retries?: number;
}

export interface ApiClientError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get stored auth token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Get company slug from current context
 */
function getCompanySlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('company_slug');
}

/**
 * Create a timeout promise
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format error response into ApiClientError
 */
function createApiError(
  message: string,
  code: string,
  status: number,
  details?: Record<string, unknown>
): ApiClientError {
  const error = new Error(message) as ApiClientError;
  error.code = code;
  error.status = status;
  error.details = details;
  return error;
}

// ============================================================================
// MAIN API CLIENT
// ============================================================================

/**
 * Core request function
 */
async function request<T>(
  endpoint: string,
  config: RequestConfig
): Promise<ApiResponse<T>> {
  const {
    method,
    headers = {},
    body,
    timeout = REQUEST_TIMEOUT,
    skipAuth = false,
    retries = 2,
  } = config;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add company context
  const companySlug = getCompanySlug();
  if (companySlug) {
    requestHeaders['X-Company-Slug'] = companySlug;
  }

  // Build request options
  const options: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  // Build full URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // Execute request with timeout and retries
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await Promise.race([
        fetch(url, options),
        createTimeout(timeout),
      ]);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));

        // Handle specific error codes
        if (response.status === 401) {
          // Token expired - could trigger refresh here
          localStorage.removeItem('auth_token');
          throw createApiError(
            'Authentication required',
            'AUTH_REQUIRED',
            401
          );
        }

        if (response.status === 403) {
          throw createApiError(
            'Access denied',
            'ACCESS_DENIED',
            403
          );
        }

        if (response.status === 404) {
          throw createApiError(
            errorBody.message || 'Resource not found',
            'NOT_FOUND',
            404
          );
        }

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('Retry-After');
          const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          await sleep(waitMs);
          continue;
        }

        throw createApiError(
          errorBody.message || 'An error occurred',
          errorBody.code || 'API_ERROR',
          response.status,
          errorBody.details
        );
      }

      // Parse successful response
      const data = await response.json();
      return data as ApiResponse<T>;

    } catch (error) {
      lastError = error as Error;

      // Don't retry auth errors or client errors (4xx except 429)
      if (error instanceof Error && 'status' in error) {
        const status = (error as ApiClientError).status;
        if (status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      // Wait before retrying
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1)); // Exponential backoff
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('Request failed');
}

// ============================================================================
// EXPORTED API METHODS
// ============================================================================

export const apiClient = {
  /**
   * GET request
   */
  get<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...config, method: 'GET' });
  },

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: unknown, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...config, method: 'POST', body });
  },

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: unknown, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...config, method: 'PUT', body });
  },

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: unknown, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...config, method: 'PATCH', body });
  },

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...config, method: 'DELETE' });
  },
};

// ============================================================================
// SPECIFIC API ENDPOINTS
// ============================================================================

/**
 * Auth API endpoints
 */
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: unknown }>('/auth/login', { email, password }, { skipAuth: true }),

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: () =>
    apiClient.post<{ token: string }>('/auth/refresh'),

  me: () =>
    apiClient.get<unknown>('/auth/me'),

  workosLogin: (code: string) =>
    apiClient.post<{ token: string; user: unknown }>('/auth/workos', { code }, { skipAuth: true }),
};

/**
 * Company API endpoints
 */
export const companyApi = {
  getBySlug: (slug: string) =>
    apiClient.get<unknown>(`/companies/${slug}`),

  update: (id: string, data: unknown) =>
    apiClient.patch<unknown>(`/companies/${id}`, data),

  getFeatures: (id: string) =>
    apiClient.get<unknown>(`/companies/${id}/features`),

  updateFeatures: (id: string, features: unknown) =>
    apiClient.patch<unknown>(`/companies/${id}/features`, features),

  getBranding: (slug: string) =>
    apiClient.get<unknown>(`/companies/${slug}/branding`),
};

/**
 * Course API endpoints
 */
export const courseApi = {
  list: (params?: { category?: string; level?: string; page?: number }) =>
    apiClient.get<unknown[]>('/courses', { headers: params ? { 'X-Query-Params': JSON.stringify(params) } : {} }),

  get: (id: string) =>
    apiClient.get<unknown>(`/courses/${id}`),

  getModules: (courseId: string) =>
    apiClient.get<unknown[]>(`/courses/${courseId}/modules`),

  getLessons: (moduleId: string) =>
    apiClient.get<unknown[]>(`/modules/${moduleId}/lessons`),
};

/**
 * Progress API endpoints
 */
export const progressApi = {
  getEnrollments: () =>
    apiClient.get<unknown[]>('/enrollments'),

  enroll: (courseId: string) =>
    apiClient.post<unknown>('/enrollments', { courseId }),

  updateLessonProgress: (lessonId: string, data: unknown) =>
    apiClient.patch<unknown>(`/progress/lessons/${lessonId}`, data),

  getQuizAttempts: (quizId: string) =>
    apiClient.get<unknown[]>(`/quizzes/${quizId}/attempts`),

  submitQuiz: (quizId: string, answers: unknown) =>
    apiClient.post<unknown>(`/quizzes/${quizId}/submit`, { answers }),
};

/**
 * User API endpoints
 */
export const userApi = {
  getProfile: () =>
    apiClient.get<unknown>('/users/me'),

  updateProfile: (data: unknown) =>
    apiClient.patch<unknown>('/users/me', data),

  updatePreferences: (preferences: unknown) =>
    apiClient.patch<unknown>('/users/me/preferences', preferences),

  getGamification: () =>
    apiClient.get<unknown>('/users/me/gamification'),

  getAchievements: () =>
    apiClient.get<unknown[]>('/users/me/achievements'),
};

export default apiClient;
