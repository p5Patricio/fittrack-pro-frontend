import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Flame, Droplets, Wheat as WheatIcon } from 'lucide-react';
import type { NutritionTargets } from '@/types';
import type { ActivityKey, GoalKey, MacroPresetKey } from './supplementData';
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  MACRO_PRESETS,
  calculateTDEE,
} from './supplementData';

interface MacroTargetsCardProps {
  targets: NutritionTargets;
  userWeight: number;
  userHeight: number;
  userAge: number;
  userGender: 'male' | 'female';
  userActivity: ActivityKey;
  onUpdateTargets: (targets: Partial<NutritionTargets>) => void;
}

export default function MacroTargetsCard({
  targets,
  userWeight,
  userHeight,
  userAge,
  userGender,
  userActivity,
  onUpdateTargets,
}: MacroTargetsCardProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcWeight] = useState(userWeight);
  const [calcHeight] = useState(userHeight);
  const [calcAge] = useState(userAge);
  const [calcGender] = useState<'male' | 'female'>(userGender);
  const [calcActivity, setCalcActivity] = useState<ActivityKey>(userActivity);
  const [calcGoal, setCalcGoal] = useState<GoalKey>('mild_loss');
  const [proteinPct, setProteinPct] = useState(24);
  const [carbsPct, setCarbsPct] = useState(52);
  const [fatPct, setFatPct] = useState(24);
  const [proteinPriority, setProteinPriority] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<MacroPresetKey | 'custom'>('custom');

  const tdee = calculateTDEE(calcWeight, calcHeight, calcAge, calcGender, calcActivity);
  const goalAdj = GOAL_ADJUSTMENTS[calcGoal].calories;
  const calculatedCalories = tdee + goalAdj;

  const totalPct = proteinPct + carbsPct + fatPct;

  // Calculate grams
  const proteinGrams = proteinPriority
    ? Math.round((proteinPct / 100) * calcWeight) // g/kg bodyweight
    : Math.round((calculatedCalories * (proteinPct / 100)) / 4);
  const carbsGrams = Math.round((calculatedCalories * (carbsPct / 100)) / 4);
  const fatGrams = Math.round((calculatedCalories * (fatPct / 100)) / 9);

  const handlePreset = (preset: MacroPresetKey) => {
    setSelectedPreset(preset);
    const p = MACRO_PRESETS[preset];
    setProteinPct(p.protein);
    setCarbsPct(p.carbs);
    setFatPct(p.fat);
  };

  const handleSliderChange = (type: 'protein' | 'carbs' | 'fat', value: number) => {
    setSelectedPreset('custom');
    if (type === 'protein') {
      setProteinPct(value);
    } else if (type === 'carbs') {
      setCarbsPct(value);
    } else {
      setFatPct(value);
    }
  };

  const handleApplyTargets = () => {
    onUpdateTargets({
      calories: calculatedCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fats: fatGrams,
    });
    setShowCalculator(false);
  };

  const tdeeDiff = targets.calories - tdee;

  const macroRows = [
    {
      label: 'Proteina',
      value: `${targets.protein}g`,
      pct: `${Math.round((targets.protein * 4 * 100) / targets.calories)}%`,
      color: 'from-accent-green to-[#69F0AE]',
      dotColor: 'bg-accent-green',
      icon: Flame,
    },
    {
      label: 'Carbs',
      value: `${targets.carbs}g`,
      pct: `${Math.round((targets.carbs * 4 * 100) / targets.calories)}%`,
      color: 'from-accent-blue to-[#448AFF]',
      dotColor: 'bg-accent-blue',
      icon: Droplets,
    },
    {
      label: 'Grasas',
      value: `${targets.fats}g`,
      pct: `${Math.round((targets.fats * 9 * 100) / targets.calories)}%`,
      color: 'from-accent-orange to-[#FFAB40]',
      dotColor: 'bg-accent-orange',
      icon: WheatIcon,
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="bg-bg-secondary rounded-2xl border border-divider p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted">
            Objetivos Diarios de Macros
          </span>
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-1 text-[12px] text-accent-green hover:text-accent-green/80 transition-colors"
          >
            <Pencil size={12} />
            <span>Editar</span>
          </button>
        </div>

        {/* Calorie target */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-text-primary tabular-nums leading-none">
              {targets.calories.toLocaleString()}
            </span>
            <span className="text-[13px] text-text-secondary">kcal</span>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            {tdeeDiff >= 0 ? `+${tdeeDiff}` : tdeeDiff} kcal vs TDEE
          </p>
        </div>

        {/* Macro breakdown */}
        <div className="space-y-3">
          {macroRows.map((macro, index) => (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${macro.dotColor}`} />
                  <span className="text-[13px] text-text-primary">{macro.label}</span>
                </div>
                <span className="text-[13px] text-text-secondary tabular-nums">
                  {macro.value} ({macro.pct})
                </span>
              </div>
              <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden ml-4">
                <div className={`h-full rounded-full bg-gradient-to-r ${macro.color}`} style={{ width: '100%' }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recalculate button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCalculator(true)}
          className="w-full mt-4 py-2.5 rounded-xl bg-bg-tertiary text-[13px] text-accent-green font-medium hover:bg-bg-tertiary/80 transition-colors"
        >
          Recalcular Basado en Objetivo
        </motion.button>
      </motion.div>

      {/* Macro Calculator Bottom Sheet */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCalculator(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-bg-secondary rounded-t-3xl max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-text-muted/30" />
              </div>

              <div className="px-4 pb-8">
                <h3 className="text-[22px] font-bold text-text-primary mb-4">
                  Calculadora de Macros
                </h3>

                {/* TDEE Display */}
                <div className="bg-bg-tertiary rounded-xl p-4 mb-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">
                    Tu TDEE
                  </p>
                  <p className="text-[24px] font-bold text-text-primary tabular-nums">
                    {tdee.toLocaleString()} kcal
                  </p>
                </div>

                {/* Activity Level */}
                <div className="mb-4">
                  <p className="text-[13px] text-text-secondary mb-2">Nivel de actividad</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.entries(ACTIVITY_MULTIPLIERS) as [ActivityKey, typeof ACTIVITY_MULTIPLIERS[ActivityKey]][]).map(
                      ([key, data]) => (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setCalcActivity(key)}
                          className={`py-2.5 px-3 rounded-xl text-[12px] font-medium transition-colors text-left ${
                            calcActivity === key
                              ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                              : 'bg-bg-tertiary text-text-secondary border border-transparent'
                          }`}
                        >
                          {data.label}
                          <span className="block text-[10px] opacity-60 mt-0.5">{data.desc}</span>
                        </motion.button>
                      )
                    )}
                  </div>
                </div>

                {/* Goal Adjustment */}
                <div className="mb-4">
                  <p className="text-[13px] text-text-secondary mb-2">Selecciona tu objetivo</p>
                  <div className="space-y-1.5">
                    {(Object.entries(GOAL_ADJUSTMENTS) as [GoalKey, typeof GOAL_ADJUSTMENTS[GoalKey]][]).map(
                      ([key, data]) => (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCalcGoal(key)}
                          className={`w-full py-2.5 px-3 rounded-xl text-[12px] font-medium transition-colors flex items-center justify-between ${
                            calcGoal === key
                              ? 'bg-bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                              : 'bg-bg-tertiary text-text-secondary'
                          }`}
                        >
                          <span>{data.label}</span>
                          <span className="text-[11px] opacity-60">{data.desc}</span>
                        </motion.button>
                      )
                    )}
                  </div>
                </div>

                {/* Result calories */}
                <div className="bg-bg-tertiary rounded-xl p-4 mb-4">
                  <p className="text-[11px] text-text-muted mb-1">Calorias objetivo</p>
                  <p className="text-[28px] font-bold text-accent-green tabular-nums">
                    {calculatedCalories.toLocaleString()} kcal
                  </p>
                </div>

                {/* Macro Presets */}
                <div className="mb-4">
                  <p className="text-[13px] text-text-secondary mb-2">Distribucion de macros</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.entries(MACRO_PRESETS) as [MacroPresetKey, typeof MACRO_PRESETS[MacroPresetKey]][]).map(
                      ([key, data]) => (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePreset(key)}
                          className={`py-2 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                            selectedPreset === key
                              ? 'bg-bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                              : 'bg-bg-tertiary text-text-secondary'
                          }`}
                        >
                          {data.label}
                        </motion.button>
                      )
                    )}
                  </div>
                </div>

                {/* Protein Priority Toggle */}
                <div className="flex items-center justify-between py-3 px-3 bg-bg-tertiary rounded-xl mb-4">
                  <span className="text-[13px] text-text-primary">Prioridad Proteina (g/kg)</span>
                  <button
                    onClick={() => setProteinPriority(!proteinPriority)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      proteinPriority ? 'bg-accent-green' : 'bg-bg-elevated'
                    }`}
                  >
                    <motion.div
                      animate={{ x: proteinPriority ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>

                {/* Macro Sliders */}
                <div className="space-y-4 mb-6">
                  {/* Protein slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-accent-green">Proteina: {proteinGrams}g</span>
                      <span className="text-[11px] text-text-muted">{proteinPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={proteinPct}
                      onChange={(e) => handleSliderChange('protein', Number(e.target.value))}
                      className="w-full h-1.5 bg-bg-tertiary rounded-full appearance-none cursor-pointer accent-accent-green"
                      style={{ accentColor: '#00E676' }}
                    />
                  </div>
                  {/* Carbs slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-accent-blue">Carbs: {carbsGrams}g</span>
                      <span className="text-[11px] text-text-muted">{carbsPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={70}
                      value={carbsPct}
                      onChange={(e) => handleSliderChange('carbs', Number(e.target.value))}
                      className="w-full h-1.5 bg-bg-tertiary rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#2979FF' }}
                    />
                  </div>
                  {/* Fat slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-accent-orange">Grasas: {fatGrams}g</span>
                      <span className="text-[11px] text-text-muted">{fatPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={fatPct}
                      onChange={(e) => handleSliderChange('fat', Number(e.target.value))}
                      className="w-full h-1.5 bg-bg-tertiary rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#FF9100' }}
                    />
                  </div>
                  {totalPct !== 100 && (
                    <p className={`text-[11px] ${totalPct > 100 ? 'text-accent-red' : 'text-warning'}`}>
                      Total: {totalPct}% {totalPct > 100 ? '(excedido)' : '(faltante)'}
                    </p>
                  )}
                </div>

                {/* Apply Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApplyTargets}
                  className="w-full py-3.5 rounded-xl bg-accent-green text-[#0F1215] font-semibold text-[15px] hover:bg-accent-green/90 transition-colors"
                >
                  Aplicar Objetivos
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
