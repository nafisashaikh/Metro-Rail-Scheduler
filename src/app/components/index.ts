/**
 * Top-level components barrel.
 *
 * Sub-folder barrels are provided for feature-domain grouping:
 *   - auth/        Portal selector, staff login, passenger login
 *   - dashboard/   Headers, schedule, health, alerts, maps, analytics widgets
 *   - passenger/   Journey planner, medical guide
 *   - shared/      Generic reusable primitives
 *   - ui/          Radix-based shadcn/ui primitives
 *
 * You can import directly from the sub-folder barrel:
 *   import { LoginPage } from '@/app/components/auth';
 *
 * Or from this top-level barrel for convenience:
 *   import { LoginPage, DashboardSection } from '@/app/components';
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
export { PortalSelector } from './PortalSelector';
export { LoginPage } from './LoginPage';
export { PassengerLoginPage } from './PassengerLoginPage';
export { PassengerSignupPage } from './PassengerSignupPage';

// ── Layout / Navigation ───────────────────────────────────────────────────────
export { Header, PassengerHeader } from './Header';
export { AnnouncementTicker } from './AnnouncementTicker';
export { AdminPortal } from './AdminPortal';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export { DashboardSection } from './DashboardSection';
export { AlertPanel } from './AlertPanel';
export { ScheduleDisplay } from './ScheduleDisplay';
export { TrainHealthCard } from './TrainHealthCard';
export { StationEfficiencyCard } from './StationEfficiencyCard';
export { CapacityVisualization } from './CapacityVisualization';
export { MetroLineSelector } from './MetroLineSelector';
export { StationSelector } from './StationSelector';
export { RouteMap } from './RouteMap';
export { RouteMapVisualization } from './RouteMapVisualization';
export { SatelliteMap } from './SatelliteMap';
export { WeatherWidget } from './WeatherWidget';
export { PredictiveScheduling } from './PredictiveScheduling';

// ── Passenger ─────────────────────────────────────────────────────────────────
export { PassengerJourneyPlanner } from './PassengerJourneyPlanner';
export { MedicalPrescription } from './MedicalPrescription';
export { PassengerPass } from './PassengerPass';
export { AiHelpDesk } from './AiHelpDesk';
export { StationBlueprint } from './StationBlueprint';
export { EcoStats } from './EcoStats';
export { StaffTasks } from './StaffTasks';
export { StaffBroadcast } from './StaffBroadcast';
