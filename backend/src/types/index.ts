// Shared TypeScript types mirroring the frontend's metro.ts

export type UserRole = 'admin' | 'supervisor' | 'employee' | 'passenger';
export type SystemSection = 'metro' | 'railway';
export type NetworkType = 'metro' | 'western' | 'central' | 'harbour';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  employeeId: string;
  department: string;
}

export interface PassengerUser {
  id: string;
  name: string;
  username: string;
  cardNumber?: string;
  role: 'passenger';
}

export interface StationCoord {
  name: string;
  lat: number;
  lng: number;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: string[];
  networkType: NetworkType;
  operationalStatus: 'operational' | 'partial' | 'construction';
  stationCoords: StationCoord[];
  description?: string;
  totalLength?: string;
  section: SystemSection;
}

export interface TrainHealth {
  overall: number;
  engine: number;
  brakes: number;
  doors: number;
  ac: number;
  lastMaintenance: string;
  nextMaintenance: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TrainCapacity {
  total: number;
  current: number;
  predicted: number;
  percentage: number;
}

export interface Train {
  id: string;
  line: string;
  destination: string;
  departureTime: string;
  platform: string;
  status: 'on-time' | 'delayed' | 'cancelled';
  trainNumber: string;
  health: TrainHealth;
  capacity: TrainCapacity;
}

export interface StationMetrics {
  stationName: string;
  efficiency: number;
  avgDelay: number;
  onTimePercentage: number;
  dailyPassengers: number;
  peakHours: string[];
  congestionLevel: 'low' | 'medium' | 'high';
}

export interface SchedulePrediction {
  trainId: string;
  predictedArrival: string;
  confidence: number;
  factors: string[];
}

export interface Alert {
  id: string;
  type: 'medical' | 'technical' | 'security' | 'weather' | 'delay';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  station: string;
  nextStation?: string;
  trainId?: string;
  section: SystemSection;
  timestamp: string; // ISO date string
  resolved: boolean;
  journeyContinued?: boolean;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionCode: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'storm' | 'fog';
  visibility: number;
  pressure: number;
  uvIndex: number;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  conditionCode: string;
}

export interface JourneyPlan {
  from: string;
  to: string;
  section: SystemSection;
  legs: JourneyLeg[];
  totalDuration: number; // minutes
  transfers: number;
}

export interface JourneyLeg {
  from: string;
  to: string;
  line: string;
  lineId: string;
  lineColor: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // minutes
  stops: number;
}

// JWT payload shape
export interface JwtPayload {
  sub: string;
  role: UserRole;
  employeeId?: string;
  username?: string;
  iat?: number;
  exp?: number;
}
