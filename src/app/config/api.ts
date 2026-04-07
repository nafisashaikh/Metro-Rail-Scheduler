// Backend default is PORT=4001 (see backend/src/config/env.ts and backend/.env.example)
const defaultApiBase = `${window.location.protocol}//${window.location.hostname}:4001`;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? defaultApiBase;

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
