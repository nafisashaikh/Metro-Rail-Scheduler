import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ScheduleStatus = 'on-time' | 'delayed' | 'cancelled';

export interface ScheduleRecord {
  id: string;
  station: string;
  line: string;
  destination: string;
  departureTime: string; // HH:MM
  platform: string;
  status: ScheduleStatus;
  trainNumber: string;
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
    platform: '2',
    status: 'on-time',
    trainNumber: 'MRS-AQ-101',
  },
  {
    id: 'sch-002',
    station: 'Dahisar East',
    line: 'Yellow Line',
    destination: 'Bandra Kurla Complex',
    departureTime: '08:12',
    platform: '1',
    status: 'delayed',
    trainNumber: 'MRS-YL-220',
  },
  {
    id: 'sch-003',
    station: 'CSMT Mumbai',
    line: 'Deccan Express',
    destination: 'Pune Junction',
    departureTime: '08:30',
    platform: '5',
    status: 'on-time',
    trainNumber: 'MRS-DEX-501',
  },
];

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
    const parsed = JSON.parse(raw) as ScheduleRecord[];
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(SCHEDULES_DB_PATH, JSON.stringify(DEFAULT_SCHEDULES, null, 2), 'utf-8');
      return [...DEFAULT_SCHEDULES];
    }

    return parsed;
  } catch {
    return [...DEFAULT_SCHEDULES];
  }
}

function saveSchedulesToDisk(schedules: ScheduleRecord[]): void {
  ensureDataDir();
  fs.writeFileSync(SCHEDULES_DB_PATH, JSON.stringify(schedules, null, 2), 'utf-8');
}

const SCHEDULES: ScheduleRecord[] = loadSchedulesFromDisk();

export function listSchedules(filter?: { station?: string; line?: string }): ScheduleRecord[] {
  const station = filter?.station?.trim().toLowerCase();
  const line = filter?.line?.trim().toLowerCase();
  return SCHEDULES.filter((s) => {
    if (station && s.station.trim().toLowerCase() !== station) return false;
    if (line && s.line.trim().toLowerCase() !== line) return false;
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
