import { motion } from 'framer-motion';
import { TrendingUp, Dumbbell, Apple, Pill, Scale } from 'lucide-react';

interface AdherenceCategory {
  label: string;
  value: number;
  icon: typeof Dumbbell;
  color: string;
}

const categories: AdherenceCategory[] = [
  { label: 'Entrenos', value: 85, icon: Dumbbell, color: 'text-accent-green' },
  { label: 'Macros', value: 72, icon: Apple, color: 'text-accent-blue' },
  { label: 'Suplementos', value: 91, icon: Pill, color: 'text-accent-purple' },
  { label: 'Peso', value: 78, icon: Scale, color: 'text-accent-orange' },
];

const overallScore = Math.round(
  categories.reduce((sum, c) => sum + c.value, 0) / categories.length
);

export default function AdherenceScore() {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="bg-bg-secondary rounded-2xl border border-divider p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-text-muted" />
        <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted">
          Adherencia Semanal
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular Progress */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#1E2028"
              strokeWidth="6"
            />
            {/* Fill */}
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#00E676"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold text-text-primary tabular-nums leading-none">
              {overallScore}%
            </span>
            <span className="text-[10px] text-text-muted mt-0.5">Promedio</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-3">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className={cat.color} />
                    <span className="text-[11px] text-text-secondary">{cat.label}</span>
                  </div>
                  <span className="text-[11px] font-medium text-text-primary tabular-nums">
                    {cat.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className={`h-full rounded-full ${
                      cat.value >= 80
                        ? 'bg-accent-green'
                        : cat.value >= 60
                          ? 'bg-accent-blue'
                          : 'bg-accent-orange'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
