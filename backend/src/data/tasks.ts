export interface ShiftTask {
  id: string;
  title: string;
  station: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  time: string;
}

let tasks: ShiftTask[] = [
  { id: '1', title: 'Inspect escalator sensors', station: 'Andheri', priority: 'high', status: 'pending', time: '14:30' },
  { id: '2', title: 'Replenish card ticket rolls', station: 'Ghatkopar', priority: 'medium', status: 'completed', time: '11:00' },
  { id: '3', title: 'Review CCTV at platform 2', station: 'Versova', priority: 'low', status: 'pending', time: '16:00' },
  { id: '4', title: 'Staff shift handover', station: 'System-wide', priority: 'medium', status: 'pending', time: '15:00' },
];

export function getTasks(): ShiftTask[] {
  return [...tasks];
}

export function addTask(task: Omit<ShiftTask, 'id'>): ShiftTask {
  const newTask: ShiftTask = { ...task, id: Math.random().toString(36).substring(2, 9) };
  tasks.push(newTask);
  return newTask;
}

export function updateTask(id: string, updates: Partial<ShiftTask>): ShiftTask | undefined {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return undefined;
  tasks[idx] = { ...tasks[idx], ...updates };
  return tasks[idx];
}

export function deleteTask(id: string): boolean {
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  return tasks.length < initialLength;
}
