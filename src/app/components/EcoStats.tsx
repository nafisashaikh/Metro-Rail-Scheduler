import { Leaf, TrendingUp, Zap, Wind } from 'lucide-react';

export function EcoStats() {
  // Mock data for carbon savings
  const stats = {
    carbonSaved: 12.4, // in kg
    treesSaved: 2,
    energySaved: 45, // in kWh
    points: 1240
  };

  return (
    <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
                <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Eco Dashboard</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Your Carbon Footprint Impact</p>
            </div>
        </div>
        <div className="px-3 py-1 bg-white/50 dark:bg-emerald-900/20 backdrop-blur-sm rounded-full border border-emerald-100 dark:border-emerald-800 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{stats.points} pts</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.carbonSaved}</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-bold">CO2 Saved (kg)</p>
            <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: '65%' }}
                />
            </div>
        </div>
        <div className="text-center border-x border-slate-200 dark:border-slate-800 px-3">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.treesSaved}</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-bold">Trees planted</p>
            <div className="flex justify-center mt-2">
                <Wind className="w-4 h-4 text-teal-400 animate-pulse" />
            </div>
        </div>
        <div className="text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.energySaved}</p>
            <p className="text-[9px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-bold">Energy (kWh)</p>
            <p className="text-[10px] text-emerald-500 mt-2 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
            </p>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-emerald-50/50 dark:border-emerald-900/10">
        <p className="text-[10px] text-slate-600 dark:text-slate-400 text-center italic">
            "By choosing Metro over a car today, you've saved as much CO2 as two fully grown Mangrove trees absorb in a month!"
        </p>
      </div>
    </div>
  );
}
