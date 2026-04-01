import { TrainHealth, TrainCapacity } from '../types/metro';

export const generateTrainHealth = (): TrainHealth => {
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

export const generateTrainCapacity = (time: string, totalCapacity = 1500): TrainCapacity => {
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
};

export const generateDepartureTimes = (startHour = 5, endHour = 23, interval = 10): string[] => {
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
