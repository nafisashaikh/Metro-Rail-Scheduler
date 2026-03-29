import { MetroLine, StationMetrics, Train, TrainHealth, TrainCapacity } from '../types/metro';

// ─── Mumbai Western Railway ──────────────────────────────────────────────────

export const westernRailwayLine: MetroLine = {
  id: 'western',
  name: 'Western Railway – Churchgate to Virar',
  color: '#DC2626',
  networkType: 'western',
  operationalStatus: 'operational',
  totalLength: '60 km',
  description: "One of the world's busiest commuter rail corridors",
  stations: [
    'Churchgate',
    'Marine Lines',
    'Charni Road',
    'Grant Road',
    'Mumbai Central',
    'Mahalaxmi',
    'Lower Parel',
    'Prabhadevi',
    'Dadar',
    'Matunga Road',
    'Mahim Junction',
    'Bandra',
    'Khar Road',
    'Santacruz',
    'Vile Parle',
    'Andheri',
    'Jogeshwari',
    'Ram Mandir',
    'Goregaon',
    'Malad',
    'Kandivali',
    'Borivali',
    'Dahisar',
    'Mira Road',
    'Bhayandar',
    'Naigaon',
    'Vasai Road',
    'Virar',
  ],
  stationCoords: [
    { name: 'Churchgate', lat: 18.9354, lng: 72.8258 },
    { name: 'Marine Lines', lat: 18.9432, lng: 72.8233 },
    { name: 'Charni Road', lat: 18.9516, lng: 72.8198 },
    { name: 'Grant Road', lat: 18.9636, lng: 72.8161 },
    { name: 'Mumbai Central', lat: 18.9691, lng: 72.8193 },
    { name: 'Mahalaxmi', lat: 18.9839, lng: 72.8187 },
    { name: 'Lower Parel', lat: 19.0, lng: 72.8236 },
    { name: 'Prabhadevi', lat: 19.0028, lng: 72.8253 },
    { name: 'Dadar', lat: 19.018, lng: 72.8425 },
    { name: 'Matunga Road', lat: 19.0268, lng: 72.8441 },
    { name: 'Mahim Junction', lat: 19.0386, lng: 72.8441 },
    { name: 'Bandra', lat: 19.0543, lng: 72.8397 },
    { name: 'Khar Road', lat: 19.0677, lng: 72.8367 },
    { name: 'Santacruz', lat: 19.0815, lng: 72.8356 },
    { name: 'Vile Parle', lat: 19.0999, lng: 72.8478 },
    { name: 'Andheri', lat: 19.1197, lng: 72.8474 },
    { name: 'Jogeshwari', lat: 19.1348, lng: 72.8491 },
    { name: 'Ram Mandir', lat: 19.1509, lng: 72.8547 },
    { name: 'Goregaon', lat: 19.1663, lng: 72.8606 },
    { name: 'Malad', lat: 19.1869, lng: 72.8481 },
    { name: 'Kandivali', lat: 19.2045, lng: 72.8516 },
    { name: 'Borivali', lat: 19.2293, lng: 72.857 },
    { name: 'Dahisar', lat: 19.2545, lng: 72.8622 },
    { name: 'Mira Road', lat: 19.2818, lng: 72.8783 },
    { name: 'Bhayandar', lat: 19.2998, lng: 72.8751 },
    { name: 'Naigaon', lat: 19.3615, lng: 72.8573 },
    { name: 'Vasai Road', lat: 19.3733, lng: 72.8264 },
    { name: 'Virar', lat: 19.457, lng: 72.8067 },
  ],
};

// ─── Central Railway ──────────────────────────────────────────────────────────

export const centralRailwayLine: MetroLine = {
  id: 'central',
  name: 'Central Railway – CSMT to Kasara/Karjat',
  color: '#B45309',
  networkType: 'central',
  operationalStatus: 'operational',
  totalLength: '120 km',
  description: 'Main trunk line of Central Railway serving eastern suburbs',
  stations: [
    'Mumbai CSMT',
    'Masjid Bunder',
    'Sandhurst Road',
    'Byculla',
    'Chinchpokli',
    'Currey Road',
    'Parel',
    'Dadar',
    'Matunga',
    'Sion',
    'Kurla',
    'Vidyavihar',
    'Ghatkopar',
    'Vikhroli',
    'Kanjurmarg',
    'Bhandup',
    'Nahur',
    'Mulund',
    'Thane',
    'Kalwa',
    'Mumbra',
    'Diva',
    'Kopar',
    'Dombivli',
    'Thakurli',
    'Kalyan',
    'Shahad',
    'Ambivli',
    'Titwala',
    'Khadavli',
    'Vasind',
    'Asangaon',
    'Atgaon',
    'Khardi',
    'Kasara',
  ],
  stationCoords: [
    { name: 'Mumbai CSMT', lat: 18.94, lng: 72.8357 },
    { name: 'Masjid Bunder', lat: 18.9478, lng: 72.8366 },
    { name: 'Sandhurst Road', lat: 18.954, lng: 72.844 },
    { name: 'Byculla', lat: 18.9649, lng: 72.839 },
    { name: 'Chinchpokli', lat: 18.9739, lng: 72.8375 },
    { name: 'Currey Road', lat: 18.982, lng: 72.8338 },
    { name: 'Parel', lat: 18.9944, lng: 72.8357 },
    { name: 'Dadar', lat: 19.018, lng: 72.8425 },
    { name: 'Matunga', lat: 19.0298, lng: 72.856 },
    { name: 'Sion', lat: 19.039, lng: 72.8603 },
    { name: 'Kurla', lat: 19.0665, lng: 72.8821 },
    { name: 'Vidyavihar', lat: 19.0723, lng: 72.8894 },
    { name: 'Ghatkopar', lat: 19.0825, lng: 72.9087 },
    { name: 'Vikhroli', lat: 19.1015, lng: 72.9237 },
    { name: 'Kanjurmarg', lat: 19.1168, lng: 72.9268 },
    { name: 'Bhandup', lat: 19.135, lng: 72.9296 },
    { name: 'Nahur', lat: 19.1453, lng: 72.9317 },
    { name: 'Mulund', lat: 19.1685, lng: 72.9559 },
    { name: 'Thane', lat: 19.18, lng: 72.97 },
    { name: 'Kalwa', lat: 19.19, lng: 72.985 },
    { name: 'Mumbra', lat: 19.193, lng: 73.021 },
    { name: 'Diva', lat: 19.2092, lng: 73.0395 },
    { name: 'Kopar', lat: 19.2145, lng: 73.052 },
    { name: 'Dombivli', lat: 19.2173, lng: 73.0879 },
    { name: 'Thakurli', lat: 19.2195, lng: 73.102 },
    { name: 'Kalyan', lat: 19.2437, lng: 73.1355 },
    { name: 'Shahad', lat: 19.2592, lng: 73.1628 },
    { name: 'Ambivli', lat: 19.2679, lng: 73.1822 },
    { name: 'Titwala', lat: 19.2925, lng: 73.2019 },
    { name: 'Khadavli', lat: 19.3186, lng: 73.228 },
    { name: 'Vasind', lat: 19.3523, lng: 73.2619 },
    { name: 'Asangaon', lat: 19.394, lng: 73.2986 },
    { name: 'Atgaon', lat: 19.4479, lng: 73.3349 },
    { name: 'Khardi', lat: 19.501, lng: 73.362 },
    { name: 'Kasara', lat: 19.583, lng: 73.46 },
  ],
};

// ─── Harbour Line ─────────────────────────────────────────────────────────────

export const harbourLine: MetroLine = {
  id: 'harbour',
  name: 'Harbour Line – CSMT to Panvel',
  color: '#1D4ED8',
  networkType: 'harbour',
  operationalStatus: 'operational',
  totalLength: '55 km',
  description: 'Connects Island City to Navi Mumbai via Chembur & Vashi',
  stations: [
    'Mumbai CSMT',
    'Masjid',
    'Dockyard Road',
    'Reay Road',
    'Cotton Green',
    'Sewri',
    'Vadala Road',
    "King's Circle",
    'Mahim Junction',
    'Chunabhatti',
    'Kurla',
    'Tilak Nagar',
    'Chembur',
    'Govandi',
    'Mankhurd',
    'Vashi',
    'Sanpada',
    'Juinagar',
    'Nerul',
    'Seawoods–Darave',
    'CBD Belapur',
    'Kharghar',
    'Mansarovar',
    'Khandeshwar',
    'Panvel',
  ],
  stationCoords: [
    { name: 'Mumbai CSMT', lat: 18.94, lng: 72.8357 },
    { name: 'Masjid', lat: 18.9478, lng: 72.8366 },
    { name: 'Dockyard Road', lat: 18.957, lng: 72.8456 },
    { name: 'Reay Road', lat: 18.9648, lng: 72.8476 },
    { name: 'Cotton Green', lat: 18.9735, lng: 72.85 },
    { name: 'Sewri', lat: 18.9802, lng: 72.8576 },
    { name: 'Vadala Road', lat: 18.9971, lng: 72.8629 },
    { name: "King's Circle", lat: 19.0228, lng: 72.86 },
    { name: 'Mahim Junction', lat: 19.0386, lng: 72.8441 },
    { name: 'Chunabhatti', lat: 19.0469, lng: 72.8722 },
    { name: 'Kurla', lat: 19.0665, lng: 72.8821 },
    { name: 'Tilak Nagar', lat: 19.0766, lng: 72.8894 },
    { name: 'Chembur', lat: 19.062, lng: 72.8996 },
    { name: 'Govandi', lat: 19.0493, lng: 72.9169 },
    { name: 'Mankhurd', lat: 19.0421, lng: 72.9264 },
    { name: 'Vashi', lat: 19.0759, lng: 72.9987 },
    { name: 'Sanpada', lat: 19.068, lng: 73.0101 },
    { name: 'Juinagar', lat: 19.059, lng: 73.022 },
    { name: 'Nerul', lat: 19.0392, lng: 73.0166 },
    { name: 'Seawoods–Darave', lat: 19.0244, lng: 73.0183 },
    { name: 'CBD Belapur', lat: 19.0186, lng: 73.0335 },
    { name: 'Kharghar', lat: 19.0384, lng: 73.0665 },
    { name: 'Mansarovar', lat: 19.03, lng: 73.072 },
    { name: 'Khandeshwar', lat: 19.0285, lng: 73.0742 },
    { name: 'Panvel', lat: 18.988, lng: 73.11 },
  ],
};

// ─── Maharashtra Intercity Lines ──────────────────────────────────────────────

export const puneExpressLine: MetroLine = {
  id: 'pune-express',
  name: 'Deccan Express – Mumbai to Pune',
  color: '#7C3AED',
  networkType: 'central',
  operationalStatus: 'operational',
  totalLength: '192 km',
  description: 'Intercity express service connecting Mumbai with Pune via Lonavala',
  stations: [
    'Mumbai CSMT',
    'Dadar',
    'Thane',
    'Kalyan',
    'Karjat',
    'Khopoli',
    'Lonavala',
    'Malavli',
    'Khandala',
    'Shivajinagar',
    'Pune',
  ],
  stationCoords: [
    { name: 'Mumbai CSMT', lat: 18.94, lng: 72.8357 },
    { name: 'Dadar', lat: 19.018, lng: 72.8425 },
    { name: 'Thane', lat: 19.18, lng: 72.97 },
    { name: 'Kalyan', lat: 19.2437, lng: 73.1355 },
    { name: 'Karjat', lat: 18.9143, lng: 73.315 },
    { name: 'Khopoli', lat: 18.783, lng: 73.34 },
    { name: 'Lonavala', lat: 18.7481, lng: 73.4072 },
    { name: 'Malavli', lat: 18.77, lng: 73.51 },
    { name: 'Khandala', lat: 18.78, lng: 73.39 },
    { name: 'Shivajinagar', lat: 18.53, lng: 73.84 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  ],
};

export const maharashtraRailwayLines: MetroLine[] = [
  westernRailwayLine,
  centralRailwayLine,
  harbourLine,
  puneExpressLine,
];

// ─── Shared generators ────────────────────────────────────────────────────────

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
};

const generateTrainCapacity = (time: string): TrainCapacity => {
  const [hours] = time.split(':').map(Number);
  const total = 1500;
  let occ: number;
  if ((hours >= 8 && hours < 11) || (hours >= 17 && hours < 21)) occ = 0.85 + Math.random() * 0.15;
  else if ((hours >= 6 && hours < 8) || (hours >= 11 && hours < 17))
    occ = 0.5 + Math.random() * 0.3;
  else occ = 0.2 + Math.random() * 0.3;
  const current = Math.round(total * occ);
  return {
    total,
    current,
    predicted: Math.round(current * (0.9 + Math.random() * 0.2)),
    percentage: Math.round((current / total) * 100),
  };
};

const generateDepartureTimes = (): string[] => {
  const times: string[] = [];
  const now = new Date();
  for (let h = 5; h <= 23; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h > now.getHours() || (h === now.getHours() && m >= now.getMinutes())) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  }
  return times;
};

export const generateRailwayTrains = (station: string, line: MetroLine): Train[] => {
  const times = generateDepartureTimes();
  const trains: Train[] = [];
  const idx = line.stations.indexOf(station);
  if (idx === -1) return [];
  const prefix =
    line.id === 'western'
      ? 'WR'
      : line.id === 'central'
        ? 'CR'
        : line.id === 'harbour'
          ? 'HL'
          : 'MH';
  times.slice(0, 12).forEach((time, i) => {
    if (idx < line.stations.length - 1) {
      trains.push({
        id: `${line.id}-${station}-fwd-${i}`,
        trainNumber: `${prefix}${90001 + i}`,
        line: line.name,
        destination: line.stations[line.stations.length - 1],
        departureTime: time,
        platform: idx % 2 === 0 ? '1' : '2',
        status: Math.random() > 0.85 ? 'delayed' : 'on-time',
        health: generateTrainHealth(),
        capacity: generateTrainCapacity(time),
      });
    }
    if (idx > 0 && i < 11) {
      const rev = times[i * 2 + 1] || time;
      trains.push({
        id: `${line.id}-${station}-rev-${i}`,
        trainNumber: `${prefix}${91001 + i}`,
        line: line.name,
        destination: line.stations[0],
        departureTime: rev,
        platform: idx % 2 === 0 ? '2' : '1',
        status: Math.random() > 0.88 ? 'delayed' : 'on-time',
        health: generateTrainHealth(),
        capacity: generateTrainCapacity(rev),
      });
    }
  });
  return trains.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
};

export const getRailwayStationMetrics = (station: string): StationMetrics => {
  const major = [
    'Mumbai CSMT',
    'Dadar',
    'Thane',
    'Kalyan',
    'Churchgate',
    'Borivali',
    'Andheri',
    'Kurla',
    'Panvel',
    'Pune',
  ];
  const isMajor = major.some((s) => station.includes(s.split(' ')[0]));
  const efficiency = isMajor ? 68 + Math.random() * 22 : 80 + Math.random() * 15;
  const avgDelay = isMajor ? 4 + Math.random() * 6 : 1 + Math.random() * 4;
  const onTime = isMajor ? 72 + Math.random() * 18 : 82 + Math.random() * 14;
  const daily = isMajor ? 100000 + Math.random() * 200000 : 20000 + Math.random() * 60000;
  return {
    stationName: station,
    efficiency: Math.round(efficiency),
    avgDelay: Math.round(avgDelay * 10) / 10,
    onTimePercentage: Math.round(onTime),
    dailyPassengers: Math.round(daily),
    peakHours: ['07:30–10:00', '17:00–20:30'],
    congestionLevel: isMajor
      ? Math.random() > 0.3
        ? 'high'
        : 'medium'
      : Math.random() > 0.6
        ? 'medium'
        : 'low',
  };
};
