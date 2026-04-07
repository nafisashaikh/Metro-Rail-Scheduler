import { CheckCircle2, Circle, Clock, AlertCircle, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  station: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  time: string;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Inspect escalator sensors', station: 'Andheri', priority: 'high', status: 'pending', time: '14:30' },
  { id: '2', title: 'Replenish card ticket rolls', station: 'Ghatkopar', priority: 'medium', status: 'completed', time: '11:00' },
  { id: '3', title: 'Review CCTV at platform 2', station: 'Versova', priority: 'low', status: 'pending', time: '16:00' },
  { id: '4', title: 'Staff shift handover', station: 'System-wide', priority: 'medium', status: 'pending', time: '15:00' },
];

export function StaffTasks() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Operations Checklist</h3>
        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
            <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {INITIAL_TASKS.map((task) => (
          <div 
            key={task.id} 
            className={`p-3 rounded-xl border transition-all ${
                task.status === 'completed' 
                    ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 opacity-60' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <button className="mt-0.5 text-blue-500">
                {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{task.station}</span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <Clock className="w-3 h-3" /> {task.time}
                    </div>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                task.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              }`}>
                {task.priority}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl flex items-center gap-3">
         <AlertCircle className="w-4 h-4 text-blue-500 animate-pulse" />
         <p className="text-[10px] text-blue-800 dark:text-blue-300">
            <strong>System:</strong> All high-priority tasks must be verified before shift end.
         </p>
      </div>
    </div>
  );
}
