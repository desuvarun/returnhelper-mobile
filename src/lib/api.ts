import { storage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://returnhelper.vercel.app/api/mobile';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = await storage.getItem('auth_token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

export async function setAuthToken(token: string) {
  await storage.setItem('auth_token', token);
}

export async function clearAuthToken() {
  await storage.removeItem('auth_token');
}

export async function getAuthToken() {
  return storage.getItem('auth_token');
}
