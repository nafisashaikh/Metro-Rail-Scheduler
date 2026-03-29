import { MetroLine, Train, TrainHealth, TrainCapacity, StationMetrics } from '../types/metro';

// ─── Mumbai Metro Lines ──────────────────────────────────────────────────────

export const mumbaiMetroLines: MetroLine[] = [
  {
    id: 'metro-line-1',
    name: 'Line 1 – Versova–Ghatkopar',
    color: '#E63329',
    networkType: 'metro',
    operationalStatus: 'operational',
    totalLength: '11.4 km',
    description: 'First Mumbai Metro line, fully elevated',
    stations: [
      'Versova',
      'D.N. Nagar',
      'Azad Nagar',
      'Andheri',
      'Western Express Highway',
      'Chakala (J.B. Nagar)',
      'Airport Road',
      'Marol Naka',
      'Saki Naka',
      'Asalpha',
      'Jagruti Nagar',
      'Ghatkopar',
    ],
    stationCoords: [
      { name: 'Versova', lat: 19.1317, lng: 72.819 },
      { name: 'D.N. Nagar', lat: 19.1273, lng: 72.8295 },
      { name: 'Azad Nagar', lat: 19.1231, lng: 72.8367 },
      { name: 'Andheri', lat: 19.1197, lng: 72.8454 },
      { name: 'Western Express Highway', lat: 19.1151, lng: 72.8553 },
      { name: 'Chakala (J.B. Nagar)', lat: 19.1101, lng: 72.8612 },
      { name: 'Airport Road', lat: 19.1052, lng: 72.8638 },
      { name: 'Marol Naka', lat: 19.1001, lng: 72.8683 },
      { name: 'Saki Naka', lat: 19.0941, lng: 72.8861 },
      { name: 'Asalpha', lat: 19.088, lng: 72.902 },
      { name: 'Jagruti Nagar', lat: 19.0822, lng: 72.9073 },
      { name: 'Ghatkopar', lat: 19.0825, lng: 72.9087 },
    ],
  },
  {
    id: 'metro-line-2a',
    name: 'Line 2A – Dahisar–D.N. Nagar',
    color: '#F5A623',
    networkType: 'metro',
    operationalStatus: 'operational',
    totalLength: '18.6 km',
    description: 'Yellow Line, fully elevated along Western Express Highway',
    stations: [
      'Dahisar East',
      'Anand Nagar',
      'Kandarpada',
      'Borivali East',
      'Mandapeshwar',
      'Dahanukarwadi',
      'Kandivali East',
      'Malad East',
      'Pahadi Goregaon',
      'Goregaon East',
      'Aarey Colony',
      'Dindoshi',
      'Kurar',
      'Akurli',
      'Poisar',
      'Eksar',
      'D.N. Nagar',
    ],
    stationCoords: [
      { name: 'Dahisar East', lat: 19.2545, lng: 72.8733 },
      { name: 'Anand Nagar', lat: 19.2438, lng: 72.8671 },
      { name: 'Kandarpada', lat: 19.2348, lng: 72.8628 },
      { name: 'Borivali East', lat: 19.2293, lng: 72.859 },
      { name: 'Mandapeshwar', lat: 19.2148, lng: 72.8588 },
      { name: 'Dahanukarwadi', lat: 19.2059, lng: 72.86 },
      { name: 'Kandivali East', lat: 19.1953, lng: 72.8618 },
      { name: 'Malad East', lat: 19.1881, lng: 72.8639 },
      { name: 'Pahadi Goregaon', lat: 19.176, lng: 72.8607 },
      { name: 'Goregaon East', lat: 19.1663, lng: 72.862 },
      { name: 'Aarey Colony', lat: 19.152, lng: 72.8571 },
      { name: 'Dindoshi', lat: 19.145, lng: 72.8554 },
      { name: 'Kurar', lat: 19.1363, lng: 72.8534 },
      { name: 'Akurli', lat: 19.1273, lng: 72.8532 },
      { name: 'Poisar', lat: 19.1193, lng: 72.851 },
      { name: 'Eksar', lat: 19.11, lng: 72.849 },
      { name: 'D.N. Nagar', lat: 19.1009, lng: 72.8417 },
    ],
  },
  {
    id: 'metro-line-3',
    name: 'Line 3 – Colaba–SEEPZ–Aarey (Aqua)',
    color: '#0095DA',
    networkType: 'metro',
    operationalStatus: 'operational',
    totalLength: '33.5 km',
    description: 'First underground metro in Mumbai – Aqua Line',
    stations: [
      'Cuffe Parade',
      'Mumbai CSMT',
      'Masjid',
      'Marine Lines',
      'Girgaon',
      'Grant Road',
      'Mumbai Central',
      'Mahalaxmi',
      'Science Museum',
      'Acharya Atre Chowk',
      'Worli',
      'Siddhivinayak',
      'Dadar',
      'Shitaladevi',
      'Dharavi',
      'BKC',
      'Santacruz',
      'Domestic Airport',
      'Sahar Road',
      'International Airport',
      'MIDC',
      'SEEPZ',
      'Marol Naka',
      'Andheri',
      'Saki Naka',
      'Jagruti Nagar',
      'Aarey',
    ],
    stationCoords: [
      { name: 'Cuffe Parade', lat: 18.9067, lng: 72.8147 },
      { name: 'Mumbai CSMT', lat: 18.94, lng: 72.8357 },
      { name: 'Masjid', lat: 18.9478, lng: 72.8366 },
      { name: 'Marine Lines', lat: 18.9432, lng: 72.8233 },
      { name: 'Girgaon', lat: 18.9541, lng: 72.8174 },
      { name: 'Grant Road', lat: 18.9636, lng: 72.8161 },
      { name: 'Mumbai Central', lat: 18.9691, lng: 72.8193 },
      { name: 'Mahalaxmi', lat: 18.9839, lng: 72.8187 },
      { name: 'Science Museum', lat: 19.0002, lng: 72.8122 },
      { name: 'Acharya Atre Chowk', lat: 19.0068, lng: 72.8106 },
      { name: 'Worli', lat: 19.0178, lng: 72.8161 },
      { name: 'Siddhivinayak', lat: 19.0164, lng: 72.8319 },
      { name: 'Dadar', lat: 19.018, lng: 72.8425 },
      { name: 'Shitaladevi', lat: 19.0268, lng: 72.8422 },
      { name: 'Dharavi', lat: 19.044, lng: 72.8556 },
      { name: 'BKC', lat: 19.0601, lng: 72.8665 },
      { name: 'Santacruz', lat: 19.0815, lng: 72.8356 },
      { name: 'Domestic Airport', lat: 19.0963, lng: 72.8656 },
      { name: 'Sahar Road', lat: 19.1072, lng: 72.8671 },
      { name: 'International Airport', lat: 19.0938, lng: 72.8602 },
      { name: 'MIDC', lat: 19.11, lng: 72.87 },
      { name: 'SEEPZ', lat: 19.1217, lng: 72.8744 },
      { name: 'Marol Naka', lat: 19.1001, lng: 72.8683 },
      { name: 'Andheri', lat: 19.1197, lng: 72.8474 },
      { name: 'Saki Naka', lat: 19.0941, lng: 72.8861 },
      { name: 'Jagruti Nagar', lat: 19.0822, lng: 72.9073 },
      { name: 'Aarey', lat: 19.152, lng: 72.8571 },
    ],
  },
  {
    id: 'metro-line-7',
    name: 'Line 7 – Andheri East–Dahisar East',
    color: '#F7941D',
    networkType: 'metro',
    operationalStatus: 'operational',
    totalLength: '16.5 km',
    description: 'Orange Line, elevated along Eastern Express Highway corridor',
    stations: [
      'Andheri East',
      'Western Exp. Hwy (Andheri)',
      'Chakala',
      'Kranti Nagar',
      'Mogra',
      'Ram Nagar',
      'Jogeshwari East',
      'Oshiwara',
      'Lalji Pada',
      'Kandivali East (L7)',
      'Poisar (L7)',
      'Borivali East (L7)',
      'Dahisar East',
    ],
    stationCoords: [
      { name: 'Andheri East', lat: 19.1197, lng: 72.8554 },
      { name: 'Western Exp. Hwy (Andheri)', lat: 19.1261, lng: 72.859 },
      { name: 'Chakala', lat: 19.1327, lng: 72.8617 },
      { name: 'Kranti Nagar', lat: 19.1398, lng: 72.8634 },
      { name: 'Mogra', lat: 19.1451, lng: 72.8653 },
      { name: 'Ram Nagar', lat: 19.155, lng: 72.867 },
      { name: 'Jogeshwari East', lat: 19.16, lng: 72.8686 },
      { name: 'Oshiwara', lat: 19.1717, lng: 72.8712 },
      { name: 'Lalji Pada', lat: 19.1834, lng: 72.8706 },
      { name: 'Kandivali East (L7)', lat: 19.1953, lng: 72.8718 },
      { name: 'Poisar (L7)', lat: 19.2059, lng: 72.87 },
      { name: 'Borivali East (L7)', lat: 19.2293, lng: 72.869 },
      { name: 'Dahisar East', lat: 19.2545, lng: 72.8733 },
    ],
  },
  {
    id: 'metro-line-2b',
    name: 'Line 2B – D.N. Nagar–Mandale',
    color: '#F5C523',
    networkType: 'metro',
    operationalStatus: 'construction',
    totalLength: '23.6 km',
    description: 'Yellow Line extension – under construction',
    stations: [
      'D.N. Nagar',
      'Vakola',
      'Santacruz East',
      'Kurla',
      'Saki Naka (2B)',
      'Asalpha (2B)',
      'Jagruti Nagar (2B)',
      'Ghatkopar (2B)',
      'Vikhroli',
      'Kanjurmarg (2B)',
      'Bhandup (2B)',
      'Nahur (2B)',
      'Mulund (2B)',
      'Thane (2B)',
      'Ghansoli',
      'Rabale',
      'Mahape',
      'Airoli',
      'Turbhe',
      'Mandale',
    ],
    stationCoords: [
      { name: 'D.N. Nagar', lat: 19.1009, lng: 72.8417 },
      { name: 'Vakola', lat: 19.09, lng: 72.845 },
      { name: 'Santacruz East', lat: 19.0815, lng: 72.85 },
      { name: 'Kurla', lat: 19.0665, lng: 72.8821 },
      { name: 'Saki Naka (2B)', lat: 19.0941, lng: 72.8861 },
      { name: 'Asalpha (2B)', lat: 19.088, lng: 72.902 },
      { name: 'Jagruti Nagar (2B)', lat: 19.0822, lng: 72.9073 },
      { name: 'Ghatkopar (2B)', lat: 19.0825, lng: 72.9087 },
      { name: 'Vikhroli', lat: 19.1015, lng: 72.9237 },
      { name: 'Kanjurmarg (2B)', lat: 19.1168, lng: 72.9268 },
      { name: 'Bhandup (2B)', lat: 19.135, lng: 72.9296 },
      { name: 'Nahur (2B)', lat: 19.1453, lng: 72.9317 },
      { name: 'Mulund (2B)', lat: 19.1685, lng: 72.9559 },
      { name: 'Thane (2B)', lat: 19.18, lng: 72.97 },
      { name: 'Ghansoli', lat: 19.125, lng: 73.005 },
      { name: 'Rabale', lat: 19.11, lng: 73.01 },
      { name: 'Mahape', lat: 19.105, lng: 73.02 },
      { name: 'Airoli', lat: 19.156, lng: 72.998 },
      { name: 'Turbhe', lat: 19.08, lng: 73.017 },
      { name: 'Mandale', lat: 19.065, lng: 73.03 },
    ],
  },
];

// ─── Shared train data generators ────────────────────────────────────────────

const generateTrainHealth = (): TrainHealth => {
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

  const lastDate = new Date();
  lastDate.setDate(lastDate.getDate() - Math.floor(Math.random() * 30));
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + Math.floor(Math.random() * 45) + 15);

  return {
    overall: Math.round(overall),
    engine: Math.round(engine),
    brakes: Math.round(brakes),
    doors: Math.round(doors),
    ac: Math.round(ac),
    lastMaintenance: lastDate.toLocaleDateString('en-IN'),
    nextMaintenance: nextDate.toLocaleDateString('en-IN'),
    status,
  };
};

const generateTrainCapacity = (time: string, totalCapacity = 1500): TrainCapacity => {
  const [hours] = time.split(':').map(Number);
  let occ: number;
  if ((hours >= 8 && hours < 11) || (hours >= 17 && hours < 21)) occ = 0.85 + Math.random() * 0.15;
  else if ((hours >= 6 && hours < 8) || (hours >= 11 && hours < 17))
    occ = 0.5 + Math.random() * 0.3;
  else occ = 0.2 + Math.random() * 0.3;
  const current = Math.round(totalCapacity * occ);
  return {
    total: totalCapacity,
    current,
    predicted: Math.round(current * (0.9 + Math.random() * 0.2)),
    percentage: Math.round((current / totalCapacity) * 100),
  };
};

const generateDepartureTimes = (startHour = 5, endHour = 23, interval = 10): string[] => {
  const times: string[] = [];
  const now = new Date();
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h > now.getHours() || (h === now.getHours() && m >= now.getMinutes())) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  }
  return times;
};

export const generateTrainsForStation = (station: string, line: MetroLine): Train[] => {
  const departureTimes = generateDepartureTimes(5, 23, line.networkType === 'metro' ? 8 : 10);
  const trains: Train[] = [];
  const stationIndex = line.stations.indexOf(station);
  if (stationIndex === -1) return [];

  const prefix = line.networkType === 'metro' ? 'MM' : 'WR';
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
      const revTime = departureTimes[index * 2 + 1] || time;
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
};

export const getStationMetrics = (station: string): StationMetrics => {
  const majorStations = [
    'Ghatkopar',
    'Andheri',
    'Versova',
    'D.N. Nagar',
    'Dadar',
    'Churchgate',
    'Mumbai Central',
    'Bandra',
    'Borivali',
    'Virar',
    'Mumbai CSMT',
    'Thane',
    'Panvel',
    'Kurla',
  ];
  const isMajor = majorStations.some((s) => station.includes(s.split(' ')[0]));
  const efficiency = isMajor ? 70 + Math.random() * 20 : 80 + Math.random() * 15;
  const avgDelay = isMajor ? 3 + Math.random() * 5 : 1 + Math.random() * 3;
  const onTimePercentage = isMajor ? 75 + Math.random() * 15 : 85 + Math.random() * 12;
  const dailyPassengers = isMajor ? 80000 + Math.random() * 120000 : 15000 + Math.random() * 50000;
  const congestionLevel: StationMetrics['congestionLevel'] = isMajor
    ? Math.random() > 0.3
      ? 'high'
      : 'medium'
    : Math.random() > 0.6
      ? 'medium'
      : 'low';

  return {
    stationName: station,
    efficiency: Math.round(efficiency),
    avgDelay: Math.round(avgDelay * 10) / 10,
    onTimePercentage: Math.round(onTimePercentage),
    dailyPassengers: Math.round(dailyPassengers),
    peakHours: ['08:00–10:00', '17:00–20:00'],
    congestionLevel,
  };
};

export const predictTrainArrival = (train: Train, _currentStation: string) => {
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
};

export const getAllMetroStations = (): string[] => {
  const set = new Set<string>();
  mumbaiMetroLines.forEach((l) => l.stations.forEach((s) => set.add(s)));
  return Array.from(set).sort();
};
