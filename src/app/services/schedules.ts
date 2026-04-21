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
