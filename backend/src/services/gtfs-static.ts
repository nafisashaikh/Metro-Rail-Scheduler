import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface GtfsStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  stop_code?: string;
  location_type?: number;
  parent_station?: string;
}

interface GtfsRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  route_color?: string;
  agency_id: string;
}

interface GtfsTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  direction_id: number;
  shape_id?: string;
}

interface GtfsStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
  pickup_type?: number;
  drop_off_type?: number;
}

class GtfsStaticService {
  private stops = new Map<string, GtfsStop>();
  private routes = new Map<string, GtfsRoute>();
  private trips = new Map<string, GtfsTrip>();
  private stopTimes = new Map<string, GtfsStopTime[]>(); // trip_id -> stop_times
  private gtfsDir = '';

  constructor(gtfsDirectory?: string) {
    this.gtfsDir = gtfsDirectory || path.join(__dirname, '../data/gtfs');
    this.loadGtfsData();
  }

  private loadGtfsData(): void {
    try {
      this.loadStops();
      this.loadRoutes();
      this.loadTrips();
      this.loadStopTimes();
      console.log('GTFS static data loaded successfully');
    } catch (error) {
      console.warn('GTFS static data not found, using fallback data:', (error as Error).message);
      this.loadFallbackData();
    }
  }

  private loadStops(): void {
    const stopsFile = path.join(this.gtfsDir, 'stops.txt');
    if (!fs.existsSync(stopsFile)) return;

    const content = fs.readFileSync(stopsFile, 'utf-8');
    const records = csv.parse(content, { columns: true, skip_empty_lines: true });
    
    for (const record of records) {
      this.stops.set(record.stop_id, {
        stop_id: record.stop_id,
        stop_name: record.stop_name,
        stop_lat: parseFloat(record.stop_lat),
        stop_lon: parseFloat(record.stop_lon),
        stop_code: record.stop_code,
        location_type: parseInt(record.location_type || '0'),
        parent_station: record.parent_station
      });
    }
  }

  private loadRoutes(): void {
    const routesFile = path.join(this.gtfsDir, 'routes.txt');
    if (!fs.existsSync(routesFile)) return;

    const content = fs.readFileSync(routesFile, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true });
    
    for (const record of records) {
      this.routes.set(record.route_id, {
        route_id: record.route_id,
        route_short_name: record.route_short_name,
        route_long_name: record.route_long_name,
        route_type: parseInt(record.route_type),
        route_color: record.route_color,
        agency_id: record.agency_id
      });
    }
  }

  private loadTrips(): void {
    const tripsFile = path.join(this.gtfsDir, 'trips.txt');
    if (!fs.existsSync(tripsFile)) return;

    const content = fs.readFileSync(tripsFile, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true });
    
    for (const record of records) {
      this.trips.set(record.trip_id, {
        route_id: record.route_id,
        service_id: record.service_id,
        trip_id: record.trip_id,
        trip_headsign: record.trip_headsign,
        direction_id: parseInt(record.direction_id || '0'),
        shape_id: record.shape_id
      });
    }
  }

  private loadStopTimes(): void {
    const stopTimesFile = path.join(this.gtfsDir, 'stop_times.txt');
    if (!fs.existsSync(stopTimesFile)) return;

    const content = fs.readFileSync(stopTimesFile, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true });
    
    for (const record of records) {
      const tripId = record.trip_id;
      if (!this.stopTimes.has(tripId)) {
        this.stopTimes.set(tripId, []);
      }
      
      this.stopTimes.get(tripId)!.push({
        trip_id: record.trip_id,
        arrival_time: record.arrival_time,
        departure_time: record.departure_time,
        stop_id: record.stop_id,
        stop_sequence: parseInt(record.stop_sequence),
        pickup_type: parseInt(record.pickup_type || '0'),
        drop_off_type: parseInt(record.drop_off_type || '0')
      });
    }

    // Sort stop times by sequence for each trip
    for (const [tripId, stopTimes] of this.stopTimes) {
      stopTimes.sort((a, b) => a.stop_sequence - b.stop_sequence);
    }
  }

  private loadFallbackData(): void {
    // Mumbai Metro Line 1 (Versova-Andheri-Ghatkopar) sample data
    const mumbaiStops = [
      { stop_id: 'versova', stop_name: 'Versova', stop_lat: 19.1297, stop_lon: 72.8089 },
      { stop_id: 'dn_nagar', stop_name: 'D.N. Nagar', stop_lat: 19.1377, stop_lon: 72.8266 },
      { stop_id: 'azad_nagar', stop_name: 'Azad Nagar', stop_lat: 19.1433, stop_lon: 72.8383 },
      { stop_id: 'andheri', stop_name: 'Andheri', stop_lat: 19.1197, stop_lon: 72.8451 },
      { stop_id: 'western_express', stop_name: 'Western Express Highway', stop_lat: 19.1089, stop_lon: 72.8668 },
      { stop_id: 'chakala', stop_name: 'Chakala', stop_lat: 19.1104, stop_lon: 72.8707 },
      { stop_id: 'airport_road', stop_name: 'Airport Road', stop_lat: 19.0928, stop_lon: 72.8684 },
      { stop_id: 'marol_naka', stop_name: 'Marol Naka', stop_lat: 19.1081, stop_lon: 72.8810 },
      { stop_id: 'saki_naka', stop_name: 'Saki Naka', stop_lat: 19.1065, stop_lon: 72.8909 },
      { stop_id: 'asalpha', stop_name: 'Asalpha', stop_lat: 19.0886, stop_lon: 72.9053 },
      { stop_id: 'jagruti_nagar', stop_name: 'Jagruti Nagar', stop_lat: 19.0821, stop_lon: 72.9116 },
      { stop_id: 'ghatkopar', stop_name: 'Ghatkopar', stop_lat: 19.0865, stop_lon: 72.9081 }
    ];

    for (const stop of mumbaiStops) {
      this.stops.set(stop.stop_id, {
        ...stop,
        stop_lat: stop.stop_lat,
        stop_lon: stop.stop_lon
      });
    }

    // Sample routes
    this.routes.set('blue_line', {
      route_id: 'blue_line',
      route_short_name: 'Blue',
      route_long_name: 'Versova - Andheri - Ghatkopar Line',
      route_type: 1, // Metro
      route_color: '0066CC',
      agency_id: 'mumbai_metro'
    });

    this.routes.set('red_line', {
      route_id: 'red_line', 
      route_short_name: 'Red',
      route_long_name: 'Andheri East - Dahisar East Line',
      route_type: 1,
      route_color: 'CC0000',
      agency_id: 'mumbai_metro'
    });

    // Sample trips
    this.trips.set('blue_line_trip_1', {
      route_id: 'blue_line',
      service_id: 'weekday',
      trip_id: 'blue_line_trip_1',
      trip_headsign: 'Ghatkopar',
      direction_id: 0
    });

    console.log('Fallback GTFS data loaded');
  }

  getStop(stopId: string): GtfsStop | undefined {
    return this.stops.get(stopId);
  }

  getStopsNear(lat: number, lon: number, radiusKm: number = 2): GtfsStop[] {
    const nearbyStops: GtfsStop[] = [];
    
    for (const stop of this.stops.values()) {
      const distance = this.calculateDistance(lat, lon, stop.stop_lat, stop.stop_lon);
      if (distance <= radiusKm) {
        nearbyStops.push(stop);
      }
    }
    
    return nearbyStops.sort((a, b) => {
      const distA = this.calculateDistance(lat, lon, a.stop_lat, a.stop_lon);
      const distB = this.calculateDistance(lat, lon, b.stop_lat, b.stop_lon);
      return distA - distB;
    });
  }

  getRoute(routeId: string): GtfsRoute | undefined {
    return this.routes.get(routeId);
  }

  getAllRoutes(): GtfsRoute[] {
    return Array.from(this.routes.values());
  }

  getStopsForRoute(routeId: string): GtfsStop[] {
    const routeStops: GtfsStop[] = [];
    
    // Find trips for this route
    for (const trip of this.trips.values()) {
      if (trip.route_id === routeId) {
        const stopTimes = this.stopTimes.get(trip.trip_id);
        if (stopTimes) {
          for (const stopTime of stopTimes) {
            const stop = this.stops.get(stopTime.stop_id);
            if (stop && !routeStops.find(s => s.stop_id === stop.stop_id)) {
              routeStops.push(stop);
            }
          }
        }
      }
    }
    
    return routeStops;
  }

  getTripsForRoute(routeId: string): GtfsTrip[] {
    return Array.from(this.trips.values()).filter(trip => trip.route_id === routeId);
  }

  getStopTimesForTrip(tripId: string): GtfsStopTime[] {
    return this.stopTimes.get(tripId) || [];
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getNextScheduledArrivals(stopId: string, limit: number = 3): any[] {
    const arrivals: any[] = [];
    const now = new Date();
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0') + ':' +
                          now.getSeconds().toString().padStart(2, '0');
    
    // Find all trips that serve this stop
    for (const [tripId, stopTimes] of this.stopTimes) {
      const stopTime = stopTimes.find(st => st.stop_id === stopId);
      if (stopTime && stopTime.arrival_time > currentTimeStr) {
        const trip = this.trips.get(tripId);
        const route = trip ? this.routes.get(trip.route_id) : undefined;
        
        if (trip && route) {
          arrivals.push({
            tripId,
            routeId: trip.route_id,
            routeName: route.route_short_name,
            destination: trip.trip_headsign,
            scheduledTime: stopTime.arrival_time,
            arrivalTime: this.parseTimeToTimestamp(stopTime.arrival_time),
            platform: '1', // Default
            type: 'scheduled'
          });
        }
      }
    }
    
    return arrivals
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .slice(0, limit);
  }

  private parseTimeToTimestamp(timeStr: string): number {
    const [hours, minutes, seconds] = timeStr.split(':').map(n => parseInt(n));
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
    
    // If the time is in the past, assume it's for tomorrow
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return targetTime.getTime();
  }
}

export { GtfsStaticService, GtfsStop, GtfsRoute, GtfsTrip, GtfsStopTime };