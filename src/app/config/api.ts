const defaultApiBase = `${window.location.protocol}//${window.location.hostname}:4001`;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? defaultApiBase;

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
