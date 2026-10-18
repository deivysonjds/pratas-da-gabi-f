import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || '/backend/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

let refreshInFlight: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const url = request?.url || '';
    const authEndpoint = /\/auth\/(login|refresh|logout)/.test(url);

    if (status !== 401 || !request || request._retry || authEndpoint || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      if (!refreshInFlight) {
        refreshInFlight = api.post('/auth/refresh').then(() => undefined).finally(() => {
          refreshInFlight = null;
        });
      }
      await refreshInFlight;
      return api(request);
    } catch (refreshError) {
      try { await api.post('/auth/logout'); } catch { /* sessão já pode ter expirado */ }
      sessionStorage.removeItem('authUser');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
      return Promise.reject(refreshError);
    }
  },
);

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  if (response.data?.user && typeof window !== 'undefined') {
    sessionStorage.setItem('authUser', JSON.stringify(response.data.user));
  }
  return response.data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    if (typeof window !== 'undefined') sessionStorage.removeItem('authUser');
  }
}
