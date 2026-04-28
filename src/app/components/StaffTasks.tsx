import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { fetchTasks, toggleTaskStatus, createTask, Task } from '../services/tasks';

export function StaffTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStation, setNewTaskStation] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks().then(data => {
      setTasks(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (task: Task) => {
    try {
      const updated = await toggleTaskStatus(task.id, task.status);
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskStation) return;
    try {
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const created = await createTask({
        title: newTaskTitle,
        station: newTaskStation,
        priority: newTaskPriority,
        status: 'pending',
        time
      });
      setTasks([...tasks, created]);
      setIsAdding(false);
      setNewTaskTitle('');
      setNewTaskStation('');
      setNewTaskPriority('medium');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Operations Checklist</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <input 
            type="text" 
            placeholder="Task Title" 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            required
          />
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Station" 
              value={newTaskStation}
              onChange={e => setNewTaskStation(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              required
            />
            <select 
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value as 'low'|'medium'|'high')}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Add Task
          </button>
        </form>
      )}

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-4">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No tasks pending.</p>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-3 rounded-xl border transition-all ${
                  task.status === 'completed' 
                      ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 opacity-60' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <button onClick={() => handleToggle(task)} className="mt-0.5 text-blue-500 hover:scale-110 transition-transform">
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
          ))
        )}
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
