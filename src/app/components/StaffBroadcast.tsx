import { useState } from 'react';
import { Megaphone, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SystemSection, Alert } from '../types/metro';

interface StaffBroadcastProps {
  onBroadcast: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => void;
  section: SystemSection;
}

export function StaffBroadcast({ onBroadcast, section }: StaffBroadcastProps) {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Alert['severity']>('info');
  const [type] = useState<Alert['type']>('technical');
  const [station, setStation] = useState('System-wide');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    
    onBroadcast({
        type,
        severity,
        title: severity === 'critical' ? 'EMERGENCY BROADCAST' : 'Service Update',
        message: message.trim(),
        station,
        section
    });

    setMessage('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Broadcast Station</h3>
      </div>

      <div className="space-y-4">
        <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Message Content</label>
            <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the announcement for all passengers..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Severity</label>
                <div className="flex gap-2">
                    {(['info', 'warning', 'critical'] as const).map(s => (
                        <button 
                            key={s}
                            onClick={() => setSeverity(s)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                severity === s 
                                    ? 'bg-blue-600 border-transparent text-white' 
                                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                            }`}
                        >
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Affected Area</label>
                <input 
                    type="text"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold outline-none"
                />
            </div>
        </div>

        <button 
            onClick={handleSend}
            disabled={!message.trim() || sent}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                sent 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
            }`}
        >
            {sent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {sent ? 'Broadcast Sent!' : 'Send Broadcast'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-[10px] text-amber-800 dark:text-amber-400 italic">
            <strong>Warning:</strong> Broadcasts are live and visible to all active passengers across the {section} section.
          </p>
      </div>
    </div>
  );
}
