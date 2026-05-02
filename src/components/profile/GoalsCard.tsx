import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import type { UserProfile } from '@/types';

interface GoalsCardProps {
  user: UserProfile;
}

export default function GoalsCard({ user }: GoalsCardProps) {
  const weightProgress = Math.min(
    100,
    Math.round(
      ((user.currentWeight - user.goalWeight) / (user.currentWeight - user.goalWeight + 3.2)) * 100
    ) || 90
  );
  const weightProgressAdjusted = Math.max(0, Math.min(100, 100 - weightProgress));

  // Body fat: current ~17.5%, target 12%
  const currentBF = 17.5;
  const targetBF = 12;
  const bfProgress = Math.round(
    ((currentBF - targetBF) / (currentBF - targetBF + (currentBF - targetBF) * 0.5)) * 100
  ) || 68;
  const bfProgressAdjusted = Math.max(0, Math.min(100, bfProgress));

  // Weekly rate options
  const weeklyRates = [
    { label: '-0.5kg', value: -0.5 },
    { label: '-0.25kg', value: -0.25 },
    { label: '0', value: 0 },
    { label: '+0.25kg', value: 0.25 },
    { label: '+0.5kg', value: 0.5 },
  ];
  const [selectedRate, setSelectedRate] = useState(-0.25);

  // Goal date projection
  const kgToGo = user.currentWeight - user.goalWeight;
  const weeksToGoal = selectedRate < 0 ? Math.ceil(Math.abs(kgToGo) / Math.abs(selectedRate)) : 999;
  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + weeksToGoal * 7);
  const goalDateStr = goalDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="bg-bg-secondary rounded-2xl border border-divider p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target size={14} className="text-text-muted" />
        <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted">
          Objetivos
        </span>
      </div>

      {/* Target Weight */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] text-text-primary">Peso Objetivo</span>
          <span className="text-[16px] font-semibold text-text-primary tabular-nums">
            {user.goalWeight} kg
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weightProgressAdjusted}%` }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            className="h-full rounded-full bg-gradient-to-r from-accent-green to-[#69F0AE]"
          />
        </div>
        <p className="text-[11px] text-text-secondary mt-1">
          {kgToGo.toFixed(1)} kg para llegar a la meta
        </p>
      </div>

      {/* Target Body Fat */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] text-text-primary">Grasa Corporal Objetivo</span>
          <span className="text-[16px] font-semibold text-text-primary tabular-nums">
            {targetBF}%
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bfProgressAdjusted}%` }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            className="h-full rounded-full bg-gradient-to-r from-accent-orange to-[#FFAB40]"
          />
        </div>
        <p className="text-[11px] text-text-secondary mt-1">
          Actual: {currentBF}%
        </p>
      </div>

      {/* Weekly Rate Selector */}
      <div className="mb-3">
        <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted mb-2 block">
          Ritmo Semanal
        </span>
        <div className="flex gap-1.5">
          {weeklyRates.map((rate) => (
            <motion.button
              key={rate.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRate(rate.value)}
              className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                selectedRate === rate.value
                  ? 'bg-bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                  : 'bg-bg-tertiary text-text-secondary'
              }`}
            >
              {rate.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Goal Date */}
      {selectedRate !== 0 && weeksToGoal < 999 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[12px] text-accent-green text-center mt-2"
        >
          Llegaras a tu meta el {goalDateStr}
        </motion.p>
      )}
    </motion.div>
  );
}
