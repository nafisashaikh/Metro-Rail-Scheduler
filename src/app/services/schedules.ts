import { apiUrl } from '../config/api';
import type { Train } from '../types/metro';

const AUTH_TOKEN_KEY = 'mrs_auth_token';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTrainsForStation(input: {
  station: string;
  line: string;
}): Promise<Train[]> {
  const url = apiUrl(
    `/schedules?station=${encodeURIComponent(input.station)}&line=${encodeURIComponent(input.line)}`
  );

  const response = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = (await response.json()) as { trains?: Train[]; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? `Failed to fetch schedules (${response.status})`);
  }

  return Array.isArray(data.trains) ? data.trains : [];
}

export type ScheduleStatus = Train['status'];

export type ScheduleDayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ScheduleRecord {
  id: string;
  station: string;
  line: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string;
  platform: string;
  status: ScheduleStatus;
  trainNumber: string;
  headwayMinutes?: number;
  daysOfWeek: ScheduleDayOfWeek[];
  effectiveFrom?: string;
  effectiveTo?: string;
  published: boolean;
}

export async function listScheduleRecords(input?: {
  station?: string;
  line?: string;
  includeUnpublished?: boolean;
}): Promise<ScheduleRecord[]> {
  const params = new URLSearchParams();
  if (input?.station) params.set('station', input.station);
  if (input?.line) params.set('line', input.line);
  if (input?.includeUnpublished) params.set('includeUnpublished', 'true');

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(apiUrl(`/schedules${suffix}`), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = (await response.json()) as { schedules?: ScheduleRecord[]; error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Failed to fetch schedules (${response.status})`);
  }

  return Array.isArray(data.schedules) ? data.schedules : [];
}

export async function createScheduleRecord(input: Omit<ScheduleRecord, 'id'>): Promise<ScheduleRecord> {
  const response = await fetch(apiUrl('/schedules'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as { schedule?: ScheduleRecord; error?: string };
  if (!response.ok || !data.schedule) {
    throw new Error(data.error ?? `Failed to create schedule (${response.status})`);
  }

  return data.schedule;
}

export async function updateScheduleRecord(
  id: string,
  patch: Partial<Omit<ScheduleRecord, 'id'>>
): Promise<ScheduleRecord> {
  const response = await fetch(apiUrl(`/schedules/${encodeURIComponent(id)}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(patch),
  });

  const data = (await response.json()) as { schedule?: ScheduleRecord; error?: string };
  if (!response.ok || !data.schedule) {
    throw new Error(data.error ?? `Failed to update schedule (${response.status})`);
  }

  return data.schedule;
}

export async function deleteScheduleRecord(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/schedules/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (response.status === 204) return;

  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Failed to delete schedule (${response.status})`);
  }
}

export async function createSchedule(input: {
  station: string;
  line: string;
  destination: string;
  departureTime: string;
  platform: string;
  status: ScheduleStatus;
  trainNumber: string;
}): Promise<Train> {
  const response = await fetch(apiUrl('/schedules'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as { train?: Train; error?: string };

  if (!response.ok || !data.train) {
    throw new Error(data.error ?? `Failed to create schedule (${response.status})`);
  }

  return data.train;
}
