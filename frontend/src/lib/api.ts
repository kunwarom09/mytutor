/**
 * MyTutor API Client
 * Wraps Fetch with base URL, authentication headers, and standardized error handling.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: any;
}

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('mytutor_token') : null;

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type only if body is NOT FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      err?.message || 'Network error: Unable to reach MyTutor backend server at ' + API_BASE_URL,
      0
    );
  }

  let data: any = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const message = data.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data.errors);
  }

  return data as ApiResponse<T>;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
