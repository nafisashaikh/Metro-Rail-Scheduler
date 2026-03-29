/**
 * Data barrel — export all static data from a single entry point.
 * Import: import { mumbaiMetroLines, seedAlerts, mumbaiWeather } from '../data';
 */
export { mumbaiMetroLines, generateTrainsForStation, getStationMetrics } from './metroData';
export {
  maharashtraRailwayLines,
  generateRailwayTrains,
  getRailwayStationMetrics,
} from './railwayData';
export { mumbaiWeather, thaneWeather } from './weatherData';
export { seedAlerts } from './alertsData';
