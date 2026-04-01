import type { Train, TrainHealth, TrainCapacity, StationMetrics, MetroLine } from '../types/index.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

export function generateTrainHealth(): TrainHealth {
  const engine = 72 + Math.random() * 28;
  const brakes = 70 + Math.random() * 30;
  const doors = 78 + Math.random() * 22;
  const ac = 65 + Math.random() * 35;
  const overall = (engine + brakes + doors + ac) / 4;

  let status: TrainHealth['status'];
  if (overall >= 90) status = 'excellent';
  else if (overall >= 75) status = 'good';
  else if (overall >= 60) status = 'fair';
  else status = 'poor';

  const last = new Date();
  last.setDate(last.getDate() - Math.floor(Math.random() * 30));
  const next = new Date();
  next.setDate(next.getDate() + Math.floor(Math.random() * 45) + 15);

  return {
    overall: Math.round(overall),
    engine: Math.round(engine),
    brakes: Math.round(brakes),
    doors: Math.round(doors),
    ac: Math.round(ac),
    lastMaintenance: last.toLocaleDateString('en-IN'),
    nextMaintenance: next.toLocaleDateString('en-IN'),
    status,
  };
}

export function generateTrainCapacity(time: string, totalCapacity = 1500): TrainCapacity {
  const [hours] = time.split(':').map(Number);
  let occ: number;
  if ((hours >= 8 && hours < 11) || (hours >= 17 && hours < 21)) {
    occ = 0.85 + Math.random() * 0.15;
  } else if ((hours >= 6 && hours < 8) || (hours >= 11 && hours < 17)) {
    occ = 0.5 + Math.random() * 0.3;
  } else {
    occ = 0.2 + Math.random() * 0.3;
  }
  const current = Math.round(totalCapacity * occ);
  return {
    total: totalCapacity,
    current,
    predicted: Math.round(current * (0.9 + Math.random() * 0.2)),
    percentage: Math.round((current / totalCapacity) * 100),
  };
}

export function generateDepartureTimes(interval: number): string[] {
  const times: string[] = [];
  const now = new Date();
  for (let h = 5; h <= 23; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h > now.getHours() || (h === now.getHours() && m >= now.getMinutes())) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  }
  return times;
}

export function generateTrainsForStation(station: string, line: MetroLine): Train[] {
  const interval = line.networkType === 'metro' ? 8 : 10;
  const departureTimes = generateDepartureTimes(interval);
  const trains: Train[] = [];
  const stationIndex = line.stations.indexOf(station);
  if (stationIndex === -1) return [];

  const prefix = line.networkType === 'metro' ? 'MM' : getPrefix(line.id);
  const totalCap = line.networkType === 'metro' ? 900 : 1500;

  departureTimes.slice(0, 12).forEach((time, index) => {
    const trainNum = 90001 + index;
    if (stationIndex < line.stations.length - 1) {
      trains.push({
        id: `${line.id}-${station}-fwd-${index}`,
        trainNumber: `${prefix}${trainNum}`,
        line: line.name,
        destination: line.stations[line.stations.length - 1],
        departureTime: time,
        platform: stationIndex % 2 === 0 ? '1' : '2',
        status: Math.random() > 0.85 ? 'delayed' : 'on-time',
        health: generateTrainHealth(),
        capacity: generateTrainCapacity(time, totalCap),
      });
    }
    if (stationIndex > 0 && index < 11) {
      const revTime = departureTimes[index * 2 + 1] ?? time;
      trains.push({
        id: `${line.id}-${station}-rev-${index}`,
        trainNumber: `${prefix}${trainNum + 1000}`,
        line: line.name,
        destination: line.stations[0],
        departureTime: revTime,
        platform: stationIndex % 2 === 0 ? '2' : '1',
        status: Math.random() > 0.88 ? 'delayed' : 'on-time',
        health: generateTrainHealth(),
        capacity: generateTrainCapacity(revTime, totalCap),
      });
    }
  });

  return trains.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

function getPrefix(lineId: string): string {
  switch (lineId) {
    case 'western': return 'WR';
    case 'central': return 'CR';
    case 'harbour': return 'HL';
    default: return 'MH';
  }
}

// ─── Station metrics ─────────────────────────────────────────────────────────

const METRO_MAJOR_STATIONS = [
  'Ghatkopar', 'Andheri', 'Versova', 'D.N. Nagar', 'Dadar', 'Churchgate',
  'Mumbai Central', 'Bandra', 'Borivali', 'Virar', 'Mumbai CSMT', 'Thane', 'Panvel', 'Kurla',
];

const RAILWAY_MAJOR_STATIONS = [
  'Mumbai CSMT', 'Dadar', 'Thane', 'Kalyan', 'Churchgate', 'Borivali',
  'Andheri', 'Kurla', 'Panvel', 'Pune',
];

export function getStationMetrics(station: string, section: 'metro' | 'railway'): StationMetrics {
  const majorList = section === 'metro' ? METRO_MAJOR_STATIONS : RAILWAY_MAJOR_STATIONS;
  const isMajor = majorList.some((s) => station.includes(s.split(' ')[0]));

  const efficiency = isMajor ? 68 + Math.random() * 22 : 80 + Math.random() * 15;
  const avgDelay = isMajor ? 3 + Math.random() * 6 : 1 + Math.random() * 4;
  const onTimePercentage = isMajor ? 72 + Math.random() * 18 : 82 + Math.random() * 14;
  const dailyPassengers = isMajor
    ? section === 'metro'
      ? 80000 + Math.random() * 120000
      : 100000 + Math.random() * 200000
    : 15000 + Math.random() * 60000;

  const congestionLevel: StationMetrics['congestionLevel'] = isMajor
    ? Math.random() > 0.3 ? 'high' : 'medium'
    : Math.random() > 0.6 ? 'medium' : 'low';

  return {
    stationName: station,
    efficiency: Math.round(efficiency),
    avgDelay: Math.round(avgDelay * 10) / 10,
    onTimePercentage: Math.round(onTimePercentage),
    dailyPassengers: Math.round(dailyPassengers),
    peakHours: section === 'metro' ? ['08:00–10:00', '17:00–20:00'] : ['07:30–10:00', '17:00–20:30'],
    congestionLevel,
  };
}

export function predictArrival(train: Train) {
  const factors: string[] = [];
  let delayMinutes = 0;

  if (train.health.overall < 70) {
    delayMinutes += 3;
    factors.push('Low train health');
  }
  if (train.capacity.percentage > 90) {
    delayMinutes += 2;
    factors.push('High passenger load');
  }
  if (train.status === 'delayed') {
    delayMinutes += 5;
    factors.push('Already delayed');
  }
  const [hours] = train.departureTime.split(':').map(Number);
  if ((hours >= 8 && hours < 11) || (hours >= 17 && hours < 21)) {
    delayMinutes += 2;
    factors.push('Peak hour traffic');
  }

  const [h, m] = train.departureTime.split(':').map(Number);
  const total = h * 60 + m + delayMinutes;
  const predictedTime = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  const confidence = Math.max(65, 95 - factors.length * 5);

  return {
    predictedTime,
    confidence,
    factors: factors.length > 0 ? factors : ['Normal operating conditions'],
  };
}
