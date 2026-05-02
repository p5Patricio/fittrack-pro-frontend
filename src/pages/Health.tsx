import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  RefreshCw,
  Footprints,
  Flame,
  HeartPulse,
  Moon,
  ChevronRight,
  Upload,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Line,
} from 'recharts';
import {
  STEPS_DATA,
  HEART_RATE_DATA,
  SLEEP_DATA,
  CALORIES_BURNED_DATA,
  INTRADAY_HR,
  USER_PROFILE,
} from '@/lib/mockData';
import { cn } from '@/lib/utils';

/* ─── Helpers ─── */
function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
}

/* ─── Circular Progress Ring ─── */
function CircularRing({
  percentage,
  size = 40,
  strokeWidth = 4,
  color = '#00E676',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
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
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      />
    </svg>
  );
}

/* ─── Mini Sparkline ─── */
function MiniSparkline({ data, color = '#FF1744', height = 20, width = 50 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Import Bottom Sheet ─── */
function ImportSheet({ onClose }: { onClose: () => void }) {
  const [activeMethod, setActiveMethod] = useState<'upload' | 'demo'>('upload');
  const [imported, setImported] = useState(false);

  const handleLoadDemo = () => {
    setImported(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-bg-secondary rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-hide"
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-text-muted/30 rounded-full mx-auto mb-4" />

        <h2 className="text-[22px] font-semibold text-text-primary mb-1">Import Samsung Health Data</h2>
        <p className="text-[13px] text-text-secondary mb-4">Sync your health metrics from Samsung Health</p>

        {/* Method tabs */}
        <div className="flex bg-bg-tertiary rounded-xl p-1 mb-4">
          {(['upload', 'demo'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMethod(m)}
              className={cn(
                'flex-1 py-2 rounded-lg text-[13px] font-medium transition-all',
                activeMethod === m ? 'bg-bg-elevated text-text-primary shadow-md' : 'text-text-secondary'
              )}
            >
              {m === 'upload' ? 'Manual Upload' : 'Demo Data'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeMethod === 'upload' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Export your Samsung Health data as CSV from the Samsung Health app, then upload it here.
              </p>

              {/* File drop zone */}
              <div className="border-2 border-dashed border-divider rounded-xl h-[120px] flex flex-col items-center justify-center gap-2 hover:border-accent-green/50 transition-colors">
                <Upload size={32} className="text-text-muted" />
                <p className="text-[13px] text-text-secondary">Drop CSV file here or tap to browse</p>
              </div>

              <p className="text-[11px] text-text-muted text-center">Supported formats: CSV, JSON</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full h-12 bg-accent-green rounded-xl text-[15px] font-semibold text-[#0F1215]"
              >
                Import Data
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <p className="text-[13px] text-text-secondary leading-relaxed">
                Load 30 days of sample data to explore the app and see how health metrics are visualized.
              </p>

              <div className="bg-bg-tertiary rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[13px] text-text-primary">
                  <Check size={16} className="text-accent-green" />
                  <span>30 days of steps, heart rate, sleep, and calories</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-text-primary">
                  <Check size={16} className="text-accent-green" />
                  <span>~8,500 avg steps/day</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-text-primary">
                  <Check size={16} className="text-accent-green" />
                  <span>~7.5h avg sleep/night</span>
                </div>
              </div>

              {imported ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full h-12 bg-accent-green/20 rounded-xl flex items-center justify-center gap-2 text-accent-green text-[15px] font-semibold"
                >
                  <Check size={20} />
                  Demo data loaded!
                </motion.div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadDemo}
                  className="w-full h-12 bg-accent-green rounded-xl text-[15px] font-semibold text-[#0F1215]"
                >
                  Load Demo Data
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ─── Activity Summary Card ─── */
function ActivityCard({
  icon: Icon,
  iconColor,
  value,
  unit,
  sub,
  trend,
  trendColor,
  children,
}: {
  icon: typeof Footprints;
  iconColor: string;
  value: string;
  unit: string;
  sub?: string;
  trend?: string;
  trendColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary rounded-2xl border border-divider p-3 flex flex-col items-center text-center"
    >
      <Icon size={20} className={iconColor} />
      <p className="text-[18px] font-semibold text-text-primary tabular-nums mt-2">{value}</p>
      <p className="text-[11px] text-text-muted">{unit}</p>
      {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
      {trend && <p className={cn('text-[11px] mt-1', trendColor)}>{trend}</p>}
      {children}
    </motion.div>
  );
}

/* ─── Main Health Page ─── */
export default function Health() {
  const [viewMode, setViewMode] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [showImport, setShowImport] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  const last7Steps = STEPS_DATA.slice(-7);
  const last7HR = HEART_RATE_DATA.slice(-7);
  const last7Sleep = SLEEP_DATA.slice(-7);
  const last7Calories = CALORIES_BURNED_DATA.slice(-7);

  const todaySteps = last7Steps[last7Steps.length - 1]?.steps ?? 6240;
  const yesterdaySteps = last7Steps[last7Steps.length - 2]?.steps ?? 5400;
  const stepsDiff = todaySteps - yesterdaySteps;
  const stepsGoal = USER_PROFILE.dailyStepsGoal;

  const todayHR = last7HR[last7HR.length - 1];
  const todayCalories = last7Calories[last7Calories.length - 1]?.caloriesBurned ?? 2840;
  const todaySleep = last7Sleep[last7Sleep.length - 1];

  const stepsPercent = Math.min(100, Math.round((todaySteps / stepsGoal) * 100));

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowImport(true);
    }, 800);
  };

  /* Steps chart data */
  const stepsChartData = last7Steps.map((entry) => ({
    date: formatShortDate(entry.date),
    steps: entry.steps ?? 0,
    fullDate: entry.date,
  }));

  /* HR chart data (30-day for weekly view) */
  const hrChartData = HEART_RATE_DATA.slice(-30).map((entry) => ({
    date: formatShortDate(entry.date),
    resting: entry.restingHeartRate ?? 65,
    avg: entry.avgHeartRate ?? 72,
    peak: entry.peakHeartRate ?? 140,
    fullDate: entry.date,
  }));

  /* Sleep chart data */
  const sleepChartData = last7Sleep.map((entry) => {
    const total = entry.sleepHours ?? 7.2;
    const deep = +(total * 0.20).toFixed(1);
    const light = +(total * 0.53).toFixed(1);
    const rem = +(total * 0.22).toFixed(1);
    const awake = +(total * 0.05).toFixed(1);
    return {
      date: formatShortDate(entry.date),
      fullDate: entry.date,
      deep,
      light,
      rem,
      awake,
      total,
    };
  });

  /* Calories chart data */
  const caloriesChartData = last7Calories.map((entry) => {
    const total = entry.caloriesBurned ?? 2800;
    const bmr = 1800;
    const active = Math.floor((total - bmr) * 0.55);
    const exercise = total - bmr - active;
    return {
      date: formatShortDate(entry.date),
      fullDate: entry.date,
      bmr,
      active,
      exercise,
      total,
    };
  });

  /* Data table */
  const tableData = last7Steps.map((s, i) => ({
    date: s.date,
    steps: s.steps ?? 0,
    calories: last7Calories[i]?.caloriesBurned ?? 0,
    hr: last7HR[i]?.restingHeartRate ?? 0,
    sleep: last7Sleep[i]?.sleepHours ?? 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-[100dvh] bg-bg-primary pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-divider">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 touch-target">
            <ChevronLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">SALUD</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSync}
            className="p-2 -mr-2 touch-target"
          >
            <motion.div
              animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
              transition={isSyncing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}}
            >
              <RefreshCw size={20} className="text-text-primary" />
            </motion.div>
          </motion.button>
        </div>

        {/* View + Date Navigation */}
        <div className="flex items-center justify-between px-4 pb-2 gap-3">
          <div className="flex bg-bg-tertiary rounded-xl p-1 flex-1">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                  viewMode === v ? 'bg-bg-elevated text-text-primary shadow-md' : 'text-text-secondary'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[13px] text-text-secondary shrink-0">
            <button className="p-1"><ChevronLeft size={16} /></button>
            <span className="whitespace-nowrap">Tuesday, Jan 14</span>
            <button className="p-1"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        {/* Activity Summary Row */}
        <div className="px-4 grid grid-cols-3 gap-3">
          {/* Steps Card */}
          <ActivityCard
            icon={Footprints}
            iconColor="text-accent-green"
            value={todaySteps.toLocaleString()}
            unit="/ 10,000 steps"
            sub={`${stepsPercent}% of goal`}
            trend={`${stepsDiff >= 0 ? '▲' : '▼'} ${Math.abs(stepsDiff)} vs yday`}
            trendColor={stepsDiff >= 0 ? 'text-accent-green' : 'text-accent-orange'}
          >
            <div className="mt-2">
              <CircularRing percentage={stepsPercent} size={40} strokeWidth={4} color="#00E676" />
            </div>
          </ActivityCard>

          {/* Calories Card */}
          <ActivityCard
            icon={Flame}
            iconColor="text-accent-orange"
            value="420"
            unit="kcal (active)"
            sub={`${todayCalories.toLocaleString()} total`}
            trend="▲ 120 vs yday"
            trendColor="text-accent-green"
          />

          {/* Heart Rate Card */}
          <ActivityCard
            icon={HeartPulse}
            iconColor="text-accent-red"
            value={String(todayHR?.avgHeartRate ?? 72)}
            unit="bpm avg"
            sub={`${todayHR?.restingHeartRate ?? 62}-${todayHR?.peakHeartRate ?? 148} range`}
          >
            <div className="mt-2">
              <MiniSparkline data={INTRADAY_HR} color="#FF1744" height={20} width={50} />
            </div>
          </ActivityCard>
        </div>

        {/* Steps Bar Chart */}
        <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <Footprints size={16} className="text-accent-green" />
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Steps</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stepsChartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#262930', border: '1px solid #272A30', borderRadius: 12, padding: 12 }}
                labelStyle={{ color: '#8B9098', fontSize: 11 }}
                itemStyle={{ color: '#F5F6F7', fontSize: 13 }}
                formatter={(value: number, name: string) => [`${value.toLocaleString()} steps`, name === 'steps' ? 'Steps' : name]}
              />
              <ReferenceLine y={stepsGoal} stroke="#00E676" strokeDasharray="6 4" strokeOpacity={0.3} />
              <Bar dataKey="steps" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {stepsChartData.map((entry) => {
                  const val = entry.steps;
                  let fill = '#2979FF';
                  if (val >= stepsGoal) fill = '#00E676';
                  else if (val >= 5000) fill = '#69F0AE';
                  return <Cell key={`cell-${entry.fullDate}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Stats row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
            <span className="text-[13px] text-text-primary">{todaySteps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
            <span className="text-[13px] text-text-secondary">{stepsPercent}% of goal</span>
            <span className={cn('text-[13px]', stepsDiff >= 0 ? 'text-accent-green' : 'text-accent-orange')}>
              {stepsDiff >= 0 ? '▲' : '▼'} {Math.abs(stepsDiff)} vs yday
            </span>
          </div>
        </div>

        {/* Heart Rate Area Chart */}
        <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse size={16} className="text-accent-red" />
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Heart Rate</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={hrChartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF1744" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#FF1744" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 160]} tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#262930', border: '1px solid #272A30', borderRadius: 12, padding: 12 }}
                labelStyle={{ color: '#8B9098', fontSize: 11 }}
                itemStyle={{ color: '#F5F6F7', fontSize: 13 }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { resting: 'Resting', avg: 'Average', peak: 'Peak' };
                  return [`${value} bpm`, labels[name] || name];
                }}
              />
              {/* Normal range highlight */}
              <ReferenceLine y={60} stroke="#2979FF" strokeDasharray="4 4" strokeOpacity={0.2} />
              <ReferenceLine y={100} stroke="#2979FF" strokeDasharray="4 4" strokeOpacity={0.2} />
              <Area
                type="monotone"
                dataKey="resting"
                stroke="#FF1744"
                strokeWidth={2}
                fill="url(#hrFill)"
                dot={false}
                activeDot={{ r: 4, fill: '#FF1744' }}
                name="resting"
              />
              <Line type="monotone" dataKey="avg" stroke="#8B9098" strokeWidth={1.5} dot={false} name="avg" />
            </AreaChart>
          </ResponsiveContainer>
          {/* HR Stats */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
            <span className="text-[13px] text-accent-blue">R: {todayHR?.restingHeartRate ?? 62}</span>
            <span className="text-[13px] text-text-primary">Avg: {todayHR?.avgHeartRate ?? 72}</span>
            <span className="text-[13px] text-accent-red">Peak: {todayHR?.peakHeartRate ?? 148}</span>
            <span className="text-[13px] text-accent-orange">Active: 45 min</span>
          </div>
        </div>

        {/* Sleep Stages Bar */}
        <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <Moon size={16} className="text-accent-purple" />
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Sleep</span>
          </div>

          {/* Stacked bars for 7 nights */}
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sleepChartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: '#262930', border: '1px solid #272A30', borderRadius: 12, padding: 12 }}
                labelStyle={{ color: '#8B9098', fontSize: 11 }}
                itemStyle={{ color: '#F5F6F7', fontSize: 13 }}
                formatter={(value: number, name: string) => [`${value}h`, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Bar dataKey="deep" stackId="sleep" fill="#7C4DFF" radius={[0, 0, 0, 0]} name="deep" />
              <Bar dataKey="light" stackId="sleep" fill="#448AFF" radius={[0, 0, 0, 0]} name="light" />
              <Bar dataKey="rem" stackId="sleep" fill="#00E676" radius={[0, 0, 0, 0]} name="rem" />
              <Bar dataKey="awake" stackId="sleep" fill="#5A6068" radius={[2, 2, 0, 0]} name="awake" />
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2">
            {[
              { label: 'Deep', color: 'bg-accent-purple' },
              { label: 'Light', color: 'bg-accent-blue' },
              { label: 'REM', color: 'bg-accent-green' },
              { label: 'Awake', color: 'bg-text-muted' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={cn('w-2.5 h-2.5 rounded-full', item.color)} />
                <span className="text-[11px] text-text-secondary">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Sleep Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-divider">
            <div className="text-center">
              <p className="text-[13px] text-text-primary">{todaySleep?.sleepHours ?? 7.2}h</p>
              <p className="text-[11px] text-text-muted">Total</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] text-accent-purple">{((todaySleep?.sleepHours ?? 7.2) * 0.20).toFixed(1)}h</p>
              <p className="text-[11px] text-text-muted">Deep (20%)</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] text-accent-blue">{((todaySleep?.sleepHours ?? 7.2) * 0.22).toFixed(1)}h</p>
              <p className="text-[11px] text-text-muted">REM (22%)</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] text-accent-green">94%</p>
              <p className="text-[11px] text-text-muted">Efficiency</p>
            </div>
          </div>
        </div>

        {/* Calories Burned Chart */}
        <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-accent-orange" />
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Calories Burned</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={caloriesChartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#262930', border: '1px solid #272A30', borderRadius: 12, padding: 12 }}
                labelStyle={{ color: '#8B9098', fontSize: 11 }}
                itemStyle={{ color: '#F5F6F7', fontSize: 13 }}
                formatter={(value: number, name: string) => [`${value.toLocaleString()} kcal`, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Bar dataKey="bmr" stackId="cals" fill="#5A6068" radius={[0, 0, 0, 0]} name="bmr" />
              <Bar dataKey="active" stackId="cals" fill="#FF9100" radius={[0, 0, 0, 0]} name="active" />
              <Bar dataKey="exercise" stackId="cals" fill="#00E676" radius={[2, 2, 0, 0]} name="exercise" />
            </BarChart>
          </ResponsiveContainer>
          {/* Calories stats */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-divider">
            <span className="text-[13px] text-text-muted">BMR: 1,800</span>
            <span className="text-[13px] text-accent-orange">Active: 420</span>
            <span className="text-[13px] text-accent-green">Exercise: 380</span>
          </div>
          <p className="text-center text-[13px] text-text-primary mt-2">
            Total: <span className="font-semibold">{todayCalories.toLocaleString()}</span> kcal
          </p>
        </div>

        {/* Heart Rate Zones */}
        <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Heart Rate Zones</span>
          {/* Zone distribution bar */}
          <div className="mt-3 h-6 rounded-full overflow-hidden flex">
            <div className="h-full bg-accent-blue" style={{ width: '55%' }} />
            <div className="h-full bg-accent-green" style={{ width: '35%' }} />
            <div className="h-full bg-accent-orange" style={{ width: '8%' }} />
            <div className="h-full bg-accent-red" style={{ width: '2%' }} />
          </div>
          {/* Zone details */}
          <div className="mt-3 space-y-2">
            {[
              { name: 'Warmup', range: '86-103', time: '25 min', pct: '55%', color: 'bg-accent-blue' },
              { name: 'Fat Burn', range: '104-121', time: '15 min', pct: '35%', color: 'bg-accent-green' },
              { name: 'Cardio', range: '122-145', time: '4 min', pct: '8%', color: 'bg-accent-orange' },
              { name: 'Peak', range: '146+', time: '1 min', pct: '2%', color: 'bg-accent-red' },
            ].map((zone) => (
              <div key={zone.name} className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full shrink-0', zone.color)} />
                <span className="text-[13px] text-text-primary w-20">{zone.name}</span>
                <span className="text-[13px] text-text-muted w-20">{zone.range} bpm</span>
                <span className="text-[13px] text-text-primary flex-1 text-right">{zone.time}</span>
                <span className="text-[13px] text-text-secondary w-10 text-right">{zone.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Daily History</span>
          <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
            {tableData.map((row, i) => (
              <motion.button
                key={row.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-bg-tertiary transition-colors text-left"
              >
                <span className="text-[13px] text-text-secondary w-16 shrink-0">{formatShortDate(row.date)}</span>
                <span className="text-[13px] text-text-primary flex-1 tabular-nums">{row.steps.toLocaleString()}</span>
                <span className="text-[13px] text-accent-orange tabular-nums w-14 text-right">{row.calories}</span>
                <span className="text-[13px] text-accent-red tabular-nums w-10 text-right">{row.hr}</span>
                <span className="text-[13px] text-accent-purple tabular-nums w-10 text-right">{row.sleep}h</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Import Bottom Sheet */}
      <AnimatePresence>
        {showImport && <ImportSheet onClose={() => setShowImport(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
