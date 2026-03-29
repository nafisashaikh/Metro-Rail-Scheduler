import { Brain, TrendingUp } from 'lucide-react';

interface PredictiveSchedulingProps {
  predictedTime: string;
  scheduledTime: string;
  confidence: number;
  factors: string[];
}

function calcDelay(scheduled: string, predicted: string): number {
  const [sh, sm] = scheduled.split(':').map(Number);
  const [ph, pm] = predicted.split(':').map(Number);
  return Math.max(0, ph * 60 + pm - (sh * 60 + sm));
}

export function PredictiveScheduling({
  predictedTime,
  scheduledTime,
  confidence,
  factors,
}: PredictiveSchedulingProps) {
  const delay = calcDelay(scheduledTime, predictedTime);

  const confStyle =
    confidence >= 85
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : confidence >= 70
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>
          AI Prediction
        </span>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">SCHEDULED</p>
          <p className="text-2xl text-slate-700 dark:text-slate-200" style={{ fontWeight: 700 }}>
            {scheduledTime}
          </p>
        </div>
        <div className="rounded-lg bg-white/70 dark:bg-slate-800/70 border border-purple-200 dark:border-purple-700 p-3">
          <p className="text-[10px] text-purple-600 dark:text-purple-400 mb-1">PREDICTED</p>
          <p className="text-2xl text-purple-600 dark:text-purple-400" style={{ fontWeight: 700 }}>
            {predictedTime}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <TrendingUp className="w-3.5 h-3.5" />
          Confidence
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${confStyle}`}
          style={{ fontWeight: 600 }}
        >
          {confidence}%
        </span>
      </div>

      {/* Delay */}
      {delay > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-3">
          <p className="text-xs text-amber-800 dark:text-amber-400" style={{ fontWeight: 600 }}>
            Expected delay: +{delay} minutes
          </p>
        </div>
      )}

      {/* Factors */}
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2" style={{ fontWeight: 600 }}>
          Prediction Factors
        </p>
        <div className="space-y-1">
          {factors.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-2">
        Based on historical data, real-time conditions & train health
      </p>
    </div>
  );
}
