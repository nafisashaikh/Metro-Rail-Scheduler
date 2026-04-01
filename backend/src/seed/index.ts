import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/database.js';
import { allLines } from '../data/lines.js';

async function seed(): Promise<void> {
  const db = getDb();

  console.log('🌱 Seeding database...');

  // ─── Staff Users ─────────────────────────────────────────────────────────────
  const staffUsers = [
    {
      id: 'staff-1',
      name: 'Rajesh Sharma',
      role: 'admin',
      employee_id: 'MRS-A-001',
      department: 'Administration',
      password: 'admin123',
    },
    {
      id: 'staff-2',
      name: 'Priya Mehta',
      role: 'supervisor',
      employee_id: 'MRS-S-042',
      department: 'Operations',
      password: 'super123',
    },
    {
      id: 'staff-3',
      name: 'Arjun Patil',
      role: 'employee',
      employee_id: 'MRS-E-187',
      department: 'Station Management',
      password: 'emp123',
    },
  ];

  const insertStaff = db.prepare(`
    INSERT OR REPLACE INTO staff_users (id, name, role, employee_id, department, password_hash)
    VALUES (@id, @name, @role, @employee_id, @department, @password_hash)
  `);

  for (const user of staffUsers) {
    const password_hash = await bcrypt.hash(user.password, 10);
    insertStaff.run({
      id: user.id,
      name: user.name,
      role: user.role,
      employee_id: user.employee_id,
      department: user.department,
      password_hash,
    });
  }
  console.log(`  ✓ ${staffUsers.length} staff users`);

  // ─── Passenger Users ──────────────────────────────────────────────────────────
  const passengers = [
    {
      id: 'pass-1',
      name: 'Ravi Kumar',
      username: 'user001',
      card_number: 'MPC-7842',
      password: 'pass123',
    },
    {
      id: 'pass-2',
      name: 'Sunita Desai',
      username: 'user002',
      card_number: 'MPC-3391',
      password: 'metro2024',
    },
  ];

  const insertPassenger = db.prepare(`
    INSERT OR REPLACE INTO passengers (id, name, username, card_number, password_hash)
    VALUES (@id, @name, @username, @card_number, @password_hash)
  `);

  for (const p of passengers) {
    const password_hash = await bcrypt.hash(p.password, 10);
    insertPassenger.run({
      id: p.id,
      name: p.name,
      username: p.username,
      card_number: p.card_number,
      password_hash,
    });
  }
  console.log(`  ✓ ${passengers.length} passengers`);

  // ─── Lines & Stations ─────────────────────────────────────────────────────────
  const insertLine = db.prepare(`
    INSERT OR REPLACE INTO lines
      (id, name, color, network_type, operational_status, total_length, description, section)
    VALUES
      (@id, @name, @color, @network_type, @operational_status, @total_length, @description, @section)
  `);

  const insertStation = db.prepare(`
    INSERT OR REPLACE INTO stations (line_id, name, lat, lng, station_order)
    VALUES (@line_id, @name, @lat, @lng, @station_order)
  `);

  db.prepare('DELETE FROM stations').run();
  db.prepare('DELETE FROM lines').run();

  for (const line of allLines) {
    insertLine.run({
      id: line.id,
      name: line.name,
      color: line.color,
      network_type: line.networkType,
      operational_status: line.operationalStatus,
      total_length: line.totalLength ?? null,
      description: line.description ?? null,
      section: line.section,
    });

    for (let i = 0; i < line.stationCoords.length; i++) {
      const coord = line.stationCoords[i];
      insertStation.run({
        line_id: line.id,
        name: coord.name,
        lat: coord.lat,
        lng: coord.lng,
        station_order: i,
      });
    }
  }
  console.log(`  ✓ ${allLines.length} lines with stations`);

  // ─── Seed Alerts ─────────────────────────────────────────────────────────────
  const seedAlerts = [
    {
      id: 'a1',
      type: 'medical',
      severity: 'critical',
      title: 'Medical Emergency',
      message: 'Passenger collapsed on Train MM90003 between Dadar and Shitaladevi. Train continuing to next station for medical assistance.',
      station: 'Dadar',
      next_station: 'Shitaladevi',
      train_id: 'MM90003',
      section: 'metro',
      timestamp: Date.now() - 8 * 60000,
      resolved: 0,
      journey_continued: 1,
    },
    {
      id: 'a2',
      type: 'technical',
      severity: 'warning',
      title: 'Signal Failure',
      message: 'Signal malfunction reported at Andheri station. Manual signalling in operation. Expect delays of 5–10 min.',
      station: 'Andheri',
      next_station: null,
      train_id: null,
      section: 'metro',
      timestamp: Date.now() - 22 * 60000,
      resolved: 0,
      journey_continued: null,
    },
    {
      id: 'a3',
      type: 'delay',
      severity: 'warning',
      title: 'Service Delay',
      message: 'Train WR90012 running 12 minutes late due to track maintenance at Mumbai Central.',
      station: 'Mumbai Central',
      next_station: null,
      train_id: 'WR90012',
      section: 'railway',
      timestamp: Date.now() - 35 * 60000,
      resolved: 0,
      journey_continued: null,
    },
    {
      id: 'a4',
      type: 'weather',
      severity: 'info',
      title: 'Weather Advisory',
      message: 'Light rain expected in Mumbai by 18:00. Slight delays possible on elevated sections of Metro Line 1 & 2A.',
      station: 'All Stations',
      next_station: null,
      train_id: null,
      section: 'metro',
      timestamp: Date.now() - 60 * 60000,
      resolved: 0,
      journey_continued: null,
    },
    {
      id: 'a5',
      type: 'security',
      severity: 'warning',
      title: 'Security Alert',
      message: 'Unattended baggage reported at Dadar (CR). RPF team dispatched. Platform 3 temporarily cordoned.',
      station: 'Dadar',
      next_station: null,
      train_id: null,
      section: 'railway',
      timestamp: Date.now() - 90 * 60000,
      resolved: 0,
      journey_continued: null,
    },
    {
      id: 'a6',
      type: 'medical',
      severity: 'critical',
      title: 'Medical Emergency',
      message: 'Elderly passenger suffered cardiac arrest on Train CR90008 near Kurla. Train continuing to Ghatkopar — medical team alerted.',
      station: 'Kurla',
      next_station: 'Ghatkopar',
      train_id: 'CR90008',
      section: 'railway',
      timestamp: Date.now() - 3 * 60000,
      resolved: 0,
      journey_continued: 1,
    },
    {
      id: 'a7',
      type: 'technical',
      severity: 'info',
      title: 'AC System Fault',
      message: 'AC malfunction on coaches 3 & 4 of Train WR91005. Maintenance scheduled at Borivali depot.',
      station: 'Borivali',
      next_station: null,
      train_id: 'WR91005',
      section: 'railway',
      timestamp: Date.now() - 2 * 60 * 60000,
      resolved: 1,
      journey_continued: null,
    },
  ];

  const insertAlert = db.prepare(`
    INSERT OR REPLACE INTO alerts
      (id, type, severity, title, message, station, next_station, train_id, section, timestamp, resolved, journey_continued)
    VALUES
      (@id, @type, @severity, @title, @message, @station, @next_station, @train_id, @section, @timestamp, @resolved, @journey_continued)
  `);

  db.prepare('DELETE FROM alerts').run();
  for (const alert of seedAlerts) {
    insertAlert.run(alert);
  }
  console.log(`  ✓ ${seedAlerts.length} seed alerts`);

  console.log('✅ Database seeded successfully');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
