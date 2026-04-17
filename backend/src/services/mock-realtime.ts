import { metroLines, type MetroLine, type Station, type TrainStatus } from '../data/metroData.js';

// Mock real-time data generator for live train status
export class MockRealtimeService {
  private startTime = Date.now();
  private activeTrains = new Map<string, TrainStatus>();
  
  constructor() {
    this.initializeTrains();
  }

  private initializeTrains(): void {
    // Generate realistic train fleet for each line
    metroLines.forEach((line: MetroLine) => {
      const trainCount = Math.floor(line.stations.length / 3); // ~3 stations per train
      
      for (let i = 0; i < trainCount; i++) {
        const trainId = `${line.id}-T${i + 1}`;
        this.activeTrains.set(trainId, {
          id: trainId,
          lineId: line.id,
          lineName: line.name,
          currentStationIndex: Math.floor(Math.random() * line.stations.length),
          direction: Math.random() > 0.5 ? 'forward' : 'reverse',
          delay: this.generateRealisticDelay(),
          crowding: this.generateCrowdingLevel(),
          lastUpdate: Date.now()
        });
      }
    });
  }

  private generateRealisticDelay(): number {
    const now = new Date();
    const hour = now.getHours();
    const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    let baseDelayChance = isWeekend ? 0.1 : 0.2;
    if (isRushHour) baseDelayChance = 0.4;
    
    // Random weather impact (simulate)
    if (Math.random() < 0.15) baseDelayChance *= 1.5; // 15% chance of weather delays
    
    if (Math.random() < baseDelayChance) {
      return Math.floor(Math.random() * 8) + 1; // 1-8 minute delays
    }
    return 0;
  }

  private generateCrowdingLevel(): 'low' | 'medium' | 'high' {
    const now = new Date();
    const hour = now.getHours();
    const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    if (isWeekend) {
      return Math.random() < 0.7 ? 'low' : 'medium';
    }
    
    if (isRushHour) {
      const rand = Math.random();
      if (rand < 0.6) return 'high';
      if (rand < 0.9) return 'medium';
      return 'low';
    }
    
    // Normal hours
    const rand = Math.random();
    if (rand < 0.5) return 'low';
    if (rand < 0.8) return 'medium';
    return 'high';
  }

  // Get next arrivals for a specific station
  getNextArrivals(stationId: string, lineId?: string): any[] {
    const arrivals: any[] = [];
    const now = Date.now();
    // Normalize the incoming stationId so both name-based ("Andheri") and
    // id-based ("andheri") lookups work against whatever the backend data uses.
    const normalizedTarget = stationId.toLowerCase().replace(/[^a-z0-9]/g, '');

    this.activeTrains.forEach((train: TrainStatus) => {
      if (lineId && train.lineId !== lineId) return;

      const line = metroLines.find((l: MetroLine) => l.id === train.lineId);
      if (!line) return;

      // Support both Station objects (with .id/.name) and plain strings.
      const stationIndex = line.stations.findIndex((s: Station) => {
        const name = typeof s === 'string' ? s : (s.name ?? s.id ?? '');
        return name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTarget;
      });
      if (stationIndex === -1) return;

      // Calculate arrival time based on train position and speed.
      const trainStationIndex = train.currentStationIndex;
      const stationDistance = stationIndex - trainStationIndex;

      // Only include trains heading toward this station (correct direction).
      const isInRange = train.direction === 'forward'
        ? stationDistance > 0 && stationDistance <= 5
        : stationDistance < 0 && stationDistance >= -5;

      if (isInRange) {
        const baseTime = Math.abs(stationDistance) * 2; // 2 min per station
        const arrivalTime = baseTime + train.delay;
        const actualArrival = now + (arrivalTime * 60 * 1000);

        const destination = (() => {
          if (train.direction === 'forward') {
            const dest = line.stations[line.stations.length - 1];
            return typeof dest === 'string' ? dest : dest.name;
          }
          const dest = line.stations[0];
          return typeof dest === 'string' ? dest : dest.name;
        })();

        arrivals.push({
          trainId: train.id,
          lineId: train.lineId,
          lineName: train.lineName,
          destination: destination ?? 'Terminal',
          arrivalTime: actualArrival,
          delay: train.delay,
          crowding: train.crowding,
          platform: Math.random() > 0.9 ? '2' : '1', // 10% platform changes
          status: train.delay > 5 ? 'delayed' : train.delay > 0 ? 'minor-delay' : 'on-time'
        });
      }
    });

    return arrivals
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .slice(0, 3); // Next 3 trains
  }

  // Get service alerts
  getServiceAlerts(): any[] {
    const alerts: any[] = [];
    const now = Date.now();
    
    // Random service disruptions (5% chance)
    if (Math.random() < 0.05) {
      const lines = metroLines;
      const randomLine = lines[Math.floor(Math.random() * lines.length)];
      
      alerts.push({
        id: `alert-${now}`,
        severity: 'high',
        type: 'service_disruption',
        title: `${randomLine.name} Line Delay`,
        message: `Technical fault between ${randomLine.stations[2].name} and ${randomLine.stations[3].name}. Expect 10-15 minute delays.`,
        affectedLines: [randomLine.id],
        startTime: now,
        estimatedEndTime: now + (20 * 60 * 1000) // 20 minutes
      });
    }
    
    // Platform changes (2% chance)
    if (Math.random() < 0.02) {
      alerts.push({
        id: `platform-${now}`,
        severity: 'medium',
        type: 'platform_change',
        title: 'Platform Change',
        message: 'Airport Express now departing from Platform 2 instead of Platform 1',
        affectedLines: ['line1'],
        startTime: now
      });
    }
    
    return alerts;
  }

  // Simulate train movement (call every 30 seconds)
  updateTrainPositions(): void {
    this.activeTrains.forEach((train: TrainStatus) => {
      // Move train forward occasionally
      if (Math.random() < 0.3) {
        const line = metroLines.find((l: MetroLine) => l.id === train.lineId);
        if (line) {
          if (train.direction === 'forward') {
            train.currentStationIndex = (train.currentStationIndex + 1) % line.stations.length;
          } else {
            train.currentStationIndex = train.currentStationIndex === 0 
              ? line.stations.length - 1 
              : train.currentStationIndex - 1;
          }
        }
      }
      
      // Occasionally update delay status
      if (Math.random() < 0.1) {
        train.delay = this.generateRealisticDelay();
      }
      
      // Update crowding
      if (Math.random() < 0.2) {
        train.crowding = this.generateCrowdingLevel();
      }
      
      train.lastUpdate = Date.now();
    });
  }
}

export const mockRealtimeService = new MockRealtimeService();

// Update train positions every 30 seconds
setInterval(() => {
  mockRealtimeService.updateTrainPositions();
}, 30000);