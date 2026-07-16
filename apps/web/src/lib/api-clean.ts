type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { message?: string; code?: string };
  meta?: Record<string, unknown>;
};

const BASE_URL = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    try {
      const win = (globalThis as { window?: { localStorage?: { getItem: (key: string) => string | null } } }).window;
      return win?.localStorage?.getItem('fs_access_token') ?? null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { body, headers = {}, params } = options;

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url = `${url}?${searchParams.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new ApiError(data.error?.message ?? 'Request failed', response.status, data.error?.code ?? 'UNKNOWN_ERROR');
    }

    return data;
  }

  async get<T>(path: string, options?: { headers?: Record<string, string>; params?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(path: string, body?: unknown, options?: { headers?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { ...options, body });
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { body });
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, { body });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient(BASE_URL);
