import { Alert } from '../types/metro';

/**
 * Seed alerts - pre-populated incidents used to initialise the app on startup.
 * New alerts auto-generated at runtime (see App.tsx) are merged on top of this list.
 */
export const seedAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'medical',
    severity: 'critical',
    title: 'Medical Emergency',
    message:
      'Passenger collapsed on Train MM90003 between Dadar and Shitaladevi. Train continuing to next station for medical assistance.',
    station: 'Dadar',
    nextStation: 'Shitaladevi',
    trainId: 'MM90003',
    section: 'metro',
    timestamp: new Date(Date.now() - 8 * 60000),
    resolved: false,
    journeyContinued: true,
  },
  {
    id: 'a2',
    type: 'technical',
    severity: 'warning',
    title: 'Signal Failure',
    message:
      'Signal malfunction reported at Andheri station. Manual signalling in operation. Expect delays of 5–10 min.',
    station: 'Andheri',
    section: 'metro',
    timestamp: new Date(Date.now() - 22 * 60000),
    resolved: false,
  },
  {
    id: 'a3',
    type: 'delay',
    severity: 'warning',
    title: 'Service Delay',
    message: 'Train WR90012 running 12 minutes late due to track maintenance at Mumbai Central.',
    station: 'Mumbai Central',
    trainId: 'WR90012',
    section: 'railway',
    timestamp: new Date(Date.now() - 35 * 60000),
    resolved: false,
  },
  {
    id: 'a4',
    type: 'weather',
    severity: 'info',
    title: 'Weather Advisory',
    message:
      'Light rain expected in Mumbai by 18:00. Slight delays possible on elevated sections of Metro Line 1 & 2A.',
    station: 'All Stations',
    section: 'metro',
    timestamp: new Date(Date.now() - 60 * 60000),
    resolved: false,
  },
  {
    id: 'a5',
    type: 'security',
    severity: 'warning',
    title: 'Security Alert',
    message:
      'Unattended baggage reported at Dadar (CR). RPF team dispatched. Platform 3 temporarily cordoned.',
    station: 'Dadar',
    section: 'railway',
    timestamp: new Date(Date.now() - 90 * 60000),
    resolved: false,
  },
  {
    id: 'a6',
    type: 'medical',
    severity: 'critical',
    title: 'Medical Emergency',
    message:
      'Elderly passenger suffered cardiac arrest on Train CR90008 near Kurla. Train continuing to Ghatkopar — medical team alerted.',
    station: 'Kurla',
    nextStation: 'Ghatkopar',
    trainId: 'CR90008',
    section: 'railway',
    timestamp: new Date(Date.now() - 3 * 60000),
    resolved: false,
    journeyContinued: true,
  },
  {
    id: 'a7',
    type: 'technical',
    severity: 'info',
    title: 'AC System Fault',
    message:
      'AC malfunction on coaches 3 & 4 of Train WR91005. Maintenance scheduled at Borivali depot.',
    station: 'Borivali',
    trainId: 'WR91005',
    section: 'railway',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    resolved: true,
  },
];
