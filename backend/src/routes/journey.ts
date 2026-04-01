import { Router } from 'express';
import { allLines } from '../data/lines.js';
import { generateDepartureTimes } from '../data/generators.js';
import type { JourneyPlan, JourneyLeg, MetroLine } from '../types/index.js';

const router = Router();

// GET /api/journey/plan?from=X&to=Y&section=metro|railway
router.get('/plan', (req, res) => {
  const { from, to, section } = req.query as {
    from?: string;
    to?: string;
    section?: 'metro' | 'railway';
  };

  if (!from || !to) {
    res.status(400).json({ error: 'from and to query params are required' });
    return;
  }

  const sectionFilter = section ?? 'metro';
  const relevantLines = allLines.filter((l) => l.section === sectionFilter);

  // Try direct journey (same line)
  const directPlan = findDirectJourney(from, to, relevantLines);
  if (directPlan) {
    res.json(directPlan);
    return;
  }

  // Try one-transfer journey
  const transferPlan = findOneTransferJourney(from, to, relevantLines);
  if (transferPlan) {
    res.json(transferPlan);
    return;
  }

  res.status(404).json({
    error: 'No route found between the specified stations in this section',
    from,
    to,
    section: sectionFilter,
  });
});

function minutesToTime(baseMinutes: number): string {
  const h = Math.floor(baseMinutes / 60) % 24;
  const m = baseMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getNextDeparture(times: string[], fromMinutes: number): string {
  for (const t of times) {
    const [h, m] = t.split(':').map(Number);
    if (h * 60 + m >= fromMinutes) return t;
  }
  return times[0] ?? '05:00';
}

function buildLeg(
  from: string,
  to: string,
  line: MetroLine,
  departureTimeStr: string,
  stops: number,
): JourneyLeg {
  const avgMinutesPerStop = line.networkType === 'metro' ? 3 : 5;
  const duration = stops * avgMinutesPerStop;
  const [dh, dm] = departureTimeStr.split(':').map(Number);
  const arrivalTotal = dh * 60 + dm + duration;
  return {
    from,
    to,
    line: line.name,
    lineId: line.id,
    lineColor: line.color,
    departureTime: departureTimeStr,
    arrivalTime: minutesToTime(arrivalTotal),
    duration,
    stops,
  };
}

function findDirectJourney(
  from: string,
  to: string,
  lines: MetroLine[],
): JourneyPlan | null {
  for (const line of lines) {
    const fromIdx = line.stations.indexOf(from);
    const toIdx = line.stations.indexOf(to);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) continue;

    const interval = line.networkType === 'metro' ? 8 : 10;
    const times = generateDepartureTimes(interval);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const departure = getNextDeparture(times, nowMinutes);
    const stops = Math.abs(toIdx - fromIdx);

    const leg = buildLeg(from, to, line, departure, stops);
    return {
      from,
      to,
      section: line.section,
      legs: [leg],
      totalDuration: leg.duration,
      transfers: 0,
    };
  }
  return null;
}

function findOneTransferJourney(
  from: string,
  to: string,
  lines: MetroLine[],
): JourneyPlan | null {
  for (const lineA of lines) {
    const fromIdx = lineA.stations.indexOf(from);
    if (fromIdx === -1) continue;

    for (const lineB of lines) {
      if (lineA.id === lineB.id) continue;
      const toIdx = lineB.stations.indexOf(to);
      if (toIdx === -1) continue;

      // Find a transfer station (common station between lineA and lineB)
      const transferStation = lineA.stations.find((s) => lineB.stations.includes(s));
      if (!transferStation) continue;

      const transferIdxA = lineA.stations.indexOf(transferStation);
      const transferIdxB = lineB.stations.indexOf(transferStation);
      if (transferIdxA === -1 || transferIdxB === -1) continue;

      const interval = lineA.networkType === 'metro' ? 8 : 10;
      const intervalB = lineB.networkType === 'metro' ? 8 : 10;
      const times = generateDepartureTimes(interval);
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const dep1 = getNextDeparture(times, nowMinutes);

      const stopsA = Math.abs(transferIdxA - fromIdx);
      const legA = buildLeg(from, transferStation, lineA, dep1, stopsA);

      // Wait ~5 min at transfer, then pick next train on lineB
      const [dh, dm] = legA.arrivalTime.split(':').map(Number);
      const transferArrivalMinutes = dh * 60 + dm + 5;
      const timesB = generateDepartureTimes(intervalB);
      const dep2 = getNextDeparture(timesB, transferArrivalMinutes);

      const stopsB = Math.abs(toIdx - transferIdxB);
      const legB = buildLeg(transferStation, to, lineB, dep2, stopsB);

      const totalDuration = legA.duration + 5 + legB.duration;

      return {
        from,
        to,
        section: lineA.section,
        legs: [legA, legB],
        totalDuration,
        transfers: 1,
      };
    }
  }
  return null;
}

export default router;
