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
  // Line 1: Versova - Ghatkopar
  { id: 'sch-001', station: 'Ghatkopar', line: 'Line 1 – Versova–Ghatkopar', destination: 'Versova', departureTime: '08:05', arrivalTime: '08:42', platform: '2', status: 'on-time', trainNumber: 'MM-101', headwayMinutes: 10, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-002', station: 'Ghatkopar', line: 'Line 1 – Versova–Ghatkopar', destination: 'Versova', departureTime: '08:15', arrivalTime: '08:52', platform: '1', status: 'on-time', trainNumber: 'MM-102', headwayMinutes: 10, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-003', station: 'Ghatkopar', line: 'Line 1 – Versova–Ghatkopar', destination: 'Versova', departureTime: '08:30', arrivalTime: '09:07', platform: '2', status: 'delayed', trainNumber: 'MM-103', headwayMinutes: 15, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-004', station: 'Versova', line: 'Line 1 – Versova–Ghatkopar', destination: 'Ghatkopar', departureTime: '09:00', arrivalTime: '09:37', platform: '1', status: 'on-time', trainNumber: 'MM-201', headwayMinutes: 10, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-005', station: 'Versova', line: 'Line 1 – Versova–Ghatkopar', destination: 'Ghatkopar', departureTime: '09:15', arrivalTime: '09:52', platform: '2', status: 'delayed', trainNumber: 'MM-202', headwayMinutes: 10, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-101', station: 'Andheri', line: 'Line 1 – Versova–Ghatkopar', destination: 'Versova', departureTime: '08:20', platform: '1', status: 'on-time', trainNumber: 'MM-110', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-102', station: 'Andheri', line: 'Line 1 – Versova–Ghatkopar', destination: 'Ghatkopar', departureTime: '08:25', platform: '2', status: 'on-time', trainNumber: 'MM-210', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-103', station: 'Marol Naka', line: 'Line 1 – Versova–Ghatkopar', destination: 'Versova', departureTime: '08:35', platform: '1', status: 'on-time', trainNumber: 'MM-115', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  
  // Line 7: Andheri East - Dahisar East
  { id: 'sch-006', station: 'Dahisar East', line: 'Line 7 – Andheri East–Dahisar East', destination: 'Andheri East', departureTime: '08:12', platform: '1', status: 'delayed', trainNumber: 'MM-720', headwayMinutes: 12, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-007', station: 'Dahisar East', line: 'Line 7 – Andheri East–Dahisar East', destination: 'Andheri East', departureTime: '08:24', platform: '2', status: 'on-time', trainNumber: 'MM-721', headwayMinutes: 12, daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-701', station: 'Andheri East', line: 'Line 7 – Andheri East–Dahisar East', destination: 'Dahisar East', departureTime: '09:05', platform: '1', status: 'on-time', trainNumber: 'MM-750', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-702', station: 'Jogeshwari East', line: 'Line 7 – Andheri East–Dahisar East', destination: 'Andheri East', departureTime: '08:45', platform: '2', status: 'on-time', trainNumber: 'MM-755', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  
  // Line 2A: Dahisar - D.N. Nagar
  { id: 'sch-201', station: 'Dahisar East', line: 'Line 2A – Dahisar–D.N. Nagar', destination: 'D.N. Nagar', departureTime: '07:30', platform: '1', status: 'on-time', trainNumber: 'MM-250', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-202', station: 'Borivali East', line: 'Line 2A – Dahisar–D.N. Nagar', destination: 'D.N. Nagar', departureTime: '07:45', platform: '1', status: 'on-time', trainNumber: 'MM-255', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-203', station: 'D.N. Nagar', line: 'Line 2A – Dahisar–D.N. Nagar', destination: 'Dahisar East', departureTime: '08:15', platform: '2', status: 'on-time', trainNumber: 'MM-260', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  
  // Line 3: Colaba - SEEPZ
  { id: 'sch-301', station: 'Mumbai CSMT', line: 'Line 3 – Colaba–SEEPZ–Aarey (Aqua)', destination: 'SEEPZ', departureTime: '08:00', platform: '1', status: 'on-time', trainNumber: 'AQ-301', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-302', station: 'BKC', line: 'Line 3 – Colaba–SEEPZ–Aarey (Aqua)', destination: 'SEEPZ', departureTime: '08:30', platform: '1', status: 'on-time', trainNumber: 'AQ-305', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-303', station: 'Dadar', line: 'Line 3 – Colaba–SEEPZ–Aarey (Aqua)', destination: 'Cuffe Parade', departureTime: '08:45', platform: '2', status: 'on-time', trainNumber: 'AQ-310', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  
  // Railway - Central Line
  { id: 'sch-008', station: 'CSMT', line: 'Central Line', destination: 'Kalyan', departureTime: '08:30', platform: '5', status: 'on-time', trainNumber: 'CR-K501', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-009', station: 'CSMT', line: 'Central Line', destination: 'Thane', departureTime: '08:45', platform: '4', status: 'cancelled', trainNumber: 'CR-T502', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-501', station: 'Thane', line: 'Central Line', destination: 'CSMT', departureTime: '07:15', platform: '1', status: 'on-time', trainNumber: 'CR-C101', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-502', station: 'Kurla', line: 'Central Line', destination: 'Kalyan', departureTime: '08:10', platform: '3', status: 'delayed', trainNumber: 'CR-K105', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  
  // Railway - Western Line
  { id: 'sch-010', station: 'Churchgate', line: 'Western Line', destination: 'Virar', departureTime: '07:50', platform: '3', status: 'on-time', trainNumber: 'WR-V100', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-011', station: 'Churchgate', line: 'Western Line', destination: 'Borivali', departureTime: '08:05', platform: '2', status: 'on-time', trainNumber: 'WR-B101', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], published: true },
  { id: 'sch-601', station: 'Borivali', line: 'Western Line', destination: 'Churchgate', departureTime: '07:20', platform: '1', status: 'on-time', trainNumber: 'WR-C201', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-602', station: 'Andheri', line: 'Western Line', destination: 'Churchgate', departureTime: '07:45', platform: '2', status: 'on-time', trainNumber: 'WR-C205', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-603', station: 'Dadar', line: 'Western Line', destination: 'Virar', departureTime: '08:15', platform: '4', status: 'delayed', trainNumber: 'WR-V210', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  
  // Night Shifts
  { id: 'sch-901', station: 'Ghatkopar', line: 'Line 1 – Versova–Ghatkopar', destination: 'Versova', departureTime: '22:15', platform: '1', status: 'on-time', trainNumber: 'MM-190', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'], published: true },
  { id: 'sch-902', station: 'CSMT', line: 'Central Line', destination: 'Kasara', departureTime: '23:45', platform: '6', status: 'on-time', trainNumber: 'CR-K999', daysOfWeek: ['fri', 'sat'], published: true },
  { id: 'sch-903', station: 'Churchgate', line: 'Western Line', destination: 'Virar', departureTime: '00:05', platform: '1', status: 'on-time', trainNumber: 'WR-V001', daysOfWeek: ['sun'], published: true }
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
