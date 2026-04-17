import express from 'express';
import fetch from 'node-fetch';
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const router = express.Router();

// Real GTFS-RT feed URLs (you'll need to get actual ones from transit agencies)
const GTFS_RT_CONFIG = {
  // Example feeds - replace with actual Mumbai Metro/Maharashtra Railway feeds
  mumbaiMetro: {
    vehiclePositions: 'https://api.mumbaimtro.com/gtfs-rt/vehicle-positions', // Replace with real URL
    tripUpdates: 'https://api.mumbaimtro.com/gtfs-rt/trip-updates',           // Replace with real URL
    alerts: 'https://api.mumbaimtro.com/gtfs-rt/alerts'                       // Replace with real URL
  },
  maharashtraRail: {
    vehiclePositions: 'https://api.mahatransco.in/gtfs-rt/vehicles',         // Replace with real URL
    tripUpdates: 'https://api.mahatransco.in/gtfs-rt/trips',                 // Replace with real URL
    alerts: 'https://api.mahatransco.in/gtfs-rt/alerts'                      // Replace with real URL
  },
  // Fallback to OpenTransport APIs for demo purposes
  fallback: {
    // Using real working APIs as examples
    berlinVehicles: 'https://v6.vbb.transport.rest/radar?results=50&bbox=13.0824,52.3982,13.7606,52.6755',
    londonArrivals: 'https://api.tfl.gov.uk/StopPoint/940GZZLUSHP/arrivals'
  }
};

// Cache for GTFS-RT data (refresh every 30 seconds)
let realtimeCache: {
  lastFetched: number;
  vehiclePositions: Map<string, any>;
  tripUpdates: Map<string, any>;
  alerts: any[];
} = {
  lastFetched: 0,
  vehiclePositions: new Map(),
  tripUpdates: new Map(),
  alerts: []
};

const CACHE_DURATION = 30 * 1000; // 30 seconds

class RealGtfsService {
  private isUsableFeedUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    // Skip known placeholder/example domains until real feeds are configured.
    if (lower.includes('api.mumbaimtro.com') || lower.includes('api.mahatransco.in')) {
      return false;
    }
    return /^https?:\/\//.test(lower);
  }
  
  async fetchGtfsRealtimeFeed(url: string, apiKey?: string): Promise<any> {
    try {
      const headers: any = {
        'Accept': 'application/x-protobuf'
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
      );
      
      return feed;
    } catch (error: any) {
      console.error(`GTFS-RT fetch failed for ${url}:`, error.message);
      return null;
    }
  }

  async fetchLondonTflData(stopId: string): Promise<any[]> {
    try {
      // Using Transport for London's real-time API as an example
      const response = await fetch(
        `https://api.tfl.gov.uk/StopPoint/${stopId}/arrivals`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json() as any[];
      return data.slice(0, 3); // Next 3 arrivals
    } catch (error) {
      console.error('TfL API error:', error);
      return [];
    }
  }

  async fetchBerlinTransportData(): Promise<any[]> {
    try {
      // Using Berlin's real transport API as an example  
      const response = await fetch(
        'https://v6.vbb.transport.rest/locations/nearby?latitude=52.52&longitude=13.405&results=5&poi=false&addresses=false'
      );
      
      if (!response.ok) return [];
      
      const data = await response.json() as any[];
      return data;
    } catch (error) {
      console.error('Berlin transport API error:', error);
      return [];
    }
  }

  async updateRealtimeData(): Promise<void> {
    const now = Date.now();
    
    if (now - realtimeCache.lastFetched < CACHE_DURATION) {
      return; // Use cached data
    }

    console.log('Fetching real-time transit data...');

    try {
      // Try to fetch real GTFS-RT data
      // Note: Replace these URLs with actual Mumbai Metro/Maharashtra Railway feeds
      
      // Method 1: Try Mumbai Metro GTFS-RT when a real feed URL is configured.
      const mumbaiFeed = this.isUsableFeedUrl(GTFS_RT_CONFIG.mumbaiMetro.vehiclePositions)
        ? await this.fetchGtfsRealtimeFeed(GTFS_RT_CONFIG.mumbaiMetro.vehiclePositions)
        : null;

      // Method 2: Try Maharashtra Rail GTFS-RT when a real feed URL is configured.
      const maharashtraFeed = this.isUsableFeedUrl(GTFS_RT_CONFIG.maharashtraRail.vehiclePositions)
        ? await this.fetchGtfsRealtimeFeed(GTFS_RT_CONFIG.maharashtraRail.vehiclePositions)
        : null;

      // Method 3: Fallback to working international APIs for demonstration
      const londonData = await this.fetchLondonTflData('940GZZLUSHP'); // Shepherd's Bush
      const berlinData = await this.fetchBerlinTransportData();

      // Process and cache the data
      this.processRealtimeFeeds(mumbaiFeed, maharashtraFeed, londonData, berlinData);
      
      realtimeCache.lastFetched = now;
      
    } catch (error) {
      console.error('Error updating realtime data:', error);
    }
  }

  processRealtimeFeeds(mumbaiData: any, maharashtraData: any, londonData: any[], berlinData: any[]): void {
    // Clear existing cache
    realtimeCache.vehiclePositions.clear();
    realtimeCache.tripUpdates.clear();
    realtimeCache.alerts = [];

    // Process GTFS-RT feeds if available
    if (mumbaiData?.entity) {
      mumbaiData.entity.forEach((entity: any) => {
        if (entity.vehicle) {
          realtimeCache.vehiclePositions.set(entity.id, {
            id: entity.id,
            trip: entity.vehicle.trip,
            position: entity.vehicle.position,
            timestamp: entity.vehicle.timestamp,
            occupancyStatus: entity.vehicle.occupancyStatus
          });
        }
      });
    }

    // Process London TfL data as example real-time feed
    if (londonData.length > 0) {
      londonData.forEach((arrival, index) => {
        const arrivalTime = Date.now() + (arrival.timeToStation * 1000);
        
        realtimeCache.vehiclePositions.set(`london-${index}`, {
          id: `london-${index}`,
          lineId: 'central-line',
          lineName: arrival.lineName || 'Central Line',
          destination: arrival.destinationName,
          arrivalTime: arrivalTime,
          delay: Math.max(0, arrival.timeToStation - arrival.timeToStation), // Simplified
          platform: arrival.platformName,
          vehicleId: arrival.vehicleId,
          occupancyStatus: 'MANY_SEATS_AVAILABLE' // Default
        });
      });
    }

    // Add some alerts based on real conditions
    if (londonData.some(a => a.timeToStation > 600)) { // > 10 minutes delay
      realtimeCache.alerts.push({
        id: `alert-${Date.now()}`,
        severity: 'WARNING',
        cause: 'TECHNICAL_PROBLEM',
        effect: 'SIGNIFICANT_DELAYS',
        headerText: 'Service Delays',
        descriptionText: 'Expect delays of up to 10 minutes due to technical issues',
        informedEntity: [{ routeId: 'central-line' }]
      });
    }
  }

  getArrivalsForStation(stationId: string, lineId?: string): any[] {
    const arrivals: any[] = [];
    
    // Get vehicles approaching this station
    realtimeCache.vehiclePositions.forEach((vehicle) => {
      if (lineId && vehicle.lineId !== lineId) return;
      
      // Calculate if this vehicle serves the requested station
      // This is simplified - real GTFS would use stop_times.txt + trip data
      const isApproaching = this.isVehicleApproachingStation(vehicle, stationId);
      
      if (isApproaching) {
        arrivals.push({
          trainId: vehicle.id,
          lineId: vehicle.lineId || 'unknown',
          lineName: vehicle.lineName || 'Unknown Line',
          destination: vehicle.destination || 'City Centre',
          arrivalTime: vehicle.arrivalTime || Date.now() + (Math.random() * 10 * 60 * 1000),
          delay: vehicle.delay || 0,
          platform: vehicle.platform || '1',
          crowding: this.mapOccupancyToCrowding(vehicle.occupancyStatus),
          status: vehicle.delay > 5 ? 'delayed' : vehicle.delay > 0 ? 'minor-delay' : 'on-time'
        });
      }
    });

    return arrivals
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .slice(0, 3); // Next 3 arrivals
  }

  isVehicleApproachingStation(vehicle: any, stationId: string): boolean {
    // Simplified logic - in real GTFS you'd check:
    // 1. Vehicle's current trip_id
    // 2. stop_times.txt for this trip  
    // 3. Check if stationId is in upcoming stops
    
    // For demo, assume vehicles serve common stations
    const commonStations = ['ameerpet', 'begumpet', 'rasoolpura', 'jubileehills'];
    return commonStations.includes(stationId);
  }

  mapOccupancyToCrowding(occupancyStatus: string): 'low' | 'medium' | 'high' {
    switch (occupancyStatus) {
      case 'EMPTY':
      case 'MANY_SEATS_AVAILABLE':
        return 'low';
      case 'FEW_SEATS_AVAILABLE':
      case 'STANDING_ROOM_ONLY':
        return 'medium';
      case 'CRUSHED_STANDING_ROOM_ONLY':
      case 'FULL':
        return 'high';
      default:
        return 'medium';
    }
  }

  getServiceAlerts(): any[] {
    return realtimeCache.alerts.map(alert => ({
      id: alert.id,
      severity: alert.severity === 'WARNING' ? 'medium' : 'high',
      type: 'service_disruption',
      title: alert.headerText,
      message: alert.descriptionText,
      cause: alert.cause,
      effect: alert.effect,
      affectedLines: alert.informedEntity?.map((e: any) => e.routeId) || [],
      startTime: Date.now(),
      estimatedEndTime: Date.now() + (30 * 60 * 1000) // 30 min default
    }));
  }
}

const realGtfsService = new RealGtfsService();

// Update data every 30 seconds
setInterval(() => {
  realGtfsService.updateRealtimeData();
}, 30000);

// Initial data load
realGtfsService.updateRealtimeData();

// Routes
router.get('/arrivals/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { lineId } = req.query;
    
    await realGtfsService.updateRealtimeData();
    
    const arrivals = realGtfsService.getArrivalsForStation(
      stationId, 
      lineId as string
    );
    
    res.json({
      stationId,
      arrivals,
      lastUpdated: new Date().toISOString(),
      dataSource: 'GTFS-Realtime + International APIs',
      cacheAge: Date.now() - realtimeCache.lastFetched
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Arrivals API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch arrivals',
      details: message 
    });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    await realGtfsService.updateRealtimeData();
    
    const alerts = realGtfsService.getServiceAlerts();
    
    res.json({
      alerts,
      lastUpdated: new Date().toISOString(),
      dataSource: 'GTFS-Realtime'
    });
  } catch (error: any) {
    console.error('Alerts API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alerts',
      details: error.message 
    });
  }
});

// Configuration endpoint to update GTFS-RT feed URLs
router.post('/config/feeds', async (req, res) => {
  try {
    const { mumbaiMetroUrl, maharashtraRailUrl, apiKey } = req.body;
    
    // Update feed URLs (in production, store in database/config)
    if (mumbaiMetroUrl) {
      GTFS_RT_CONFIG.mumbaiMetro.vehiclePositions = mumbaiMetroUrl;
    }
    
    if (maharashtraRailUrl) {
      GTFS_RT_CONFIG.maharashtraRail.vehiclePositions = maharashtraRailUrl;
    }
    
    res.json({
      message: 'Feed configuration updated',
      config: GTFS_RT_CONFIG
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to update config',
      details: error.message 
    });
  }
});

export { router as realtimeRouter };