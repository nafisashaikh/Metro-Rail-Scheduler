/// <reference types="vite/client" />
/**
 * API service layer for Metro Rail Scheduler.
 *
 * When VITE_API_BASE_URL is set, all data is fetched from the backend.
 * When it is not set (or the request fails), the frontend falls back to
 * the local mock-data generators that were already there.
 */

import type {
  MetroLine,
  Train,
  TrainHealth,
  TrainCapacity,
  StationMetrics,
  Alert,
  WeatherData,
  User,
  PassengerUser,
  SystemSection,
} from '../types/metro';

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

const hasBackend = !!API_BASE;

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'mrs_token';

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface StaffLoginResult {
  token: string;
  user: User;
}

export interface PassengerLoginResult {
  token: string;
  user: PassengerUser;
}

export async function loginStaff(
  employeeId: string,
  password: string,
): Promise<StaffLoginResult | null> {
  if (!hasBackend) return null;
  const result = await apiFetch<StaffLoginResult>('/api/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ employeeId, password }),
  });
  setToken(result.token);
  return result;
}

export async function loginPassenger(
  username: string,
  password: string,
): Promise<PassengerLoginResult | null> {
  if (!hasBackend) return null;
  const result = await apiFetch<PassengerLoginResult>('/api/auth/passenger/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(result.token);
  return result;
}

// ─── Lines ────────────────────────────────────────────────────────────────────

export async function fetchLines(section?: SystemSection): Promise<MetroLine[] | null> {
  if (!hasBackend) return null;
  const query = section ? `?section=${section}` : '';
  return apiFetch<MetroLine[]>(`/api/lines${query}`);
}

// ─── Trains ───────────────────────────────────────────────────────────────────

export async function fetchTrains(station: string, lineId: string): Promise<Train[] | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams({ station, lineId });
  return apiFetch<Train[]>(`/api/trains?${params}`);
}

export async function fetchTrainHealth(
  trainId: string,
  station: string,
  lineId: string,
): Promise<TrainHealth | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams({ station, lineId });
  return apiFetch<TrainHealth>(`/api/trains/${encodeURIComponent(trainId)}/health?${params}`);
}

export async function fetchTrainCapacity(
  trainId: string,
  station: string,
  lineId: string,
): Promise<TrainCapacity | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams({ station, lineId });
  return apiFetch<TrainCapacity>(`/api/trains/${encodeURIComponent(trainId)}/capacity?${params}`);
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function fetchAlerts(
  section?: SystemSection,
  resolved?: boolean,
): Promise<Alert[] | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  if (resolved !== undefined) params.set('resolved', String(resolved));
  const query = params.toString() ? `?${params}` : '';
  const raw = await apiFetch<(Omit<Alert, 'timestamp'> & { timestamp: string })[]>(
    `/api/alerts${query}`,
  );
  return raw.map((a) => ({ ...a, timestamp: new Date(a.timestamp) }));
}

export async function createAlert(
  alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>,
): Promise<Alert | null> {
  if (!hasBackend) return null;
  const raw = await apiFetch<Omit<Alert, 'timestamp'> & { timestamp: string }>('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });
  return { ...raw, timestamp: new Date(raw.timestamp) };
}

export async function resolveAlert(id: string): Promise<Alert | null> {
  if (!hasBackend) return null;
  const raw = await apiFetch<Omit<Alert, 'timestamp'> & { timestamp: string }>(
    `/api/alerts/${encodeURIComponent(id)}/resolve`,
    { method: 'PATCH' },
  );
  return { ...raw, timestamp: new Date(raw.timestamp) };
}

export async function deleteAlert(id: string): Promise<boolean> {
  if (!hasBackend) return false;
  await apiFetch<void>(`/api/alerts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return true;
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export async function fetchWeather(
  section?: SystemSection,
  location?: string,
): Promise<WeatherData | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams();
  if (location) params.set('location', location);
  else if (section) params.set('section', section);
  const query = params.toString() ? `?${params}` : '';
  return apiFetch<WeatherData>(`/api/weather${query}`);
}

// ─── Station Metrics ──────────────────────────────────────────────────────────

export async function fetchStationMetrics(
  stationName: string,
  section?: SystemSection,
): Promise<StationMetrics | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams();
  if (section) params.set('section', section);
  const query = params.toString() ? `?${params}` : '';
  return apiFetch<StationMetrics>(
    `/api/stations/${encodeURIComponent(stationName)}/metrics${query}`,
  );
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export interface ScheduleResponse {
  stationName: string;
  lineName: string;
  departures: Array<{
    trainNumber: string;
    departureTime: string;
    destination: string;
    platform: string;
    status: 'on-time' | 'delayed' | 'cancelled';
  }>;
}

export async function fetchSchedule(
  station: string,
  lineId: string,
): Promise<ScheduleResponse | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams({ station, lineId });
  return apiFetch<ScheduleResponse>(`/api/schedules?${params}`);
}

// ─── Journey Planner ──────────────────────────────────────────────────────────

export interface JourneyPlan {
  from: string;
  to: string;
  section: SystemSection;
  legs: Array<{
    from: string;
    to: string;
    line: string;
    lineId: string;
    lineColor: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    stops: number;
  }>;
  totalDuration: number;
  transfers: number;
}

export async function planJourney(
  from: string,
  to: string,
  section: SystemSection,
): Promise<JourneyPlan | null> {
  if (!hasBackend) return null;
  const params = new URLSearchParams({ from, to, section });
  return apiFetch<JourneyPlan>(`/api/journey/plan?${params}`);
}

export { hasBackend };
