import { useAuthStore } from '../store/authStore';

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const session = useAuthStore.getState().session;
  const headers = new Headers(options.headers || {});

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
