import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Camera,
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
  Ruler,
  Image,
  BarChart3,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
} from 'recharts';
import { useStore } from '@/lib/store';
import { USER_PROFILE } from '@/lib/mockData';
import { cn } from '@/lib/utils';

/* ─── helpers ─── */
function computeMovingAverage(data: { date: string; weight: number }[], window: number) {
  return data.map((entry, idx) => {
    const start = Math.max(0, idx - window + 1);
    const slice = data.slice(start, idx + 1);
    const avg = slice.reduce((s, d) => s + d.weight, 0) / slice.length;
    return { ...entry, trend: Math.round(avg * 10) / 10 };
  });
}

function formatDateLabel(dateStr: string, range: string) {
  const d = new Date(dateStr + 'T00:00:00');
  if (range === '7D') return d.toLocaleDateString('es', { weekday: 'short' });
  if (range === '30D') return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  if (range === '90D' || range === '1Y') return d.toLocaleDateString('es', { month: 'short' });
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-accent-blue' };
  if (bmi < 25) return { label: 'Normal', color: 'text-accent-green' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-accent-orange' };
  return { label: 'Obese', color: 'text-accent-red' };
}

/* ─── Tabs ─── */
const TABS = [
  { key: 'weight', label: 'Peso', icon: Scale },
  { key: 'measurements', label: 'Medidas', icon: Ruler },
  { key: 'photos', label: 'Fotos', icon: Image },
  { key: 'analysis', label: 'Analisis', icon: BarChart3 },
];

const TIME_RANGES = ['7D', '30D', '90D', '1Y', 'TODO'];

/* ─── Demo measurements data ─── */
const MEASUREMENTS = [
  { label: 'Cintura', value: 86, change: -1.5, unit: 'cm' },
  { label: 'Pecho', value: 102, change: 0, unit: 'cm' },
  { label: 'Brazo', value: 36, change: 0.5, unit: 'cm' },
  { label: 'Muslo', value: 58, change: 1.0, unit: 'cm' },
  { label: 'Cadera', value: 98, change: -0.5, unit: 'cm' },
  { label: 'Cuello', value: 40, change: 0.5, unit: 'cm' },
];

const BODY_COMP = {
  weight: 81.2,
  bodyFat: 17.5,
  leanMass: 82.5,
  bmi: 27.5,
};

/* ─── Photo data ─── */
const PROGRESS_PHOTOS = [
  { id: 1, date: '2024-01-15', type: 'front' as const },
  { id: 2, date: '2024-01-15', type: 'side' as const },
  { id: 3, date: '2024-01-15', type: 'back' as const },
  { id: 4, date: '2024-01-08', type: 'front' as const },
  { id: 5, date: '2024-01-08', type: 'side' as const },
  { id: 6, date: '2024-01-01', type: 'front' as const },
  { id: 7, date: '2024-01-01', type: 'side' as const },
  { id: 8, date: '2023-12-25', type: 'front' as const },
];

const PHOTO_TYPE_COLORS: Record<string, string> = {
  front: 'bg-accent-blue',
  side: 'bg-accent-green',
  back: 'bg-accent-orange',
};

const PHOTO_CATEGORIES = ['All', 'Front', 'Side', 'Back'];

/* ─── Sparkline component ─── */
function MiniSparkline({ data, color = '#00E676', height = 30 }: { data: number[]; color?: string; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Weight Tab ─── */
function WeightTab() {
  const [timeRange, setTimeRange] = useState('30D');
  const [weightInput, setWeightInput] = useState('81.2');
  const weightLogs = useStore((s) => s.weightLogs);
  const addWeight = useStore((s) => s.addWeight);

  const chartData = useMemo(() => {
    let data = [...weightLogs];
    if (timeRange === '7D') data = data.slice(-7);
    else if (timeRange === '30D') data = data.slice(-30);
    else if (timeRange === '90D') data = data.slice(-90);
    return computeMovingAverage(data, 7);
  }, [weightLogs, timeRange]);

  const latest = weightLogs[weightLogs.length - 1];
  const previous = weightLogs[weightLogs.length - 8];
  const weeklyChange = previous ? Math.round((latest.weight - previous.weight) * 10) / 10 : 0;
  const isDown = weeklyChange <= 0;
  const goalWeight = USER_PROFILE.goalWeight;

  const handleQuickAdjust = (delta: number) => {
    setWeightInput((prev) => {
      const val = parseFloat(prev) || 0;
      return (val + delta).toFixed(1);
    });
  };

  const handleLog = () => {
    const w = parseFloat(weightInput);
    if (!w) return;
    addWeight({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      weight: w,
      unit: 'kg',
    });
  };

  const weightSparklineData = weightLogs.slice(-7).map((e) => e.weight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Hero Weight */}
      <div className="text-center py-4">
        <motion.div
          className="flex items-baseline justify-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[48px] font-bold text-text-primary tabular-nums leading-none tracking-tight">
            {latest?.weight ?? 81.2}
          </span>
          <span className="text-[18px] font-semibold text-text-secondary">kg</span>
        </motion.div>
        <motion.div
          className="flex items-center justify-center gap-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isDown ? (
            <TrendingDown size={16} className="text-accent-green" />
          ) : (
            <TrendingUp size={16} className="text-accent-orange" />
          )}
          <span className={isDown ? 'text-accent-green text-[13px]' : 'text-accent-orange text-[13px]'}>
            {isDown ? '' : '+'}{weeklyChange} kg this week
          </span>
        </motion.div>
        <p className="text-[13px] text-text-muted mt-1">
          Trending: {chartData[chartData.length - 1]?.trend ?? latest?.weight} kg
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center px-4">
        <div className="inline-flex bg-bg-tertiary rounded-xl p-1 gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all',
                timeRange === r
                  ? 'bg-bg-elevated text-text-primary shadow-md'
                  : 'text-text-secondary'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Trend Chart */}
      <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id="weightTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E676" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" horizontal vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDateLabel(v, timeRange)}
              tick={{ fill: '#5A6068', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fill: '#5A6068', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: '#262930',
                border: '1px solid #272A30',
                borderRadius: 12,
                padding: 12,
              }}
              labelStyle={{ color: '#8B9098', fontSize: 11 }}
              itemStyle={{ color: '#F5F6F7', fontSize: 13 }}
              formatter={(value: number, name: string) => {
                if (name === 'trend') return [`${value} kg`, 'Trend'];
                return [`${value} kg`, 'Weight'];
              }}
              labelFormatter={(label: string) => new Date(label + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            />
            <ReferenceLine
              y={goalWeight}
              stroke="#FF9100"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: `Goal: ${goalWeight} kg`, fill: '#FF9100', fontSize: 11, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="trend"
              stroke="#00E676"
              strokeWidth={2.5}
              fill="url(#weightTrendFill)"
              dot={false}
              activeDot={{ r: 4, fill: '#00E676' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8B9098"
              strokeWidth={1.5}
              dot={{ r: 3, fill: '#8B9098' }}
              activeDot={{ r: 5, fill: '#F5F6F7' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Log */}
      <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Log Weight</span>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center bg-bg-tertiary rounded-xl px-4 h-14 flex-1">
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="bg-transparent text-[22px] font-semibold text-text-primary text-center w-full outline-none tabular-nums"
              step="0.1"
            />
            <span className="text-[13px] text-text-muted ml-1">kg</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLog}
            className="h-14 px-6 bg-accent-green rounded-xl text-[15px] font-semibold text-[#0F1215]"
          >
            Log
          </motion.button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          {[-0.5, -0.1, +0.1, +0.5].map((delta) => (
            <button
              key={delta}
              onClick={() => handleQuickAdjust(delta)}
              className="px-3 py-1.5 bg-bg-tertiary rounded-lg text-[13px] text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              {delta > 0 ? '+' : ''}{delta}
            </button>
          ))}
        </div>
      </div>

      {/* 7-Day Weight Slider */}
      <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Last 7 Days</span>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <MiniSparkline data={weightSparklineData} color="#00E676" height={30} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>{Math.min(...weightSparklineData).toFixed(1)} kg</span>
            <span>{Math.max(...weightSparklineData).toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      {/* Body Composition Grid */}
      <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Body Composition</span>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-bg-tertiary rounded-xl p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">Weight</p>
            <p className="text-[18px] font-semibold text-text-primary mt-1">{BODY_COMP.weight} kg</p>
          </div>
          <div className="bg-bg-tertiary rounded-xl p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">Lean Mass</p>
            <p className="text-[18px] font-semibold text-accent-green mt-1">
              {((BODY_COMP.weight * BODY_COMP.leanMass) / 100).toFixed(1)} kg
            </p>
            <p className="text-[11px] text-text-muted">({BODY_COMP.leanMass}%)</p>
          </div>
          <div className="bg-bg-tertiary rounded-xl p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">Body Fat</p>
            <p className="text-[18px] font-semibold text-accent-orange mt-1">
              {((BODY_COMP.weight * BODY_COMP.bodyFat) / 100).toFixed(1)} kg
            </p>
            <p className="text-[11px] text-text-muted">({BODY_COMP.bodyFat}%)</p>
          </div>
          <div className="bg-bg-tertiary rounded-xl p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">IMC</p>
            <p className="text-[18px] font-semibold text-text-primary mt-1">{BODY_COMP.bmi}</p>
            <p className={cn('text-[11px]', getBMICategory(BODY_COMP.bmi).color)}>
              {getBMICategory(BODY_COMP.bmi).label}
            </p>
            {/* BMI Gauge */}
            <div className="mt-2 h-1 bg-bg-secondary rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[20%] bg-accent-blue rounded-full" />
              <div className="absolute inset-y-0 left-[20%] w-[40%] bg-accent-green rounded-full" />
              <div className="absolute inset-y-0 left-[60%] w-[25%] bg-accent-orange rounded-full" />
              <div className="absolute inset-y-0 left-[85%] w-[15%] bg-accent-red rounded-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-text-primary"
                style={{ left: `${Math.min(100, (BODY_COMP.bmi / 40) * 100)}%`, transform: 'translate(-50%, -50%) rotate(180deg)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Measurements Tab ─── */
function MeasurementsTab() {
  const [editingMeasurement, setEditingMeasurement] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSave = () => {
    setEditingMeasurement(null);
    setEditValue('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Body Measurements</span>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {MEASUREMENTS.map((m, i) => (
            <motion.button
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setEditingMeasurement(m.label);
                setEditValue(m.value.toString());
              }}
              className="bg-bg-tertiary rounded-xl p-3 text-left"
            >
              <p className="text-[11px] text-text-muted uppercase tracking-wide">{m.label}</p>
              <p className="text-[18px] font-semibold text-text-primary mt-1">
                {m.value} {m.unit}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {m.change < 0 ? (
                  <>
                    <TrendingDown size={12} className="text-accent-green" />
                    <span className="text-[11px] text-accent-green">{m.change} {m.unit}</span>
                  </>
                ) : m.change > 0 ? (
                  <>
                    <TrendingUp size={12} className="text-accent-orange" />
                    <span className="text-[11px] text-accent-orange">+{m.change} {m.unit}</span>
                  </>
                ) : (
                  <>
                    <Minus size={12} className="text-text-muted" />
                    <span className="text-[11px] text-text-muted">0 {m.unit}</span>
                  </>
                )}
              </div>
              <MiniSparkline
                data={[m.value - m.change * 3, m.value - m.change * 2, m.value - m.change, m.value]}
                color={m.change < 0 ? '#00E676' : m.change > 0 ? '#FF9100' : '#5A6068'}
                height={24}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Edit Bottom Sheet */}
      <AnimatePresence>
        {editingMeasurement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setEditingMeasurement(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full bg-bg-secondary rounded-t-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[22px] font-semibold text-text-primary">{editingMeasurement}</h3>
                <button
                  onClick={() => setEditingMeasurement(null)}
                  className="p-2 rounded-full bg-bg-tertiary"
                >
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              <p className="text-[36px] font-bold text-text-primary tabular-nums">
                {editValue} <span className="text-[18px] text-text-secondary font-semibold">cm</span>
              </p>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-14 bg-bg-tertiary rounded-xl text-[22px] font-semibold text-text-primary text-center outline-none tabular-nums"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="w-full h-14 bg-accent-green rounded-xl text-[16px] font-semibold text-[#0F1215]"
              >
                Save
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Photos Tab ─── */
function PhotosTab() {
  const [photoFilter, setPhotoFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const filteredPhotos = PROGRESS_PHOTOS.filter(
    (p) => photoFilter === 'All' || p.type.toLowerCase() === photoFilter.toLowerCase()
  );

  const selectedData = PROGRESS_PHOTOS.find((p) => p.id === selectedPhoto);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Photo Categories Filter */}
      <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
        {PHOTO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setPhotoFilter(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all',
              photoFilter === cat
                ? 'bg-accent-green text-[#0F1215]'
                : 'bg-bg-secondary text-text-secondary border border-divider'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="px-4 grid grid-cols-2 gap-2">
        {filteredPhotos.map((photo, i) => (
          <motion.button
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedPhoto(photo.id);
              setSliderPos(50);
            }}
            className="relative rounded-xl overflow-hidden aspect-[3/4] bg-bg-secondary"
          >
            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
              <Camera size={32} className="text-text-muted opacity-30" />
            </div>
            <div className="absolute bottom-2 left-2 glass rounded-full px-2 py-1">
              <span className="text-[11px] text-text-primary">
                {new Date(photo.date + 'T00:00:00').toLocaleDateString('es', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className={cn('absolute top-2 right-2 w-2.5 h-2.5 rounded-full', PHOTO_TYPE_COLORS[photo.type])} />
          </motion.button>
        ))}
      </div>

      {/* Full-screen Photo Viewer */}
      <AnimatePresence>
        {selectedPhoto && selectedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <button onClick={() => { setSelectedPhoto(null); setCompareMode(false); }} className="p-2 rounded-full bg-bg-glass">
                <X size={20} className="text-text-primary" />
              </button>
              <span className="text-[13px] text-text-primary">
                {new Date(selectedData.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-medium',
                  compareMode ? 'bg-accent-green text-[#0F1215]' : 'bg-bg-glass text-text-primary'
                )}
              >
                Compare
              </button>
            </div>

            {/* Photo display */}
            <div className="relative w-full h-full flex items-center justify-center">
              {compareMode ? (
                /* Comparison Mode with draggable divider */
                <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center px-4">
                  <div className="relative w-full h-full max-w-md mx-auto">
                    {/* Reference photo (first photo) */}
                    <div className="absolute inset-0 bg-bg-tertiary rounded-xl flex items-center justify-center">
                      <Camera size={48} className="text-text-muted opacity-30" />
                      <span className="absolute bottom-4 left-4 text-[11px] text-text-muted">Reference</span>
                    </div>
                    {/* Current photo with clip */}
                    <div
                      className="absolute inset-0 bg-bg-secondary rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <Camera size={48} className="text-accent-green opacity-30" />
                      <span className="absolute bottom-4 left-4 text-[11px] text-accent-green">Current</span>
                    </div>
                    {/* Slider divider */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-accent-green cursor-ew-resize z-10"
                      style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                      onTouchMove={(e) => {
                        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (rect) {
                          const x = e.touches[0].clientX - rect.left;
                          setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
                        }
                      }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!rect) return;
                        const handleMove = (ev: MouseEvent) => {
                          const x = ev.clientX - rect.left;
                          setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
                        };
                        const handleUp = () => {
                          document.removeEventListener('mousemove', handleMove);
                          document.removeEventListener('mouseup', handleUp);
                        };
                        document.addEventListener('mousemove', handleMove);
                        document.addEventListener('mouseup', handleUp);
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent-green flex items-center justify-center">
                        <ChevronLeft size={12} className="text-[#0F1215]" />
                        <ChevronRight size={12} className="text-[#0F1215]" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[70vh] bg-bg-tertiary flex items-center justify-center mx-4 rounded-xl">
                  <Camera size={64} className="text-text-muted opacity-30" />
                </div>
              )}
            </div>

            {/* Bottom nav dots */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
              {PROGRESS_PHOTOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhoto(p.id)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    p.id === selectedPhoto ? 'bg-accent-green w-4' : 'bg-text-muted/40'
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Analysis Tab ─── */
function AnalysisTab() {
  const weightLogs = useStore((s) => s.weightLogs);
  const latest = weightLogs[weightLogs.length - 1];
  const first = weightLogs[0];
  const totalChange = latest && first ? Math.round((latest.weight - first.weight) * 10) / 10 : -1.2;
  const weeks = 4;
  const weeklyRate = totalChange / weeks;
  const remaining = latest ? Math.round((latest.weight - USER_PROFILE.goalWeight) * 10) / 10 : 3.2;
  const projectedWeeks = weeklyRate < 0 ? Math.ceil(Math.abs(remaining / weeklyRate)) : 0;

  const insights = [
    `Has perdido ${Math.abs(totalChange)}kg en ${weeks * 7} dias. Promedio semanal: ${Math.abs(weeklyRate).toFixed(2)}kg`,
    `Tu tendencia de peso es estable con una ligera bajada. Manten el deficit calorico.`,
    `Tu IMC es ${BODY_COMP.bmi} (${getBMICategory(BODY_COMP.bmi).label}). Objetivo: ${USER_PROFILE.goalWeight}kg`,
  ];

  const summaryCards = [
    { label: 'Weight Change', value: `${totalChange > 0 ? '+' : ''}${totalChange} kg`, sub: 'since start', color: totalChange <= 0 ? 'text-accent-green' : 'text-accent-orange' },
    { label: 'Weekly Rate', value: `${weeklyRate > 0 ? '+' : ''}${weeklyRate.toFixed(2)} kg`, sub: 'per week', color: weeklyRate <= 0 ? 'text-accent-green' : 'text-accent-orange' },
    { label: 'Projected', value: `${projectedWeeks} weeks`, sub: `to ${USER_PROFILE.goalWeight}kg`, color: 'text-accent-blue' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Summary Cards */}
      <div className="mx-4 grid grid-cols-3 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.25 }}
            className="bg-bg-secondary rounded-2xl border border-divider p-3 text-center"
          >
            <p className="text-[11px] text-text-muted uppercase tracking-wide">{card.label}</p>
            <p className={cn('text-[16px] font-semibold mt-1', card.color)}>{card.value}</p>
            <p className="text-[11px] text-text-muted">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <div className="mx-4 space-y-3">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Insights</span>
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="bg-bg-secondary rounded-xl border-l-[3px] border-l-accent-green p-4 border border-divider"
          >
            <div className="flex items-start gap-3">
              <Info size={16} className="text-accent-green mt-0.5 shrink-0" />
              <p className="text-[13px] text-text-primary leading-relaxed">{insight}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Body Composition Trend */}
      <div className="mx-4 bg-bg-secondary rounded-2xl border border-divider p-4">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">Composition Trend</span>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={[
              { date: 'Week 1', lean: 66.5, fat: 14.7 },
              { date: 'Week 2', lean: 66.7, fat: 14.5 },
              { date: 'Week 3', lean: 66.8, fat: 14.3 },
              { date: 'Week 4', lean: 66.9, fat: 14.2 },
            ]}
            margin={{ top: 5, right: 5, bottom: 5, left: -10 }}
          >
            <defs>
              <linearGradient id="leanFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E676" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fatFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9100" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#FF9100" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" horizontal vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip
              contentStyle={{ background: '#262930', border: '1px solid #272A30', borderRadius: 12, padding: 12 }}
              labelStyle={{ color: '#8B9098', fontSize: 11 }}
              itemStyle={{ color: '#F5F6F7', fontSize: 13 }}
            />
            <Area type="monotone" dataKey="lean" stackId="1" stroke="#00E676" strokeWidth={2} fill="url(#leanFill)" name="Lean Mass" />
            <Area type="monotone" dataKey="fat" stackId="1" stroke="#FF9100" strokeWidth={2} fill="url(#fatFill)" name="Fat Mass" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ─── Main Progress Page ─── */
export default function Progress() {
  const [activeTab, setActiveTab] = useState('weight');
  const navigate = useNavigate();

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
          <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">PROGRESO</h1>
          <button className="p-2 -mr-2 touch-target">
            <Camera size={20} className="text-text-primary" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-4 pb-2 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                  isActive
                    ? 'bg-bg-elevated text-text-primary shadow-md'
                    : 'text-text-secondary'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-4 pb-4">
        <AnimatePresence mode="wait">
          {activeTab === 'weight' && <WeightTab key="weight" />}
          {activeTab === 'measurements' && <MeasurementsTab key="measurements" />}
          {activeTab === 'photos' && <PhotosTab key="photos" />}
          {activeTab === 'analysis' && <AnalysisTab key="analysis" />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
