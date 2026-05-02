import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  Play,
  CheckCircle,
  Dumbbell,
  Search,
  X,
  Plus,
  Minus,
  Trophy,
  Check,
  Star,
  Pause,
  Timer,
  ChevronRight,
} from 'lucide-react';
import {
  WORKOUTS,
  EXERCISE_LIBRARY,
  WEEKLY_CONSISTENCY,
} from '@/lib/mockData';
import type { WorkoutEntry, ExerciseEntry, Exercise } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

/* ───────────────────── helpers ───────────────────── */

const easeDefault = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];
const easeSpring = { type: 'spring' as const, stiffness: 400, damping: 30 };

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calculateVolume(workout: WorkoutEntry) {
  return workout.exercises.reduce((vol, ex) => {
    return vol + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0);
  }, 0);
}

const PPL_SCHEDULE = [
  { day: 'Lunes', name: 'Push Day A', type: 'push' as const, focus: 'Pecho, Hombros, Tríceps' },
  { day: 'Martes', name: 'Pull Day A', type: 'pull' as const, focus: 'Espalda, Bíceps' },
  { day: 'Miércoles', name: 'Leg Day A', type: 'legs' as const, focus: 'Cuádriceps, Glúteos' },
  { day: 'Jueves', name: 'Push Day B', type: 'push' as const, focus: 'Hombros, Pecho' },
  { day: 'Viernes', name: 'Pull Day B', type: 'pull' as const, focus: 'Espalda, Bíceps' },
  { day: 'Sábado', name: 'Leg Day B', type: 'legs' as const, focus: 'Isquiotibiales, Pantorrillas' },
  { day: 'Domingo', name: 'Rest Day', type: 'rest' as const, focus: 'Recuperación' },
];

const TYPE_COLORS: Record<string, string> = {
  push: '#FF9100',
  pull: '#00E676',
  legs: '#2979FF',
  rest: '#7C4DFF',
};

const TAB_NAMES = ['Rutina', 'Calendario', 'Historial', 'Ejercicios'];


/* ═══════════════════ SEGMENTED CONTROL ═══════════════════ */

function SegmentedControl({
  tabs,
  activeIndex,
  onChange,
}: {
  tabs: string[];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex bg-bg-tertiary rounded-xl p-1 gap-1">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          className="relative flex-1 flex items-center justify-center py-2 px-1 rounded-lg text-[12px] font-medium transition-colors"
          style={{ zIndex: 1 }}
        >
          {i === activeIndex && (
            <motion.div
              layoutId="active-tab-pill"
              className="absolute inset-0 bg-bg-elevated rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
              transition={easeSpring}
              style={{ zIndex: -1 }}
            />
          )}
          <span className={i === activeIndex ? 'text-text-primary' : 'text-text-secondary'}>
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════ ROUTINE TAB ═══════════════════ */

function RoutineTab({
  onStartWorkout,
}: {
  onStartWorkout: (workout: WorkoutEntry) => void;
}) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const workoutTypeMap: Record<string, WorkoutEntry[]> = {};
  WORKOUTS.forEach((w) => {
    if (!workoutTypeMap[w.workoutType]) workoutTypeMap[w.workoutType] = [];
    workoutTypeMap[w.workoutType].push(w);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: easeDefault }}
      className="space-y-3"
    >
      <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-wide">
        Semana Actual — PPL Split
      </h3>
      {PPL_SCHEDULE.map((day, idx) => {
        const isToday = idx === todayIndex;
        const isCompleted = WEEKLY_CONSISTENCY[idx]?.completed ?? false;
        const isExpanded = expandedDay === idx;
        const typeColor = TYPE_COLORS[day.type] || '#5A6068';
        const exerciseCount = day.type === 'rest' ? 0 : 6;
        const estMinutes = day.type === 'rest' ? 0 : 50 + Math.floor(Math.random() * 15);

        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3, ease: easeDefault }}
            className="bg-bg-secondary border border-divider rounded-2xl overflow-hidden"
            style={{ borderTopWidth: 3, borderTopColor: typeColor }}
          >
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setExpandedDay(isExpanded ? null : idx)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: isToday ? `${typeColor}20` : 'transparent',
                    color: isToday ? typeColor : '#8B9098',
                    border: isToday ? `2px solid ${typeColor}` : '2px solid #272A30',
                  }}
                >
                  {isCompleted ? <Check size={18} style={{ color: '#00E676' }} /> : day.day.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-text-primary">
                      {day.day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green uppercase tracking-wide">
                        Hoy
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-text-secondary">
                    {day.name} • {day.focus}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {day.type !== 'rest' && (
                  <span className="text-[11px] text-text-muted">
                    {exerciseCount} ejercicios • ~{estMinutes} min
                  </span>
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} className="text-text-muted" />
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && day.type !== 'rest' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeDefault }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 border-t border-divider pt-3">
                    <RoutineExerciseList workoutType={day.type} />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const mockWorkout: WorkoutEntry = {
                          id: Date.now(),
                          date: new Date().toISOString().split('T')[0],
                          routineName: day.name,
                          workoutType: day.type,
                          exercises: getExercisesForType(day.type),
                          durationMinutes: 0,
                          completed: false,
                          totalVolume: 0,
                        };
                        onStartWorkout(mockWorkout);
                      }}
                      className="w-full mt-3 py-3 rounded-xl bg-accent-green text-[#0F1215] font-semibold text-[15px] flex items-center justify-center gap-2"
                    >
                      <Play size={18} fill="#0F1215" />
                      Iniciar Entrenamiento
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function RoutineExerciseList({ workoutType }: { workoutType: string }) {
  const exercises = getExercisesForType(workoutType);
  return (
    <div className="space-y-2">
      {exercises.map((ex, i) => (
        <motion.div
          key={ex.exerciseId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between py-2 px-3 rounded-xl bg-bg-tertiary"
        >
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-text-muted w-5">{i + 1}.</span>
            <div>
              <p className="text-[14px] font-medium text-text-primary">{ex.exerciseName}</p>
              <p className="text-[11px] text-text-muted capitalize">{ex.muscleGroup}</p>
            </div>
          </div>
          <span className="text-[12px] text-text-secondary">
            {ex.sets.length}×{getTargetReps(ex.exerciseName)} @{ex.sets[0]?.weight || 0}kg
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function getTargetReps(name: string): string {
  if (name.includes('Deadlift')) return '5-8';
  if (name.includes('Curl') || name.includes('Raise')) return '10-12';
  if (name.includes('Face') || name.includes('Fly')) return '12-15';
  if (name.includes('Pull') || name.includes('Up')) return '8-12';
  return '8-12';
}

function getExercisesForType(type: string): ExerciseEntry[] {
  const completedWorkout = WORKOUTS.find((w) => w.workoutType === type && w.completed);
  if (completedWorkout) {
    return completedWorkout.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, completed: false, reps: 0, weight: 0 })),
    }));
  }
  // Fallback exercises
  const fallbacks: Record<string, ExerciseEntry[]> = {
    push: [
      { exerciseId: 1, exerciseName: 'Bench Press', muscleGroup: 'chest', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 120 },
      { exerciseId: 9, exerciseName: 'Overhead Press', muscleGroup: 'shoulders', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 90 },
      { exerciseId: 3, exerciseName: 'Incline DB Press', muscleGroup: 'chest', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 90 },
      { exerciseId: 11, exerciseName: 'Lateral Raises', muscleGroup: 'shoulders', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
      { exerciseId: 15, exerciseName: 'Tricep Pushdown', muscleGroup: 'triceps', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
      { exerciseId: 5, exerciseName: 'Cable Fly', muscleGroup: 'chest', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
    ],
    pull: [
      { exerciseId: 22, exerciseName: 'Lat Pulldown', muscleGroup: 'back', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 90 },
      { exerciseId: 20, exerciseName: 'Barbell Row', muscleGroup: 'back', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 90 },
      { exerciseId: 14, exerciseName: 'Face Pulls', muscleGroup: 'rear_delts', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
      { exerciseId: 28, exerciseName: 'Hammer Curl', muscleGroup: 'biceps', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
      { exerciseId: 29, exerciseName: 'Preacher Curl', muscleGroup: 'biceps', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
      { exerciseId: 19, exerciseName: 'Deadlift', muscleGroup: 'back', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 150 },
    ],
    legs: [
      { exerciseId: 31, exerciseName: 'Squat', muscleGroup: 'quads', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 150 },
      { exerciseId: 34, exerciseName: 'Romanian Deadlift', muscleGroup: 'hamstrings', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 120 },
      { exerciseId: 32, exerciseName: 'Leg Press', muscleGroup: 'quads', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 90 },
      { exerciseId: 35, exerciseName: 'Leg Curl', muscleGroup: 'hamstrings', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
      { exerciseId: 39, exerciseName: 'Calf Raises', muscleGroup: 'calves', sets: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 45 },
      { exerciseId: 36, exerciseName: 'Walking Lunges', muscleGroup: 'quads', sets: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, reps: 0, weight: 0, completed: false })), restSeconds: 60 },
    ],
  };
  return fallbacks[type] || [];
}

/* ═══════════════════ SCHEDULE TAB ═══════════════════ */

function ScheduleTab() {
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: easeDefault }}
      className="space-y-4"
    >
      <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-wide">
        Calendario Semanal
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted uppercase tracking-wide">
            {d}
          </div>
        ))}
        {PPL_SCHEDULE.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isCompleted = WEEKLY_CONSISTENCY[idx]?.completed ?? false;
          const typeColor = TYPE_COLORS[day.type] || '#5A6068';

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(idx)}
              className="aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-1 relative"
              style={{
                backgroundColor: isToday ? `${typeColor}15` : '#181A20',
                border: `1.5px solid ${isToday ? typeColor : '#272A30'}`,
              }}
            >
              <span
                className="text-[11px] font-semibold"
                style={{ color: isToday ? typeColor : '#F5F6F7' }}
              >
                {idx + 1}
              </span>
              <span
                className="text-[9px] font-medium uppercase"
                style={{ color: typeColor }}
              >
                {day.type === 'rest' ? 'Rest' : day.type}
              </span>
              {isCompleted && (
                <div className="absolute top-1 right-1">
                  <Check size={10} style={{ color: '#00E676' }} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 16, height: 0 }}
            transition={{ duration: 0.3, ease: easeDefault }}
            className="overflow-hidden"
          >
            <DayDetail
              day={PPL_SCHEDULE[selectedDay]}
              dayIndex={selectedDay}
              todayIndex={todayIndex}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DayDetail({
  day,
  dayIndex,
  todayIndex,
}: {
  day: (typeof PPL_SCHEDULE)[0];
  dayIndex: number;
  todayIndex: number;
}) {
  const isToday = dayIndex === todayIndex;
  const isCompleted = WEEKLY_CONSISTENCY[dayIndex]?.completed ?? false;
  const typeColor = TYPE_COLORS[day.type] || '#5A6068';

  return (
    <div
      className="bg-bg-secondary border border-divider rounded-2xl p-4"
      style={{ borderLeftWidth: 3, borderLeftColor: typeColor }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[16px] font-semibold text-text-primary">
          {day.name}
        </h4>
        {isToday && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green uppercase tracking-wide font-medium">
            Hoy
          </span>
        )}
        {isCompleted && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green uppercase tracking-wide font-medium flex items-center gap-1">
            <Check size={10} /> Completado
          </span>
        )}
      </div>
      <p className="text-[13px] text-text-secondary mb-1">
        {day.focus}
      </p>
      {day.type !== 'rest' ? (
        <p className="text-[12px] text-text-muted">
          6 ejercicios • ~50-60 min
        </p>
      ) : (
        <p className="text-[12px] text-text-muted">
          Día de descanso y recuperación
        </p>
      )}
    </div>
  );
}

/* ═══════════════════ HISTORY TAB ═══════════════════ */

function HistoryTab() {
  const [filter, setFilter] = useState('all');
  const filtered = WORKOUTS.filter((w) => {
    if (filter === 'all') return w.completed && w.workoutType !== 'rest';
    return w.completed && w.workoutType === filter;
  });

  const chartData = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((w) => ({
          date: new Date(w.date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
          volume: w.totalVolume || calculateVolume(w),
          duration: w.durationMinutes,
        })),
    [filtered]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: easeDefault }}
      className="space-y-4"
    >
      {/* Volume Chart */}
      {chartData.length > 0 && (
        <div className="bg-bg-secondary border border-divider rounded-2xl p-4">
          <h3 className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-3">
            Progresión de Volumen
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
                <XAxis dataKey="date" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#262930',
                    border: '1px solid #272A30',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="volume" stroke="#00E676" strokeWidth={2} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'push', label: 'Push' },
          { key: 'pull', label: 'Pull' },
          { key: 'legs', label: 'Legs' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-accent-green text-[#0F1215]'
                : 'bg-bg-tertiary text-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Workout List */}
      <div className="space-y-3">
        {filtered.map((workout, i) => {
          const vol = workout.totalVolume || calculateVolume(workout);
          const hasPR = workout.routineName.includes('Pull') || workout.routineName.includes('Push');
          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileTap={{ scale: 0.98 }}
              className="bg-bg-secondary border border-divider rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium text-text-primary">
                  {workout.routineName}
                </span>
                <span className="text-[12px] text-text-muted">
                  {new Date(workout.date).toLocaleDateString('es', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex gap-1 mb-2">
                    {workout.exercises.map((ex, ei) => (
                      <div
                        key={ei}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: ex.sets.every((s) => s.completed)
                            ? '#00E676'
                            : '#272A30',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                  <span>{vol.toLocaleString()} kg</span>
                  <span>{workout.durationMinutes} min</span>
                  <span>{workout.exercises.length} ejercicios</span>
                </div>
                {hasPR && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-yellow/10 text-accent-yellow font-medium flex items-center gap-1">
                    <Star size={10} /> PR
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════ EXERCISES TAB ═══════════════════ */

function ExercisesTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = [
    'all',
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'legs',
    'abs',
    'core',
  ];

  const filtered = EXERCISE_LIBRARY.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || ex.muscleGroups.includes(category);
    return matchSearch && matchCat;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: easeDefault }}
      className="space-y-4"
    >
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar ejercicios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-bg-tertiary text-text-primary text-[14px] placeholder:text-text-muted border border-divider focus:border-accent-green focus:outline-none transition-colors"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap capitalize transition-colors ${
              category === cat
                ? 'bg-accent-green text-[#0F1215]'
                : 'bg-bg-tertiary text-text-secondary'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((ex, i) => (
            <ExerciseCard key={ex.id} exercise={ex} index={i} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-[14px]">
            No se encontraron ejercicios
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const [expanded, setExpanded] = useState(false);
  // Mock personal best
  const mockPB = Math.floor(40 + Math.random() * 80);
  const mockReps = Math.floor(6 + Math.random() * 8);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="bg-bg-secondary border border-divider rounded-2xl overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
          <Dumbbell size={20} className="text-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-text-primary truncate">{exercise.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            {exercise.muscleGroups.slice(0, 2).map((mg) => (
              <span
                key={mg}
                className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary capitalize"
              >
                {mg}
              </span>
            ))}
            <span className="text-[10px] text-text-muted capitalize">{exercise.equipment}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[11px] text-accent-yellow font-medium">
            PB: {mockPB}kg × {mockReps}
          </p>
          <p className="text-[10px] text-text-muted">
            1RM: {Math.round(mockPB * (1 + mockReps / 30))}kg
          </p>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-divider"
          >
            <div className="p-3 space-y-2">
              <div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">
                  Músculos
                </p>
                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroups.map((mg) => (
                    <span
                      key={mg}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary capitalize"
                    >
                      {mg}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-secondary">
                  Equipo: <span className="text-text-primary capitalize">{exercise.equipment}</span>
                </span>
                <span className="text-text-secondary">
                  Dificultad: <span className="text-text-primary capitalize">{exercise.difficulty}</span>
                </span>
              </div>
              <div className="pt-1">
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1">
                  Consejos de Forma
                </p>
                <ul className="text-[12px] text-text-secondary space-y-1">
                  <li className="flex items-start gap-1.5">
                    <Check size={12} className="text-accent-green mt-0.5 flex-shrink-0" />
                    Mantén la espalda neutra durante todo el movimiento
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check size={12} className="text-accent-green mt-0.5 flex-shrink-0" />
                    Controla la fase excéntrica (2-3 segundos)
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check size={12} className="text-accent-green mt-0.5 flex-shrink-0" />
                    Respira: exhala en el esfuerzo, inhala en el retorno
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════ ACTIVE WORKOUT OVERLAY ═══════════════════ */

type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

interface LoggedSet {
  id: number;
  setNumber: number;
  reps: number;
  weight: number;
  type: SetType;
  rpe: number;
  completed: boolean;
}

function ActiveWorkout({
  workout,
  onFinish,
}: {
  workout: WorkoutEntry;
  onFinish: (summary: WorkoutSummary) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [setType, setSetType] = useState<SetType>('normal');
  const [rpe, setRpe] = useState(8);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [restTimer, setRestTimer] = useState(0);
  const restDuration = 90;
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const nextExercise = workout.exercises[currentExerciseIndex + 1];

  // Initialize weight from previous/suggested
  useEffect(() => {
    if (currentExercise) {
      const prevSet = loggedSets.filter(
        () =>
          workout.exercises[currentExerciseIndex]?.exerciseName ===
          currentExercise.exerciseName
      );
      const lastWeight = prevSet.length > 0 ? prevSet[prevSet.length - 1].weight : 0;
      setWeight(lastWeight || getSuggestedWeight(currentExercise.exerciseName));
      setReps(getTargetRepMiddle(currentExercise.exerciseName));
    }
  }, [currentExerciseIndex]);

  // Elapsed timer
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  // Rest timer
  useEffect(() => {
    if (restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) {
            if (restRef.current) clearInterval(restRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [restTimer]);

  const handleLogSet = () => {
    if (!currentExercise) return;
    const newSet: LoggedSet = {
      id: Date.now(),
      setNumber:
        loggedSets.filter(
          () =>
            workout.exercises[currentExerciseIndex]?.exerciseName ===
            currentExercise.exerciseName
        ).length + 1,
      reps,
      weight,
      type: setType,
      rpe,
      completed: true,
    };
    setLoggedSets([...loggedSets, newSet]);
    setRestTimer(restDuration);

    // Auto-advance if all sets done
    const currentSets = loggedSets.filter(
      () =>
        workout.exercises[currentExerciseIndex]?.exerciseName ===
        currentExercise.exerciseName
    );
    if (currentSets.length + 1 >= currentExercise.sets.length) {
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setTimeout(() => setCurrentExerciseIndex((i) => i + 1), 500);
      }
    }
  };

  const handleFinish = () => {
    const totalVolume = loggedSets.reduce((v, s) => v + s.reps * s.weight, 0);
    const exerciseCount = new Set(
      loggedSets.map((s) => {
        const ex = workout.exercises.find((_, i) => {
          const setsBefore = workout.exercises
            .slice(0, i)
            .reduce((acc, e) => acc + e.sets.length, 0);
          return loggedSets.indexOf(s) >= setsBefore;
        });
        return ex?.exerciseName || '';
      })
    ).size;

    onFinish({
      totalVolume,
      duration: elapsed,
      exercisesCompleted: Math.max(exerciseCount, 1),
      setsCompleted: loggedSets.length,
      prs: [],
      notes,
      volumeByExercise: [],
    });
  };

  const currentSetsForExercise = loggedSets.filter(
    () =>
      workout.exercises[currentExerciseIndex]?.exerciseName ===
      currentExercise?.exerciseName
  );

  const setTypeColors: Record<SetType, string> = {
    normal: '#00E676',
    warmup: '#8B9098',
    drop: '#FF9100',
    failure: '#FF1744',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-bg-primary flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-bg-secondary border-b border-divider flex-shrink-0">
        <button
          onClick={() => setShowEndConfirm(true)}
          className="flex items-center gap-1 text-accent-red text-[13px] font-medium"
        >
          <X size={16} />
          Terminar
        </button>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-text-primary">
            {workout.routineName}
          </p>
          <p className="text-[13px] text-accent-green tabular-nums">
            {formatTime(elapsed)}
          </p>
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="p-2">
          {isPaused ? <Play size={18} className="text-accent-green" /> : <Pause size={18} className="text-text-secondary" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {currentExercise && (
          <div className="p-4 space-y-4">
            {/* Current Exercise Card */}
            <motion.div
              key={currentExercise.exerciseName}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-bg-secondary border border-divider rounded-2xl p-4 space-y-4"
            >
              <div>
                <h3 className="text-[20px] font-bold text-text-primary">
                  {currentExercise.exerciseName}
                </h3>
                <p className="text-[13px] text-text-secondary capitalize">
                  {currentExercise.muscleGroup} • Set {currentSetsForExercise.length + 1} de{' '}
                  {currentExercise.sets.length}
                </p>
              </div>

              {/* Previous Set Info */}
              {currentSetsForExercise.length > 0 && (
                <div className="bg-bg-tertiary rounded-lg px-3 py-2">
                  <p className="text-[12px] text-text-muted">
                    Anterior: {currentSetsForExercise[currentSetsForExercise.length - 1].reps} reps @{' '}
                    {currentSetsForExercise[currentSetsForExercise.length - 1].weight}kg
                  </p>
                </div>
              )}

              {/* Weight Input */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                  className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-20 text-center text-[36px] font-bold text-text-primary bg-transparent border-b-2 border-divider focus:border-accent-green focus:outline-none tabular-nums"
                  />
                  <p className="text-[12px] text-text-muted mt-1">kg</p>
                </div>
                <button
                  onClick={() => setWeight((w) => w + 2.5)}
                  className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Reps Input */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setReps((r) => Math.max(0, r - 1))}
                  className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <input
                    type="number"
                    value={reps || ''}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="w-20 text-center text-[36px] font-bold text-text-primary bg-transparent border-b-2 border-divider focus:border-accent-green focus:outline-none tabular-nums"
                  />
                  <p className="text-[12px] text-text-muted mt-1">reps</p>
                </div>
                <button
                  onClick={() => setReps((r) => r + 1)}
                  className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* RPE Selector */}
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2 text-center">
                  RPE — {rpe}
                </p>
                <div className="flex justify-center gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                    <button
                      key={val}
                      onClick={() => setRpe(val)}
                      className="w-7 h-7 rounded-full text-[11px] font-medium transition-colors"
                      style={{
                        backgroundColor: val <= rpe ? 'rgba(255,145,0,0.3)' : '#1E2028',
                        color: val <= rpe ? '#FF9100' : '#5A6068',
                        border: val === rpe ? '1.5px solid #FF9100' : '1.5px solid transparent',
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set Type */}
              <div className="flex gap-2">
                {([
                  { key: 'warmup' as SetType, label: 'Warmup' },
                  { key: 'normal' as SetType, label: 'Normal' },
                  { key: 'drop' as SetType, label: 'Drop' },
                  { key: 'failure' as SetType, label: 'Failure' },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setSetType(t.key)}
                    className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor: setType === t.key ? `${setTypeColors[t.key]}20` : '#1E2028',
                      color: setType === t.key ? setTypeColors[t.key] : '#8B9098',
                      border: setType === t.key ? `1.5px solid ${setTypeColors[t.key]}` : '1.5px solid #272A30',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Log Set Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogSet}
                className="w-full py-4 rounded-xl bg-accent-green text-[#0F1215] font-bold text-[16px] flex items-center justify-center gap-2"
              >
                <Check size={20} />
                REGISTRAR SERIE
              </motion.button>
            </motion.div>

            {/* Next Exercise Preview */}
            {nextExercise && (
              <div className="bg-bg-secondary border border-divider rounded-xl p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">Siguiente</p>
                <p className="text-[14px] font-medium text-text-primary">{nextExercise.exerciseName}</p>
                <p className="text-[12px] text-text-secondary">
                  {nextExercise.sets.length}×{getTargetReps(nextExercise.exerciseName)} @{getSuggestedWeight(nextExercise.exerciseName)}kg
                </p>
              </div>
            )}

            {/* Set Overview */}
            <div className="bg-bg-secondary border border-divider rounded-2xl p-4">
              <p className="text-[12px] font-medium text-text-muted uppercase tracking-wide mb-3">
                Series Realizadas
              </p>
              <div className="space-y-2">
                {workout.exercises.map((ex, ei) => {
                  const actualSets = loggedSets.filter((_, idx) => {
                    const setsBefore = workout.exercises
                      .slice(0, ei)
                      .reduce((acc, e) => acc + e.sets.length, 0);
                    const setsAfter = setsBefore + ex.sets.length;
                    return idx >= setsBefore && idx < setsAfter;
                  });

                  if (actualSets.length === 0 && ei !== currentExerciseIndex) return null;

                  return (
                    <div key={ei} className={ei === currentExerciseIndex ? '' : 'opacity-60'}>
                      <p className="text-[12px] font-medium text-text-secondary mb-1">
                        {ex.exerciseName}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {ex.sets.map((_, si) => {
                          const logged = actualSets[si];
                          return (
                            <div
                              key={si}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium"
                              style={{
                                backgroundColor: logged ? '#00E67620' : '#1E2028',
                                border: `1.5px solid ${logged ? '#00E676' : '#272A30'}`,
                                color: logged ? '#00E676' : '#5A6068',
                              }}
                            >
                              {logged ? (
                                <Check size={14} />
                              ) : ei === currentExerciseIndex &&
                                si === currentSetsForExercise.length ? (
                                <div className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                              ) : (
                                <span>{si + 1}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <textarea
              placeholder="Notas del entrenamiento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 p-3 rounded-xl bg-bg-tertiary text-text-primary text-[14px] placeholder:text-text-muted border border-divider focus:border-accent-green focus:outline-none resize-none"
            />

            {/* Finish Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="w-full py-4 rounded-xl bg-accent-green text-[#0F1215] font-bold text-[16px] flex items-center justify-center gap-2 mb-8"
            >
              <CheckCircle size={20} />
              FINALIZAR ENTRENAMIENTO
            </motion.button>
          </div>
        )}
      </div>

      {/* Rest Timer Banner */}
      <AnimatePresence>
        {restTimer > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-bg-elevated border-t-[3px] border-accent-blue px-4 py-3"
            style={{ borderRadius: '24px 24px 0 0' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-accent-blue" />
                <span className="text-[12px] text-text-secondary uppercase tracking-wide">
                  Descanso
                </span>
              </div>
              <motion.span
                key={restTimer}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-[28px] font-bold text-accent-blue tabular-nums"
              >
                {formatTime(restTimer)}
              </motion.span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#2979FF' }}
                initial={{ width: '100%' }}
                animate={{ width: `${(restTimer / restDuration) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setRestTimer(0)}
                className="text-[12px] text-text-secondary font-medium"
              >
                Saltar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setRestTimer((t) => t + 30)}
                  className="text-[12px] text-accent-blue font-medium px-2 py-1 rounded bg-accent-blue/10"
                >
                  +30s
                </button>
                <button
                  onClick={() => setRestTimer((t) => Math.max(0, t - 15))}
                  className="text-[12px] text-text-secondary font-medium px-2 py-1 rounded bg-bg-tertiary"
                >
                  -15s
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-secondary border border-divider rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-[18px] font-bold text-text-primary mb-2">
                ¿Terminar entrenamiento?
              </h3>
              <p className="text-[14px] text-text-secondary mb-6">
                Se guardarán {loggedSets.length} series registradas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-bg-tertiary text-text-primary font-medium text-[14px]"
                >
                  Continuar
                </button>
                <button
                  onClick={() => {
                    setShowEndConfirm(false);
                    handleFinish();
                  }}
                  className="flex-1 py-3 rounded-xl bg-accent-red text-white font-medium text-[14px]"
                >
                  Terminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getSuggestedWeight(name: string): number {
  const defaults: Record<string, number> = {
    'Bench Press': 75,
    'Overhead Press': 45,
    'Incline DB Press': 24,
    'Lateral Raises': 10,
    'Tricep Pushdown': 25,
    'Cable Fly': 15,
    'Lat Pulldown': 50,
    'Barbell Row': 55,
    'Face Pulls': 20,
    'Hammer Curl': 12,
    'Preacher Curl': 18,
    Deadlift: 100,
    Squat: 90,
    'Romanian Deadlift': 70,
    'Leg Press': 150,
    'Leg Curl': 30,
    'Calf Raises': 50,
    'Walking Lunges': 16,
  };
  return defaults[name] || 20;
}

function getTargetRepMiddle(name: string): number {
  if (name.includes('Deadlift')) return 6;
  if (name.includes('Curl') || name.includes('Raise')) return 10;
  if (name.includes('Face') || name.includes('Fly')) return 12;
  return 10;
}

/* ═══════════════════ WORKOUT SUMMARY ═══════════════════ */

interface WorkoutSummary {
  totalVolume: number;
  duration: number;
  exercisesCompleted: number;
  setsCompleted: number;
  prs: string[];
  notes: string;
  volumeByExercise: { name: string; volume: number }[];
}

function WorkoutSummaryView({
  summary,
  workoutName,
  onSave,
  onDiscard,
}: {
  summary: WorkoutSummary;
  workoutName: string;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const volumeData = useMemo(() => {
    // Generate mock volume by exercise data
    const exercises = [
      { name: 'Press Banca', volume: Math.round(summary.totalVolume * 0.25) },
      { name: 'Press Militar', volume: Math.round(summary.totalVolume * 0.18) },
      { name: 'Remo', volume: Math.round(summary.totalVolume * 0.22) },
      { name: 'Curl', volume: Math.round(summary.totalVolume * 0.12) },
      { name: 'Sentadilla', volume: Math.round(summary.totalVolume * 0.23) },
    ].filter((e) => e.volume > 0);
    return exercises;
  }, [summary.totalVolume]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-bg-primary overflow-y-auto scrollbar-hide"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-bg-secondary border-b border-divider">
        <button onClick={onDiscard} className="text-text-secondary text-[13px] font-medium">
          Cerrar
        </button>
        <h2 className="text-[16px] font-bold text-text-primary">Resumen</h2>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-5">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-6"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle size={48} className="text-accent-green mx-auto mb-3" />
          </motion.div>
          <h2 className="text-[22px] font-bold text-text-primary mb-1">
            ¡Entrenamiento Completo!
          </h2>
          <p className="text-[14px] text-text-secondary mb-4">{workoutName}</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[28px] font-bold text-accent-green tabular-nums"
              >
                {formatTime(summary.duration)}
              </motion.p>
              <p className="text-[11px] text-text-muted uppercase tracking-wide">Duración</p>
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[28px] font-bold text-accent-blue tabular-nums"
              >
                {summary.totalVolume.toLocaleString()} kg
              </motion.p>
              <p className="text-[11px] text-text-muted uppercase tracking-wide">Volumen</p>
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[28px] font-bold text-accent-orange tabular-nums"
              >
                {summary.setsCompleted}
              </motion.p>
              <p className="text-[11px] text-text-muted uppercase tracking-wide">Series</p>
            </div>
          </div>
        </motion.div>

        {/* PRs */}
        {summary.prs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-bg-secondary border border-divider rounded-2xl p-4"
          >
            <h3 className="text-[12px] font-medium text-text-muted uppercase tracking-wide mb-3">
              Records Personales
            </h3>
            <div className="space-y-2">
              {summary.prs.map((pr, i) => (
                <div key={i} className="flex items-center gap-2 text-accent-yellow">
                  <Trophy size={16} />
                  <span className="text-[14px] font-medium">{pr}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <h3 className="text-[12px] font-medium text-text-muted uppercase tracking-wide mb-3">
            Volumen por Ejercicio
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#5A6068', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#F5F6F7', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#262930',
                    border: '1px solid #272A30',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" fill="#00E676" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sets Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-bg-secondary border border-divider rounded-2xl p-4"
        >
          <h3 className="text-[12px] font-medium text-text-muted uppercase tracking-wide mb-3">
            Series Completadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: summary.setsCompleted }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.03 }}
                className="w-9 h-9 rounded-lg bg-accent-green/20 flex items-center justify-center"
              >
                <Check size={16} className="text-accent-green" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSave}
            className="flex-1 py-4 rounded-xl bg-accent-green text-[#0F1215] font-bold text-[15px] flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Guardar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onDiscard}
            className="flex-1 py-4 rounded-xl bg-bg-tertiary text-text-primary font-bold text-[15px]"
          >
            Descartar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ HERO CARD ═══════════════════ */

function HeroCard({
  onStartWorkout,
}: {
  onStartWorkout: (w: WorkoutEntry) => void;
}) {
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todaySchedule = PPL_SCHEDULE[todayIndex];
  const typeColor = TYPE_COLORS[todaySchedule.type] || '#5A6068';
  const isCompleted = WEEKLY_CONSISTENCY[todayIndex]?.completed ?? false;
  const todaysWorkout = WORKOUTS.find((w) => {
    const wDay = new Date(w.date).getDay();
    const wIndex = wDay === 0 ? 6 : wDay - 1;
    return wIndex === todayIndex && w.completed;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeDefault }}
      className="bg-bg-secondary border border-divider rounded-2xl p-4"
      style={{ borderTopWidth: 3, borderTopColor: typeColor }}
    >
      <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1">
        Semana 3, Día {todayIndex + 1}
      </p>
      <h2 className="text-[22px] font-bold text-text-primary mb-1">
        {todaySchedule.name}
      </h2>
      <p className="text-[13px] text-text-secondary mb-3">
        {todaySchedule.type === 'rest'
          ? 'Día de descanso'
          : `6 ejercicios • ~50-60 min • ${todaySchedule.focus}`}
      </p>

      {todaySchedule.type !== 'rest' && (
        <>
          <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: typeColor }}
              initial={{ width: 0 }}
              animate={{ width: isCompleted ? '100%' : '0%' }}
              transition={{ duration: 0.6 }}
            />
          </div>

          {isCompleted && todaysWorkout ? (
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-accent-green flex items-center gap-1">
                <CheckCircle size={14} /> Completado hoy
              </p>
              <span className="text-[12px] text-text-secondary">
                {todaysWorkout.totalVolume.toLocaleString()} kg
              </span>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ scale: { repeat: Infinity, duration: 2 } }}
              onClick={() => {
                const mockWorkout: WorkoutEntry = {
                  id: Date.now(),
                  date: new Date().toISOString().split('T')[0],
                  routineName: todaySchedule.name,
                  workoutType: todaySchedule.type,
                  exercises: getExercisesForType(todaySchedule.type),
                  durationMinutes: 0,
                  completed: false,
                  totalVolume: 0,
                };
                onStartWorkout(mockWorkout);
              }}
              className="w-full py-3 rounded-xl bg-accent-green text-[#0F1215] font-semibold text-[14px] flex items-center justify-center gap-2"
            >
              <Play size={16} fill="#0F1215" />
              INICIAR ENTRENAMIENTO
            </motion.button>
          )}
        </>
      )}

      {todaySchedule.type === 'rest' && (
        <p className="text-[13px] text-accent-purple flex items-center gap-1.5">
          <Star size={14} /> Día de recuperación activa
        </p>
      )}
    </motion.div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */

export default function Workouts() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutEntry | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const navigate = useNavigate();

  const handleStartWorkout = useCallback((workout: WorkoutEntry) => {
    setActiveWorkout(workout);
  }, []);

  const handleFinishWorkout = useCallback((ws: WorkoutSummary) => {
    setSummary(ws);
    setActiveWorkout(null);
    setShowSummary(true);
  }, []);

  const handleSaveSummary = useCallback(() => {
    setShowSummary(false);
    setSummary(null);
    setActiveTab(2); // Go to history
  }, []);

  const handleDiscardSummary = useCallback(() => {
    setShowSummary(false);
    setSummary(null);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-divider">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[16px] font-bold text-text-primary tracking-wide">
              WORKOUTS
            </span>
          </h1>
          <button
            onClick={() => setActiveTab(2)}
            className="text-text-secondary p-2"
          >
            <Clock size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Hero Card */}
        <HeroCard onStartWorkout={handleStartWorkout} />

        {/* Tab Navigation */}
        <SegmentedControl tabs={TAB_NAMES} activeIndex={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <RoutineTab key="routine" onStartWorkout={handleStartWorkout} />
          )}
          {activeTab === 1 && <ScheduleTab key="schedule" />}
          {activeTab === 2 && <HistoryTab key="history" />}
          {activeTab === 3 && <ExercisesTab key="exercises" />}
        </AnimatePresence>
      </div>

      {/* Active Workout Overlay */}
      <AnimatePresence>
        {activeWorkout && (
          <ActiveWorkout
            workout={activeWorkout}
            onFinish={handleFinishWorkout}
          />
        )}
      </AnimatePresence>

      {/* Workout Summary */}
      <AnimatePresence>
        {showSummary && summary && (
          <WorkoutSummaryView
            summary={summary}
            workoutName={activeWorkout?.routineName || 'Entrenamiento'}
            onSave={handleSaveSummary}
            onDiscard={handleDiscardSummary}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
