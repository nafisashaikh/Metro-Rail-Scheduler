import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ScheduleStatus = 'on-time' | 'delayed' | 'cancelled';

export type ScheduleDayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ScheduleRecord {
  id: string;
  station: string;
  line: string;
  destination: string;
  departureTime: string; // HH:MM
  arrivalTime?: string; // HH:MM
  platform: string;
  status: ScheduleStatus;
  trainNumber: string;

  headwayMinutes?: number;
  daysOfWeek: ScheduleDayOfWeek[];
  effectiveFrom?: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  published: boolean;
}

export interface ApiTrain {
  id: string;
  line: string;
  destination: string;
  departureTime: string;
  platform: string;
  status: ScheduleStatus;
  trainNumber: string;
  health: {
    overall: number;
    engine: number;
    brakes: number;
    doors: number;
    ac: number;
    lastMaintenance: string;
    nextMaintenance: string;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  };
  capacity: {
    total: number;
    current: number;
    predicted: number;
    percentage: number;
  };
  crowdLevels?: {
    front: 'low' | 'medium' | 'high';
    middle: 'low' | 'medium' | 'high';
    rear: 'low' | 'medium' | 'high';
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SCHEDULES_DB_PATH = path.join(DATA_DIR, 'schedules.json');

const DEFAULT_SCHEDULES: ScheduleRecord[] = [
  {
    id: 'sch-001',
    station: 'Ghatkopar',
    line: 'Aqua Line',
    destination: 'Versova',
    departureTime: '08:05',
    arrivalTime: '08:42',
    platform: '2',
    status: 'on-time',
    trainNumber: 'MRS-AQ-101',
    headwayMinutes: 10,
    daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    effectiveFrom: undefined,
    effectiveTo: undefined,
    published: true,
  },
  {
    id: 'sch-002',
    station: 'Dahisar East',
    line: 'Yellow Line',
    destination: 'Bandra Kurla Complex',
    departureTime: '08:12',
    arrivalTime: '08:55',
    platform: '1',
    status: 'delayed',
    trainNumber: 'MRS-YL-220',
    headwayMinutes: 12,
    daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
    effectiveFrom: undefined,
    effectiveTo: undefined,
    published: true,
  },
  {
    id: 'sch-003',
    station: 'CSMT Mumbai',
    line: 'Deccan Express',
    destination: 'Pune Junction',
    departureTime: '08:30',
    arrivalTime: '11:35',
    platform: '5',
    status: 'on-time',
    trainNumber: 'MRS-DEX-501',
    headwayMinutes: undefined,
    daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    effectiveFrom: undefined,
    effectiveTo: undefined,
    published: true,
  },
];

const ALL_DAYS: ScheduleDayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function normalizeScheduleRecord(input: any): ScheduleRecord | null {
  if (!input || typeof input !== 'object') return null;
  const id = typeof input.id === 'string' ? input.id : null;
  const station = typeof input.station === 'string' ? input.station : null;
  const line = typeof input.line === 'string' ? input.line : null;
  const destination = typeof input.destination === 'string' ? input.destination : null;
  const departureTime = typeof input.departureTime === 'string' ? input.departureTime : null;
  const platform = typeof input.platform === 'string' ? input.platform : null;
  const status = input.status === 'on-time' || input.status === 'delayed' || input.status === 'cancelled' ? input.status : 'on-time';
  const trainNumber = typeof input.trainNumber === 'string' ? input.trainNumber : null;

  if (!id || !station || !line || !destination || !departureTime || !platform || !trainNumber) return null;

  const arrivalTime = typeof input.arrivalTime === 'string' ? input.arrivalTime : undefined;
  const headwayMinutes = typeof input.headwayMinutes === 'number' ? input.headwayMinutes : undefined;
  const daysOfWeek = Array.isArray(input.daysOfWeek) && input.daysOfWeek.length > 0 ? (input.daysOfWeek as ScheduleDayOfWeek[]) : ALL_DAYS;
  const effectiveFrom = typeof input.effectiveFrom === 'string' ? input.effectiveFrom : undefined;
  const effectiveTo = typeof input.effectiveTo === 'string' ? input.effectiveTo : undefined;
  const published = typeof input.published === 'boolean' ? input.published : true;

  return {
    id,
    station,
    line,
    destination,
    departureTime,
    arrivalTime,
    platform,
    status,
    trainNumber,
    headwayMinutes,
    daysOfWeek,
    effectiveFrom,
    effectiveTo,
    published,
  };
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSchedulesFromDisk(): ScheduleRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(SCHEDULES_DB_PATH)) {
      fs.writeFileSync(SCHEDULES_DB_PATH, JSON.stringify(DEFAULT_SCHEDULES, null, 2), 'utf-8');
      return [...DEFAULT_SCHEDULES];
    }

    const raw = fs.readFileSync(SCHEDULES_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as any;
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(SCHEDULES_DB_PATH, JSON.stringify(DEFAULT_SCHEDULES, null, 2), 'utf-8');
      return [...DEFAULT_SCHEDULES];
    }

    const normalized = parsed
      .map((item) => normalizeScheduleRecord(item))
      .filter((item): item is ScheduleRecord => Boolean(item));

    if (normalized.length === 0) {
      fs.writeFileSync(SCHEDULES_DB_PATH, JSON.stringify(DEFAULT_SCHEDULES, null, 2), 'utf-8');
      return [...DEFAULT_SCHEDULES];
    }

    // Persist normalization so newly added fields exist on disk.
    saveSchedulesToDisk(normalized);
    return normalized;
  } catch {
    return [...DEFAULT_SCHEDULES];
  }
}

function saveSchedulesToDisk(schedules: ScheduleRecord[]): void {
  ensureDataDir();
  fs.writeFileSync(SCHEDULES_DB_PATH, JSON.stringify(schedules, null, 2), 'utf-8');
}

const SCHEDULES: ScheduleRecord[] = loadSchedulesFromDisk();

export function listSchedules(filter?: { station?: string; line?: string; includeUnpublished?: boolean }): ScheduleRecord[] {
  const station = filter?.station?.trim().toLowerCase();
  const line = filter?.line?.trim().toLowerCase();
  const includeUnpublished = Boolean(filter?.includeUnpublished);
  return SCHEDULES.filter((s) => {
    if (station && s.station.trim().toLowerCase() !== station) return false;
    if (line && s.line.trim().toLowerCase() !== line) return false;
    if (!includeUnpublished && !s.published) return false;
    return true;
  });
}

export function createSchedule(input: Omit<ScheduleRecord, 'id'>): ScheduleRecord {
  const id = `sch-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const record: ScheduleRecord = { ...input, id };
  SCHEDULES.unshift(record);
  saveSchedulesToDisk(SCHEDULES);
  return record;
}

export function updateSchedule(
  id: string,
  patch: Partial<Omit<ScheduleRecord, 'id'>>
): ScheduleRecord | undefined {
  const idx = SCHEDULES.findIndex((s) => s.id === id);
  if (idx < 0) return undefined;
  SCHEDULES[idx] = { ...SCHEDULES[idx], ...patch };
  saveSchedulesToDisk(SCHEDULES);
  return SCHEDULES[idx];
}

export function deleteSchedule(id: string): boolean {
  const idx = SCHEDULES.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  SCHEDULES.splice(idx, 1);
  saveSchedulesToDisk(SCHEDULES);
  return true;
}

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function seededInt(seed: number, min: number, max: number): number {
  const x = (Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ (seed >>> 16)) >>> 0;
  const range = max - min + 1;
  return min + (x % range);
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function healthStatusFromOverall(overall: number): ApiTrain['health']['status'] {
  if (overall >= 90) return 'excellent';
  if (overall >= 75) return 'good';
  if (overall >= 60) return 'fair';
  return 'poor';
}

function crowdLevelFromPercent(p: number): 'low' | 'medium' | 'high' {
  if (p >= 80) return 'high';
  if (p >= 50) return 'medium';
  return 'low';
}

export function scheduleToTrain(schedule: ScheduleRecord): ApiTrain {
  const baseSeed = fnv1a32(`${schedule.id}|${schedule.trainNumber}|${schedule.departureTime}`);
  const overall = seededInt(baseSeed, 62, 98);
  const engine = seededInt(baseSeed ^ 0x01, 60, 99);
  const brakes = seededInt(baseSeed ^ 0x02, 60, 99);
  const doors = seededInt(baseSeed ^ 0x03, 60, 99);
  const ac = seededInt(baseSeed ^ 0x04, 60, 99);

  const total = 1200;
  const percentage = seededInt(baseSeed ^ 0x10, 18, 97);
  const current = Math.round((percentage / 100) * total);
  const predicted = Math.min(total, current + seededInt(baseSeed ^ 0x11, 0, 120));

  const now = new Date();
  const lastDays = seededInt(baseSeed ^ 0x20, 4, 45);
  const nextDays = seededInt(baseSeed ^ 0x21, 7, 60);
  const lastMaintenance = new Date(now.getTime() - lastDays * 24 * 60 * 60 * 1000);
  const nextMaintenance = new Date(now.getTime() + nextDays * 24 * 60 * 60 * 1000);

  const crowdLevels = {
    front: crowdLevelFromPercent(seededInt(baseSeed ^ 0x30, 10, 95)),
    middle: crowdLevelFromPercent(seededInt(baseSeed ^ 0x31, 10, 95)),
    rear: crowdLevelFromPercent(seededInt(baseSeed ^ 0x32, 10, 95)),
  };

  return {
    id: schedule.id,
    line: schedule.line,
    destination: schedule.destination,
    departureTime: schedule.departureTime,
    platform: schedule.platform,
    status: schedule.status,
    trainNumber: schedule.trainNumber,
    health: {
      overall,
      engine,
      brakes,
      doors,
      ac,
      lastMaintenance: toIsoDate(lastMaintenance),
      nextMaintenance: toIsoDate(nextMaintenance),
      status: healthStatusFromOverall(overall),
    },
    capacity: {
      total,
      current,
      predicted,
      percentage,
    },
    crowdLevels,
  };
}
