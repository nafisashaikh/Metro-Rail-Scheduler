import express from 'express';
import { mockRealtimeService } from '../services/mock-realtime.js';
import { CrowdingSimulator } from '../services/crowding-simulator.js';

const router = express.Router();
const crowdingSimulator = new CrowdingSimulator();

// Get next arrivals for a station
router.get('/arrivals/:stationId', (req, res) => {
  try {
    const { stationId } = req.params;
    const { lineId } = req.query;
    
    const arrivals = mockRealtimeService.getNextArrivals(
      stationId, 
      lineId as string
    );
    
    // Enhance arrivals with crowding data
    const enhancedArrivals = arrivals.map(arrival => {
      const crowdingData = crowdingSimulator.calculateCrowding(
        arrival.lineId || 'blue-line',
        stationId,
        arrival.trainId
      );
      
      return {
        ...arrival,
        crowding: crowdingData.level,
        crowdingLabel: crowdingData.label,
        crowdingConfidence: crowdingData.confidence,
        crowdingSuggestion: crowdingData.suggestion,
        historicalPattern: crowdingData.historicalPattern
      };
    });
    
    res.json({
      stationId,
      arrivals: enhancedArrivals,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch arrivals' });
  }
});

// Get service alerts
router.get('/alerts', (req, res) => {
  try {
    const alerts = mockRealtimeService.getServiceAlerts();
    
    res.json({
      alerts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get train status for a specific route
router.post('/route-status', (req, res) => {
  try {
    const { fromStationId, toStationId, lineId } = req.body;
    
    const fromArrivals = mockRealtimeService.getNextArrivals(fromStationId, lineId);
    const alerts = mockRealtimeService.getServiceAlerts()
      .filter(alert => !lineId || alert.affectedLines.includes(lineId));
    
    res.json({
      fromStation: fromStationId,
      toStation: toStationId,
      nextTrains: fromArrivals,
      alerts,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route status' });
  }
});

export { router as realtimeRouter };

// Get crowding predictions for next few trains  
router.get('/crowding/:stationId', (req, res) => {
  try {
    const { stationId } = req.params;
    const { lineId } = req.query;
    
    // Get next few train IDs from mock service
    const nextArrivals = mockRealtimeService.getNextArrivals(stationId, lineId as string);
    const trainIds = nextArrivals.slice(0, 3).map(a => a.trainId);
    
    const predictions = crowdingSimulator.getPredictedCrowding(
      lineId as string || 'blue-line',
      stationId,
      trainIds
    );
    
    const stationInsights = crowdingSimulator.getStationInsights(stationId);
    
    res.json({
      stationId,
      lineId,
      predictions: predictions.map((pred: any, index: number) => ({
        trainId: trainIds[index],
        ...pred,
        arrivalTime: nextArrivals[index]?.arrivalTime
      })),
      stationInsights,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crowding data' });
  }
});