export interface ScheduleItem {
  id: string;
  line: string;
  from: string;
  to: string;
  departureTime: string;
  platform: string;
  status: 'on-time' | 'delayed' | 'arriving';
}

export const scheduleData: ScheduleItem[] = [
  {
    id: 'sch-001',
    line: 'Aqua Line',
    from: 'Ghatkopar',
    to: 'Versova',
    departureTime: '08:05',
    platform: '2',
    status: 'on-time',
  },
  {
    id: 'sch-002',
    line: 'Yellow Line',
    from: 'Dahisar East',
    to: 'Bandra Kurla Complex',
    departureTime: '08:12',
    platform: '1',
    status: 'arriving',
  },
  {
    id: 'sch-003',
    line: 'Deccan Express',
    from: 'CSMT Mumbai',
    to: 'Pune Junction',
    departureTime: '08:30',
    platform: '5',
    status: 'delayed',
  },
];
