import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  Play,
  Droplets,
  Footprints,
  Moon,
  Trophy,
  Flame,
  Check,
  TrendingDown,
  Beaker,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/lib/store';
import {
  INTRADAY_HR,
  WEEKLY_CONSISTENCY,
  ACHIEVEMENTS,
} from '@/lib/mockData';
import type { Achievement } from '@/types';

/* ─── Animation helpers ─── */
const easeDefault = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];
const easeBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
/* const easeSnappy = [0.16, 1, 0.3, 1] as [number, number, number, number]; */

const fadeSlideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: easeDefault },
});

/* ─── Circular Progress Ring ─── */
function CircularRing({
  size = 40,
  strokeWidth = 4,
  percentage,
  color,
}: {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percentage, 1));

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1E2028"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.7, ease: easeDefault, delay: 0.3 }}
      />
    </svg>
  );
}

/* ─── Macro Progress Bar ─── */
function MacroBar({
  label,
  current,
  target,
  color,
  delay = 0,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
  delay?: number;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-text-primary">{label}</span>
        <span className="text-[13px] text-text-secondary">
          {current}g / {target}g
        </span>
      </div>
      <div className="w-full h-[6px] bg-bg-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: easeBounce }}
        />
      </div>
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[11px] font-medium tracking-[0.4px] text-text-muted uppercase">
        {title}
      </h3>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-0.5 text-[11px] text-text-muted hover:text-text-primary transition-colors"
        >
          {action.label}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

/* ─── Kinetic Number ─── */
function KineticNumber({
  value,
  duration = 0.8,
  className = '',
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Supplement Pill ─── */
function SupplementPill({
  supplement,
  index,
  onToggle,
}: {
  supplement: { id: number; name: string; taken: boolean; color: string };
  index: number;
  onToggle: (id: number) => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: easeDefault }}
      onClick={() => onToggle(supplement.id)}
      className={`flex flex-col items-center justify-center w-[80px] h-[64px] rounded-xl border transition-colors duration-150 relative shrink-0 ${
        supplement.taken
          ? 'border-accent-green bg-[rgba(0,230,118,0.05)]'
          : 'border-divider bg-bg-tertiary'
      }`}
    >
      {/* Checkmark */}
      <div
        className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
          supplement.taken ? 'bg-accent-green' : 'border border-text-muted'
        }`}
      >
        {supplement.taken && <Check size={10} className="text-bg-primary" strokeWidth={3} />}
      </div>

      <Beaker size={20} style={{ color: supplement.color }} />
      <span className="text-[11px] font-medium text-text-secondary mt-1 tracking-wide uppercase">
        {supplement.name}
      </span>
    </motion.button>
  );
}

/* ─── Consistency Dot ─── */
function ConsistencyDot({
  day,
  completed,
  type,
}: {
  day: string;
  completed: boolean;
  type: string;
}) {
  const dotColor = completed
    ? type === 'rest'
      ? 'bg-accent-purple'
      : 'bg-accent-green'
    : 'bg-bg-tertiary';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] text-text-secondary uppercase">{day}</span>
      <motion.div
        className={`w-8 h-8 rounded-full ${dotColor} flex items-center justify-center border ${
          completed && type !== 'rest' ? 'border-accent-green/50' : 'border-divider'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
      >
        {completed && type !== 'rest' && (
          <Check size={14} className="text-bg-primary" strokeWidth={2.5} />
        )}
        {completed && type === 'rest' && (
          <Moon size={12} className="text-text-primary" />
        )}
      </motion.div>
    </div>
  );
}

/* ─── Achievement Item ─── */
function AchievementItem({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const Icon = achievement.icon === 'trophy' ? Trophy : Flame;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: easeDefault }}
      className="flex items-center gap-3 py-3 border-b border-divider last:border-0"
    >
      <div className="w-9 h-9 rounded-full bg-accent-yellow/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-accent-yellow" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-text-primary font-medium truncate">
          {achievement.title}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">{achievement.subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-text-muted shrink-0" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
  const {
    user,
    nutrition,
    nutritionTargets,
    weightLogs,
    supplements,
    toggleSupplement,
    todaysWorkout,
    steps,
    stepsGoal,
    sleep,
    sleepGoal,
    hydration,
    hydrationGoal,
    burnedCalories,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Derived values */
  const caloriesRemaining = nutritionTargets.calories - nutrition.calories;
  const caloriesPct = nutrition.calories / nutritionTargets.calories;
  const currentWeight = weightLogs[weightLogs.length - 1]?.weight ?? 81.2;
  const prevWeekWeight = weightLogs[weightLogs.length - 8]?.weight ?? currentWeight;
  const weightChange = +(currentWeight - prevWeekWeight).toFixed(1);
  const weightTrendingDown = weightChange < 0;

  const todaysWorkoutExercises = todaysWorkout?.exercises ?? [];
  const completedSets = todaysWorkoutExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = todaysWorkoutExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const workoutPct = totalSets > 0 ? completedSets / totalSets : 0;

  const sparklineData = useMemo(
    () => weightLogs.slice(-14).map((w) => ({ weight: w.weight })),
    [weightLogs]
  );

  const hrData = useMemo(
    () => INTRADAY_HR.map((hr, i) => ({ hr, time: i })),
    []
  );

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="bg-bg-primary min-h-[100dvh]">
      {/* ── Section 1: Header ── */}
      <header
        className={`sticky top-0 z-40 h-14 flex items-center justify-between px-4 transition-all duration-200 ${
          scrolled ? 'glass' : 'bg-transparent'
        }`}
      >
        <motion.div {...fadeSlideUp(0)}>
          <h1 className="text-[22px] font-semibold text-text-primary leading-tight tracking-tight">
            {greeting}, {user.name}
          </h1>
          <p className="text-[13px] text-text-secondary">{todayStr}</p>
        </motion.div>
        <motion.button
          {...fadeSlideUp(0.05)}
          className="relative w-10 h-10 flex items-center justify-center touch-target"
          whileTap={{ scale: 0.92 }}
        >
          <Bell size={22} className="text-text-secondary" />
          {/* Red badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full" />
        </motion.button>
      </header>

      <div className="px-4 pt-2 space-y-4">
        {/* ── Section 2: Calories & Macros ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Calories Card */}
          <motion.div
            {...fadeSlideUp(0.1)}
            className="bg-bg-secondary border border-divider rounded-2xl p-4 flex flex-col"
          >
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-[0.4px]">
              Calories Remaining
            </span>
            <div className="mt-2">
              <span className="text-[36px] font-bold text-text-primary tabular-nums leading-none tracking-tight">
                <KineticNumber value={caloriesRemaining} duration={0.8} />
              </span>
              <span className="text-[13px] text-text-secondary ml-1">
                / {nutritionTargets.calories.toLocaleString()} kcal
              </span>
            </div>

            {/* Calorie progress bar */}
            <div className="w-full h-2 bg-bg-tertiary rounded-full mt-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-calories"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(caloriesPct * 100, 100)}%` }}
                transition={{ duration: 0.6, delay: 0.2, ease: easeBounce }}
              />
            </div>

            {/* Micro labels */}
            <div className="flex justify-between mt-3">
              <span className="text-[11px] text-text-secondary">
                Eaten: {nutrition.calories}
              </span>
              <span className="text-[11px] text-text-secondary">
                Burned: {burnedCalories}
              </span>
              <span className="text-[11px] text-accent-green">
                Net: {nutrition.calories - burnedCalories}
              </span>
            </div>

            {/* Macro mini pills */}
            <div className="flex gap-2 mt-3">
              <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                P: {nutrition.protein}g
              </span>
              <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                C: {nutrition.carbs}g
              </span>
              <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
                F: {nutrition.fats}g
              </span>
            </div>
          </motion.div>

          {/* Macros Card */}
          <motion.div
            {...fadeSlideUp(0.15)}
            className="bg-bg-secondary border border-divider rounded-2xl p-4"
          >
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-[0.4px] block mb-3">
              Macros
            </span>
            <MacroBar
              label="Protein"
              current={nutrition.protein}
              target={nutritionTargets.protein}
              color="#00E676"
              delay={0.2}
            />
            <MacroBar
              label="Carbs"
              current={nutrition.carbs}
              target={nutritionTargets.carbs}
              color="#2979FF"
              delay={0.3}
            />
            <MacroBar
              label="Fats"
              current={nutrition.fats}
              target={nutritionTargets.fats}
              color="#FF9100"
              delay={0.4}
            />
          </motion.div>
        </div>

        {/* ── Section 3: Today's Workout ── */}
        <motion.div
          {...fadeSlideUp(0.2)}
          className="bg-bg-secondary border border-divider rounded-2xl overflow-hidden relative"
        >
          {/* Green top border */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent-green" />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-[0.4px]">
                Today&apos;s Workout
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-accent-green">
                <motion.span
                  className="w-2 h-2 rounded-full bg-accent-green inline-block"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                In Progress
              </span>
            </div>

            <h2 className="text-[22px] font-semibold text-text-primary tracking-tight mb-1">
              {todaysWorkout?.routineName ?? 'Rest Day'}
            </h2>
            <p className="text-[13px] text-text-secondary mb-3">
              {todaysWorkoutExercises.length} exercises &middot; ~55 min &middot;{' '}
              {totalSets - completedSets} sets remaining
            </p>

            {/* Mini progress bar */}
            <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full rounded-full bg-accent-green"
                initial={{ width: 0 }}
                animate={{ width: `${workoutPct * 100}%` }}
                transition={{ duration: 0.6, delay: 0.3, ease: easeBounce }}
              />
            </div>

            {/* Next exercise preview */}
            {todaysWorkoutExercises.find((e) => !e.sets.every((s) => s.completed)) && (
              <p className="text-[13px] text-text-secondary mb-4">
                Next:{' '}
                {todaysWorkoutExercises.find((e) => !e.sets.every((s) => s.completed))
                  ?.exerciseName ?? 'None'}{' '}
                — 4&times;8-12 @ 60kg
              </p>
            )}

            {/* Resume button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full h-12 bg-accent-green text-bg-primary font-semibold text-[14px] rounded-xl flex items-center justify-center gap-2 touch-target"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Play size={16} fill="#0F1215" />
              Resume Workout
            </motion.button>
          </div>
        </motion.div>

        {/* ── Section 4: Weight Trend ── */}
        <motion.div
          {...fadeSlideUp(0.25)}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <SectionHeader title="Weight Trend" action={{ label: 'View All' }} />

          <div className="flex items-end gap-3 mb-3">
            <span className="text-[36px] font-bold text-text-primary tabular-nums leading-none tracking-tight">
              {currentWeight}
            </span>
            <span className="text-[15px] text-text-secondary mb-1">kg</span>
          </div>

          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown
              size={14}
              className={weightTrendingDown ? 'text-accent-green' : 'text-accent-orange'}
            />
            <span
              className={`text-[13px] ${
                weightTrendingDown ? 'text-accent-green' : 'text-accent-orange'
              }`}
            >
              {Math.abs(weightChange)} kg this week
            </span>
          </div>

          {/* Sparkline */}
          <div className="h-[60px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E676" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#00E676"
                  strokeWidth={2}
                  fill="url(#weightGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#00E676' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Section 5: Activity Mini-Cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Hydration */}
          <motion.div
            {...fadeSlideUp(0.3)}
            className="bg-bg-secondary border border-divider rounded-2xl p-3 flex flex-col items-center"
          >
            <Droplets size={20} className="text-accent-blue mb-2" />
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-[0.4px]">
              Hydration
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[18px] font-semibold text-text-primary tabular-nums">
                {hydration.toFixed(1)}L
              </span>
            </div>
            <span className="text-[10px] text-text-muted mb-2">/ {hydrationGoal}L</span>
            <CircularRing
              size={40}
              strokeWidth={4}
              percentage={hydration / hydrationGoal}
              color="#2979FF"
            />
            {/* Quick add buttons */}
            <div className="flex gap-1 mt-2">
              {['250', '500', '1L'].map((amount) => (
                <button
                  key={amount}
                  className="px-1.5 py-0.5 text-[9px] font-medium text-text-secondary bg-bg-tertiary rounded touch-target"
                >
                  +{amount}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            {...fadeSlideUp(0.35)}
            className="bg-bg-secondary border border-divider rounded-2xl p-3 flex flex-col items-center"
          >
            <Footprints size={20} className="text-accent-green mb-2" />
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-[0.4px]">
              Steps
            </span>
            <span className="text-[18px] font-semibold text-text-primary tabular-nums mt-1">
              {steps.toLocaleString()}
            </span>
            <span className="text-[10px] text-text-muted mb-2">
              / {stepsGoal.toLocaleString()}
            </span>
            <CircularRing
              size={40}
              strokeWidth={4}
              percentage={steps / stepsGoal}
              color="#00E676"
            />
            {/* Mini bar */}
            <div className="w-full h-1 bg-bg-tertiary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-green"
                style={{ width: `${Math.min((steps / stepsGoal) * 100, 100)}%` }}
              />
            </div>
          </motion.div>

          {/* Sleep */}
          <motion.div
            {...fadeSlideUp(0.4)}
            className="bg-bg-secondary border border-divider rounded-2xl p-3 flex flex-col items-center"
          >
            <Moon size={20} className="text-accent-purple mb-2" />
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-[0.4px]">
              Sleep
            </span>
            <span className="text-[18px] font-semibold text-text-primary tabular-nums mt-1">
              {Math.floor(sleep)}h {Math.round((sleep % 1) * 60)}m
            </span>
            <span className="text-[10px] text-text-muted mb-2">Last night</span>
            <CircularRing
              size={40}
              strokeWidth={4}
              percentage={sleep / sleepGoal}
              color="#7C4DFF"
            />
            {/* Quality badge */}
            <span className="mt-2 px-2 py-0.5 text-[9px] font-medium text-accent-purple bg-accent-purple/15 rounded-full">
              Good
            </span>
          </motion.div>
        </div>

        {/* ── Section 6: Heart Rate ── */}
        <motion.div
          {...fadeSlideUp(0.45)}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <SectionHeader title="Heart Rate" />
          <div className="h-[50px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hrData}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF1744" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#FF1744" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="hr"
                  stroke="#FF1744"
                  strokeWidth={2}
                  fill="url(#hrGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-[13px] text-text-secondary">
              Resting:{' '}
              <span className="text-text-primary">62 bpm</span>
            </span>
            <span className="text-[13px] text-text-secondary">
              Avg: <span className="text-text-primary">72 bpm</span>
            </span>
            <span className="text-[13px] text-accent-red">Peak: 148 bpm</span>
          </div>
        </motion.div>

        {/* ── Section 7: Supplements ── */}
        <motion.div
          {...fadeSlideUp(0.5)}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-[0.4px]">
              Today&apos;s Supplements
            </span>
            <button className="text-[11px] text-accent-green font-medium">Log All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
            {supplements.map((sup, i) => (
              <SupplementPill
                key={sup.id}
                supplement={sup}
                index={i}
                onToggle={toggleSupplement}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Section 8: Weekly Consistency ── */}
        <motion.div
          {...fadeSlideUp(0.55)}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-[0.4px] block mb-3">
            Weekly Consistency
          </span>
          <div className="flex justify-between">
            {WEEKLY_CONSISTENCY.map((d) => (
              <ConsistencyDot
                key={d.day}
                day={d.day}
                completed={d.completed}
                type={d.type}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Section 9: Achievements ── */}
        <motion.div
          {...fadeSlideUp(0.6)}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-[0.4px] block mb-1">
            Recent Achievements
          </span>
          <div>
            {ACHIEVEMENTS.map((ach, i) => (
              <AchievementItem key={ach.id} achievement={ach} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
