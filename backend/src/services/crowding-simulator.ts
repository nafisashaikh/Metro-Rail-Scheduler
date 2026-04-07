interface CrowdingLevel {
  level: 'low' | 'medium' | 'high';
  label: 'Seats Available' | 'Standing Room' | 'Crowded';
  confidence: number; // 0-100%
  suggestion?: string;
  historicalPattern?: string;
}

interface StationCrowdingPattern {
  stationId: string;
  peakHours: { start: number; end: number }[];
  boardingMultiplier: number; // 1.0 = normal, 1.5 = high boarding station
  weekendReduction: number; // 0.7 = 30% less crowded on weekends
}

interface TimeCrowdingPattern {
  hour: number;
  baseOccupancy: number; // 0-1 (0 = empty, 1 = packed)
  variance: number; // randomness factor
}

class CrowdingSimulator {
  private stationPatterns!: Map<string, StationCrowdingPattern>;
  private timePatterns!: TimeCrowdingPattern[];
  private lineCapacities!: Map<string, number>; // max passengers per train

  constructor() {
    this.initializeStationPatterns();
    this.initializeTimePatterns();
    this.initializeLineCapacities();
  }

  private initializeStationPatterns(): void {
    this.stationPatterns = new Map([
      // High-traffic stations (business districts)
      ['ameerpet', {
        stationId: 'ameerpet',
        peakHours: [{ start: 8, end: 10 }, { start: 17, end: 20 }],
        boardingMultiplier: 1.6,
        weekendReduction: 0.6
      }],
      ['begumpet', {
        stationId: 'begumpet',
        peakHours: [{ start: 7, end: 9 }, { start: 18, end: 20 }],
        boardingMultiplier: 1.4,
        weekendReduction: 0.7
      }],
      ['hitech_city', {
        stationId: 'hitech_city',
        peakHours: [{ start: 8, end: 10 }, { start: 17, end: 19 }],
        boardingMultiplier: 1.8, // Major IT hub
        weekendReduction: 0.4 // Much quieter on weekends
      }],
      // Medium-traffic stations
      ['rasoolpura', {
        stationId: 'rasoolpura',
        peakHours: [{ start: 8, end: 9 }, { start: 18, end: 19 }],
        boardingMultiplier: 1.2,
        weekendReduction: 0.8
      }],
      ['jubileehills', {
        stationId: 'jubileehills',
        peakHours: [{ start: 7, end: 9 }, { start: 17, end: 19 }],
        boardingMultiplier: 1.3,
        weekendReduction: 0.75
      }],
      // Lower-traffic stations
      ['madhapur', {
        stationId: 'madhapur',
        peakHours: [{ start: 8, end: 9 }, { start: 17, end: 18 }],
        boardingMultiplier: 1.0,
        weekendReduction: 0.9
      }]
    ]);
  }

  private initializeTimePatterns(): void {
    // Hourly base occupancy patterns (24-hour format)
    this.timePatterns = [
      // Late night / Early morning (00-05)
      { hour: 0, baseOccupancy: 0.1, variance: 0.05 },
      { hour: 1, baseOccupancy: 0.05, variance: 0.02 },
      { hour: 2, baseOccupancy: 0.03, variance: 0.01 },
      { hour: 3, baseOccupancy: 0.03, variance: 0.01 },
      { hour: 4, baseOccupancy: 0.05, variance: 0.02 },
      { hour: 5, baseOccupancy: 0.15, variance: 0.05 },
      
      // Morning rush (06-10)
      { hour: 6, baseOccupancy: 0.3, variance: 0.1 },
      { hour: 7, baseOccupancy: 0.65, variance: 0.15 }, // Heavy morning rush
      { hour: 8, baseOccupancy: 0.85, variance: 0.1 }, // Peak morning
      { hour: 9, baseOccupancy: 0.75, variance: 0.12 },
      { hour: 10, baseOccupancy: 0.45, variance: 0.1 },
      
      // Daytime (11-16)
      { hour: 11, baseOccupancy: 0.35, variance: 0.08 },
      { hour: 12, baseOccupancy: 0.5, variance: 0.1 }, // Lunch hour
      { hour: 13, baseOccupancy: 0.45, variance: 0.1 },
      { hour: 14, baseOccupancy: 0.35, variance: 0.08 },
      { hour: 15, baseOccupancy: 0.4, variance: 0.08 },
      { hour: 16, baseOccupancy: 0.5, variance: 0.1 },
      
      // Evening rush (17-21)
      { hour: 17, baseOccupancy: 0.75, variance: 0.12 },
      { hour: 18, baseOccupancy: 0.9, variance: 0.08 }, // Peak evening
      { hour: 19, baseOccupancy: 0.8, variance: 0.1 },
      { hour: 20, baseOccupancy: 0.65, variance: 0.12 },
      { hour: 21, baseOccupancy: 0.45, variance: 0.1 },
      
      // Night (22-23)
      { hour: 22, baseOccupancy: 0.3, variance: 0.08 },
      { hour: 23, baseOccupancy: 0.15, variance: 0.05 }
    ];
  }

  private initializeLineCapacities(): void {
    this.lineCapacities = new Map([
      ['blue-line', 300], // Mumbai Metro Blue Line capacity
      ['red-line', 280],
      ['green-line', 250],
      ['yellow-line', 300]
    ]);
  }

  /**
   * Calculate current crowding level for a specific train
   */
  calculateCrowding(
    lineId: string,
    stationId: string,
    trainId: string,
    timestamp: number = Date.now()
  ): CrowdingLevel {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Get base patterns
    const timePattern = this.timePatterns.find(p => p.hour === hour) || 
                       this.timePatterns[12]; // default to midday
    const stationPattern = this.stationPatterns.get(stationId);
    const trainCapacity = this.lineCapacities.get(lineId) || 280;

    // Calculate base occupancy
    let occupancy = timePattern.baseOccupancy;

    // Apply station-specific multipliers
    if (stationPattern) {
      // Check if current time is in peak hours
      const isPeakHour = stationPattern.peakHours.some(
        peak => hour >= peak.start && hour <= peak.end
      );
      
      if (isPeakHour) {
        occupancy *= stationPattern.boardingMultiplier;
      }
      
      // Apply weekend reduction
      if (isWeekend) {
        occupancy *= stationPattern.weekendReduction;
      }
    }

    // Add some randomness and train-specific variation
    const trainHash = this.hashString(trainId) % 100; // 0-99
    const trainVariation = (trainHash - 50) / 100 * 0.2; // ±0.1 variation
    occupancy += trainVariation;
    
    // Add time-based randomness
    occupancy += (Math.random() - 0.5) * timePattern.variance;
    
    // Clamp to valid range
    occupancy = Math.max(0, Math.min(1, occupancy));
    
    // Convert to passenger count and crowding level
    const passengerCount = Math.round(occupancy * trainCapacity);
    const crowdingLevel = this.occupancyToCrowdingLevel(occupancy);
    
    // Generate suggestions and historical patterns
    const suggestion = this.generateSuggestion(occupancy, hour, isWeekend, stationPattern);
    const historicalPattern = this.generateHistoricalPattern(hour, dayOfWeek, stationPattern);

    return {
      level: crowdingLevel.level,
      label: crowdingLevel.label,
      confidence: this.calculateConfidence(occupancy, timePattern, stationPattern),
      suggestion,
      historicalPattern
    };
  }

  private occupancyToCrowdingLevel(occupancy: number): { level: 'low' | 'medium' | 'high', label: 'Seats Available' | 'Standing Room' | 'Crowded' } {
    if (occupancy <= 0.6) {
      return { level: 'low', label: 'Seats Available' };
    } else if (occupancy <= 0.85) {
      return { level: 'medium', label: 'Standing Room' };
    } else {
      return { level: 'high', label: 'Crowded' };
    }
  }

  private generateSuggestion(
    occupancy: number, 
    hour: number, 
    isWeekend: boolean, 
    stationPattern?: StationCrowdingPattern
  ): string | undefined {
    if (occupancy <= 0.6) {
      return undefined; // No suggestion needed for low crowding
    }

    const suggestions = [];

    // Time-based suggestions
    if (occupancy > 0.8) {
      if (hour >= 7 && hour <= 9) {
        suggestions.push("Consider traveling 15-30 minutes earlier to avoid rush hour");
        suggestions.push("Next train in 4-6 minutes typically less crowded");
      } else if (hour >= 17 && hour <= 19) {
        suggestions.push("Consider waiting 10 minutes for less crowded train");
        suggestions.push("Evening rush - try traveling after 8 PM if possible");
      } else {
        suggestions.push("Wait for next train in 3-5 minutes");
      }
    } else if (occupancy > 0.6) {
      suggestions.push("Standing room available");
      if (!isWeekend && (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19)) {
        suggestions.push("Rush hour - expect moderate crowding");
      }
    }

    // Station-specific suggestions
    if (stationPattern && stationPattern.boardingMultiplier > 1.3) {
      suggestions.push("Major station - consider boarding at previous/next stop");
    }

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  private generateHistoricalPattern(
    hour: number, 
    dayOfWeek: string, 
    stationPattern?: StationCrowdingPattern
  ): string {
    const patterns = [
      `${dayOfWeek}s at ${hour}:00 typically ${this.getTypicalCrowdingDescription(hour)}`,
      `Historical data shows ${this.getHourDescription(hour)} crowding at this time`,
    ];

    if (stationPattern) {
      const isPeakStation = stationPattern.boardingMultiplier > 1.4;
      if (isPeakStation) {
        patterns.push(`Major station - usually busier during peak hours`);
      }
    }

    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getTypicalCrowdingDescription(hour: number): string {
    if (hour >= 7 && hour <= 9) return "busy (morning rush)";
    if (hour >= 17 && hour <= 19) return "very busy (evening rush)";
    if (hour >= 11 && hour <= 14) return "moderate (lunch period)";
    if (hour >= 22 || hour <= 5) return "quiet (night hours)";
    return "moderate";
  }

  private getHourDescription(hour: number): string {
    const timePattern = this.timePatterns.find(p => p.hour === hour);
    if (!timePattern) return "moderate";
    
    if (timePattern.baseOccupancy >= 0.8) return "high";
    if (timePattern.baseOccupancy >= 0.6) return "moderate-high";
    if (timePattern.baseOccupancy >= 0.4) return "moderate";
    if (timePattern.baseOccupancy >= 0.2) return "low-moderate";
    return "low";
  }

  private calculateConfidence(
    occupancy: number,
    timePattern: TimeCrowdingPattern,
    stationPattern?: StationCrowdingPattern
  ): number {
    let confidence = 80; // Base confidence
    
    // Higher confidence during well-established patterns
    if (timePattern.variance < 0.1) {
      confidence += 10; // Very predictable times
    }
    
    // Higher confidence for major stations (more data)
    if (stationPattern && stationPattern.boardingMultiplier > 1.3) {
      confidence += 10;
    }
    
    // Lower confidence for edge cases
    if (occupancy < 0.1 || occupancy > 0.95) {
      confidence -= 15;
    }
    
    return Math.min(95, Math.max(60, confidence));
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get crowding prediction for next few trains at a station
   */
  getPredictedCrowding(
    lineId: string,
    stationId: string,
    nextTrainIds: string[],
    timestamp: number = Date.now()
  ): CrowdingLevel[] {
    return nextTrainIds.map((trainId, index) => {
      // Each subsequent train is 4-6 minutes later
      const trainTime = timestamp + (index * 5 * 60 * 1000);
      return this.calculateCrowding(lineId, stationId, trainId, trainTime);
    });
  }

  /**
   * Get station-wide crowding insights
   */
  getStationInsights(stationId: string, timestamp: number = Date.now()): {
    currentLevel: 'low' | 'medium' | 'high';
    peakHours: string;
    weekendPattern: string;
    bestTimes: string;
  } {
    const stationPattern = this.stationPatterns.get(stationId);
    const date = new Date(timestamp);
    const hour = date.getHours();
    
    if (!stationPattern) {
      return {
        currentLevel: 'medium',
        peakHours: 'Rush hours (7-10 AM, 5-8 PM)',
        weekendPattern: 'Generally less crowded on weekends',
        bestTimes: 'Mid-morning (10 AM-12 PM) or late evening (after 8 PM)'
      };
    }

    const peakHoursStr = stationPattern.peakHours
      .map(p => `${p.start}:00-${p.end}:00`)
      .join(', ');

    const weekendReduction = Math.round((1 - stationPattern.weekendReduction) * 100);

    return {
      currentLevel: this.getCurrentStationLevel(stationPattern, hour),
      peakHours: `Peak hours: ${peakHoursStr}`,
      weekendPattern: `${weekendReduction}% less crowded on weekends`,
      bestTimes: this.getBestTimes(stationPattern)
    };
  }

  private getCurrentStationLevel(pattern: StationCrowdingPattern, hour: number): 'low' | 'medium' | 'high' {
    const isPeakHour = pattern.peakHours.some(p => hour >= p.start && hour <= p.end);
    const multiplier = isPeakHour ? pattern.boardingMultiplier : 1.0;
    
    if (multiplier >= 1.5) return 'high';
    if (multiplier >= 1.2) return 'medium';
    return 'low';
  }

  private getBestTimes(pattern: StationCrowdingPattern): string {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const nonPeakHours = allHours.filter(hour => 
      !pattern.peakHours.some(p => hour >= p.start && hour <= p.end) &&
      hour >= 6 && hour <= 22 // Operating hours
    );

    const bestMorning = nonPeakHours.filter(h => h >= 6 && h <= 12)[0];
    const bestAfternoon = nonPeakHours.filter(h => h >= 14 && h <= 16)[0];
    const bestEvening = nonPeakHours.filter(h => h >= 20 && h <= 22)[0];

    const times = [bestMorning, bestAfternoon, bestEvening]
      .filter(Boolean)
      .map(h => `${h}:00`)
      .slice(0, 2)
      .join(' or ');

    return `Best times: ${times || 'Off-peak hours'}`;
  }
}

export { CrowdingSimulator, CrowdingLevel, StationCrowdingPattern };