import type {
  WeightLogEntry,
  MealEntry,
  WorkoutEntry,
  HealthDataEntry,
  Exercise,
  UserProfile,
  ExerciseEntry,
  Achievement,
} from '@/types';

export const USER_PROFILE: UserProfile = {
  id: 1,
  name: 'Alex',
  age: 22,
  gender: 'male',
  height: 172,
  currentWeight: 81.5,
  goalWeight: 78,
  activityLevel: 'very_active',
  goal: 'lose',
  targetCalories: 2800,
  targetProtein: 170,
  targetCarbs: 365,
  targetFats: 75,
  dailyStepsGoal: 10000,
  sleepGoal: 8,
  hydrationGoal: 3,
  unitSystem: 'metric',
  createdAt: '2024-01-01',
};

function generateWeightData(): WeightLogEntry[] {
  const entries: WeightLogEntry[] = [];
  const baseDate = new Date('2024-01-15');
  let currentWeight = 82.0;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const fluctuation = (Math.random() - 0.55) * 0.4;
    currentWeight += fluctuation * 0.1;
    currentWeight = Math.max(80.5, Math.min(82.0, currentWeight));
    entries.push({
      id: 30 - i,
      date: date.toISOString().split('T')[0],
      weight: Math.round(currentWeight * 10) / 10,
      unit: 'kg',
    });
  }
  return entries;
}

export const WEIGHT_DATA = generateWeightData();

export const TODAY_NUTRITION = {
  calories: 1850,
  protein: 45,
  carbs: 120,
  fats: 28,
};

export const NUTRITION_TARGETS = {
  calories: 2800,
  protein: 170,
  carbs: 365,
  fats: 75,
};

export const MEALS: MealEntry[] = [
  {
    id: 1,
    date: '2024-01-15',
    mealType: 'breakfast',
    foods: [
      { name: 'Oatmeal (80g dry)', calories: 300, protein: 10, carbs: 54, fats: 6, serving: '1 bowl' },
      { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, serving: '1 medium' },
      { name: 'Whey Protein', calories: 120, protein: 24, carbs: 2, fats: 2, serving: '1 scoop' },
    ],
    totalCalories: 525,
    totalProtein: 35.3,
    totalCarbs: 83,
    totalFats: 8.4,
  },
  {
    id: 2,
    date: '2024-01-15',
    mealType: 'lunch',
    foods: [
      { name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fats: 7, serving: '200g' },
      { name: 'Rice (150g cooked)', calories: 195, protein: 4, carbs: 42, fats: 0.5, serving: '150g' },
      { name: 'Broccoli (100g)', calories: 35, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g' },
    ],
    totalCalories: 560,
    totalProtein: 68.8,
    totalCarbs: 49,
    totalFats: 7.9,
  },
  {
    id: 3,
    date: '2024-01-15',
    mealType: 'dinner',
    foods: [
      { name: 'Salmon Fillet (150g)', calories: 300, protein: 35, carbs: 0, fats: 18, serving: '150g' },
      { name: 'Sweet Potato (150g)', calories: 135, protein: 2, carbs: 31, fats: 0.1, serving: '150g' },
      { name: 'Mixed Vegetables', calories: 60, protein: 2, carbs: 12, fats: 0.5, serving: '150g' },
    ],
    totalCalories: 495,
    totalProtein: 39,
    totalCarbs: 43,
    totalFats: 18.6,
  },
  {
    id: 4,
    date: '2024-01-15',
    mealType: 'snack',
    foods: [
      { name: 'Greek Yogurt (170g)', calories: 100, protein: 17, carbs: 6, fats: 0.7, serving: '170g' },
      { name: 'Almonds (30g)', calories: 170, protein: 6, carbs: 6, fats: 15, serving: '30g' },
    ],
    totalCalories: 270,
    totalProtein: 23,
    totalCarbs: 12,
    totalFats: 15.7,
  },
];

function createExerciseEntry(
  exerciseId: number,
  exerciseName: string,
  muscleGroup: string,
  numSets: number,
  targetReps: string,
  weight: number,
  restSeconds: number,
  completedSets: number = 0
): ExerciseEntry {
  const sets = Array.from({ length: numSets }, (_, i) => ({
    id: i + 1,
    reps: completedSets > i ? parseInt(targetReps.split('-')[1] || targetReps) : 0,
    weight: completedSets > i ? weight : 0,
    completed: completedSets > i,
    rpe: completedSets > i ? 8 : undefined,
  }));
  return {
    exerciseId,
    exerciseName,
    muscleGroup,
    sets,
    restSeconds,
  };
}

export const WORKOUTS: WorkoutEntry[] = [
  {
    id: 1,
    date: '2024-01-15',
    routineName: 'Pull Day B',
    workoutType: 'pull',
    exercises: [
      createExerciseEntry(1, 'Barbell Row', 'back', 4, '8-12', 60, 90, 4),
      createExerciseEntry(2, 'Lat Pulldown', 'back', 4, '8-12', 55, 90, 2),
      createExerciseEntry(3, 'Face Pulls', 'rear_delts', 3, '12-15', 20, 60, 0),
      createExerciseEntry(4, 'Bicep Curls', 'biceps', 4, '8-12', 15, 60, 0),
      createExerciseEntry(5, 'Hammer Curls', 'biceps', 3, '10-12', 12, 60, 0),
      createExerciseEntry(6, 'Deadlift', 'back', 3, '5-8', 100, 120, 0),
    ],
    durationMinutes: 0,
    completed: false,
    totalVolume: 0,
  },
  {
    id: 2,
    date: '2024-01-14',
    routineName: 'Push Day B',
    workoutType: 'push',
    exercises: [
      createExerciseEntry(7, 'Bench Press', 'chest', 4, '8-12', 75, 120, 4),
      createExerciseEntry(8, 'Overhead Press', 'shoulders', 4, '8-12', 50, 90, 4),
      createExerciseEntry(9, 'Incline DB Press', 'chest', 4, '8-12', 28, 90, 4),
      createExerciseEntry(10, 'Lateral Raises', 'shoulders', 4, '12-15', 12, 60, 4),
      createExerciseEntry(11, 'Tricep Pushdown', 'triceps', 4, '10-12', 25, 60, 4),
      createExerciseEntry(12, 'Cable Fly', 'chest', 3, '12-15', 15, 60, 3),
    ],
    durationMinutes: 52,
    completed: true,
    totalVolume: 3450,
  },
  {
    id: 3,
    date: '2024-01-13',
    routineName: 'Legs Day B',
    workoutType: 'legs',
    exercises: [
      createExerciseEntry(13, 'Squat', 'quads', 4, '6-10', 100, 150, 4),
      createExerciseEntry(14, 'Romanian Deadlift', 'hamstrings', 4, '8-12', 80, 120, 4),
      createExerciseEntry(15, 'Leg Press', 'quads', 4, '10-15', 180, 90, 4),
      createExerciseEntry(16, 'Leg Curl', 'hamstrings', 3, '10-12', 35, 60, 3),
      createExerciseEntry(17, 'Calf Raises', 'calves', 4, '12-15', 60, 45, 4),
      createExerciseEntry(18, 'Walking Lunges', 'quads', 3, '10-12', 20, 60, 3),
    ],
    durationMinutes: 58,
    completed: true,
    totalVolume: 5200,
  },
  {
    id: 4,
    date: '2024-01-12',
    routineName: 'Rest Day',
    workoutType: 'rest',
    exercises: [],
    durationMinutes: 0,
    completed: true,
    totalVolume: 0,
  },
  {
    id: 5,
    date: '2024-01-11',
    routineName: 'Pull Day A',
    workoutType: 'pull',
    exercises: [
      createExerciseEntry(19, 'Deadlift', 'back', 3, '5-8', 110, 150, 3),
      createExerciseEntry(20, 'Pull-Ups', 'back', 4, '8-12', 0, 90, 4),
      createExerciseEntry(21, 'Barbell Row', 'back', 4, '8-12', 65, 90, 4),
      createExerciseEntry(22, 'Barbell Curl', 'biceps', 4, '8-12', 18, 60, 4),
      createExerciseEntry(23, 'Preacher Curl', 'biceps', 3, '10-12', 16, 60, 3),
      createExerciseEntry(24, 'Rear Delt Fly', 'rear_delts', 3, '12-15', 10, 60, 3),
    ],
    durationMinutes: 55,
    completed: true,
    totalVolume: 4800,
  },
  {
    id: 6,
    date: '2024-01-10',
    routineName: 'Push Day A',
    workoutType: 'push',
    exercises: [
      createExerciseEntry(25, 'Bench Press', 'chest', 4, '8-12', 80, 120, 4),
      createExerciseEntry(26, 'Incline Bench', 'chest', 4, '8-12', 60, 90, 4),
      createExerciseEntry(27, 'DB Shoulder Press', 'shoulders', 4, '8-12', 24, 90, 4),
      createExerciseEntry(28, 'Lateral Raises', 'shoulders', 4, '12-15', 10, 60, 4),
      createExerciseEntry(29, 'Skull Crushers', 'triceps', 4, '10-12', 20, 60, 4),
      createExerciseEntry(30, 'Cable Fly', 'chest', 3, '12-15', 14, 60, 3),
    ],
    durationMinutes: 50,
    completed: true,
    totalVolume: 3900,
  },
];

export const CURRENT_WORKOUT = WORKOUTS[0];

export function generateStepsData(): HealthDataEntry[] {
  const entries: HealthDataEntry[] = [];
  const baseDate = new Date('2024-01-15');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    entries.push({
      id: 30 - i,
      date: date.toISOString().split('T')[0],
      source: 'samsung',
      steps: Math.floor(8000 + Math.random() * 4000),
    });
  }
  return entries;
}

export function generateSleepData(): HealthDataEntry[] {
  const entries: HealthDataEntry[] = [];
  const baseDate = new Date('2024-01-15');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    entries.push({
      id: 30 - i,
      date: date.toISOString().split('T')[0],
      source: 'samsung',
      sleepHours: Math.round((6.5 + Math.random() * 2) * 10) / 10,
      sleepQuality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as HealthDataEntry['sleepQuality'],
    });
  }
  return entries;
}

export function generateHeartRateData(): HealthDataEntry[] {
  const entries: HealthDataEntry[] = [];
  const baseDate = new Date('2024-01-15');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    entries.push({
      id: 30 - i,
      date: date.toISOString().split('T')[0],
      source: 'samsung',
      restingHeartRate: Math.floor(60 + Math.random() * 12),
      avgHeartRate: Math.floor(68 + Math.random() * 10),
      peakHeartRate: Math.floor(130 + Math.random() * 30),
    });
  }
  return entries;
}

export function generateCaloriesBurnedData(): HealthDataEntry[] {
  const entries: HealthDataEntry[] = [];
  const baseDate = new Date('2024-01-15');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    entries.push({
      id: 30 - i,
      date: date.toISOString().split('T')[0],
      source: 'samsung',
      caloriesBurned: Math.floor(2800 + Math.random() * 400),
    });
  }
  return entries;
}

export function generateIntradayHR(): number[] {
  return Array.from({ length: 24 }, () => Math.floor(62 + Math.random() * 30 + (Math.random() > 0.8 ? 40 : 0)));
}

export const EXERCISE_LIBRARY: Exercise[] = [
  { id: 1, name: 'Barbell Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 2, name: 'Incline Bench Press', muscleGroups: ['chest', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 3, name: 'Dumbbell Bench Press', muscleGroups: ['chest', 'triceps'], equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 4, name: 'Dumbbell Incline Press', muscleGroups: ['chest', 'shoulders'], equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 5, name: 'Cable Fly', muscleGroups: ['chest'], equipment: 'cable', difficulty: 'beginner' },
  { id: 6, name: 'Dumbbell Fly', muscleGroups: ['chest'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 7, name: 'Push-Up', muscleGroups: ['chest', 'triceps'], equipment: 'bodyweight', difficulty: 'beginner' },
  { id: 8, name: 'Dip', muscleGroups: ['chest', 'triceps'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: 9, name: 'Overhead Press', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 10, name: 'Dumbbell Shoulder Press', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 11, name: 'Lateral Raise', muscleGroups: ['shoulders'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 12, name: 'Front Raise', muscleGroups: ['shoulders'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 13, name: 'Rear Delt Fly', muscleGroups: ['rear_delts'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 14, name: 'Face Pull', muscleGroups: ['rear_delts'], equipment: 'cable', difficulty: 'beginner' },
  { id: 15, name: 'Tricep Pushdown', muscleGroups: ['triceps'], equipment: 'cable', difficulty: 'beginner' },
  { id: 16, name: 'Skull Crusher', muscleGroups: ['triceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 17, name: 'Overhead Tricep Extension', muscleGroups: ['triceps'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 18, name: 'Close-Grip Bench Press', muscleGroups: ['triceps', 'chest'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 19, name: 'Deadlift', muscleGroups: ['back', 'hamstrings', 'glutes'], equipment: 'barbell', difficulty: 'advanced' },
  { id: 20, name: 'Barbell Row', muscleGroups: ['back', 'biceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 21, name: 'Pull-Up', muscleGroups: ['back', 'biceps'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: 22, name: 'Lat Pulldown', muscleGroups: ['back', 'biceps'], equipment: 'cable', difficulty: 'beginner' },
  { id: 23, name: 'Seated Cable Row', muscleGroups: ['back', 'biceps'], equipment: 'cable', difficulty: 'beginner' },
  { id: 24, name: 'T-Bar Row', muscleGroups: ['back'], equipment: 'machine', difficulty: 'intermediate' },
  { id: 25, name: 'Single-Arm DB Row', muscleGroups: ['back', 'biceps'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 26, name: 'Barbell Curl', muscleGroups: ['biceps'], equipment: 'barbell', difficulty: 'beginner' },
  { id: 27, name: 'Dumbbell Curl', muscleGroups: ['biceps'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 28, name: 'Hammer Curl', muscleGroups: ['biceps', 'forearms'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 29, name: 'Preacher Curl', muscleGroups: ['biceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 30, name: 'Concentration Curl', muscleGroups: ['biceps'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 31, name: 'Squat', muscleGroups: ['quads', 'glutes'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 32, name: 'Leg Press', muscleGroups: ['quads', 'glutes'], equipment: 'machine', difficulty: 'beginner' },
  { id: 33, name: 'Leg Extension', muscleGroups: ['quads'], equipment: 'machine', difficulty: 'beginner' },
  { id: 34, name: 'Romanian Deadlift', muscleGroups: ['hamstrings', 'glutes'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 35, name: 'Leg Curl', muscleGroups: ['hamstrings'], equipment: 'machine', difficulty: 'beginner' },
  { id: 36, name: 'Walking Lunge', muscleGroups: ['quads', 'glutes'], equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 37, name: 'Bulgarian Split Squat', muscleGroups: ['quads', 'glutes'], equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 38, name: 'Hip Thrust', muscleGroups: ['glutes'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 39, name: 'Calf Raise', muscleGroups: ['calves'], equipment: 'machine', difficulty: 'beginner' },
  { id: 40, name: 'Seated Calf Raise', muscleGroups: ['calves'], equipment: 'machine', difficulty: 'beginner' },
  { id: 41, name: 'Plank', muscleGroups: ['abs'], equipment: 'bodyweight', difficulty: 'beginner' },
  { id: 42, name: 'Hanging Leg Raise', muscleGroups: ['abs'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: 43, name: 'Cable Crunch', muscleGroups: ['abs'], equipment: 'cable', difficulty: 'beginner' },
  { id: 44, name: 'Russian Twist', muscleGroups: ['abs'], equipment: 'bodyweight', difficulty: 'beginner' },
  { id: 45, name: 'Ab Wheel Rollout', muscleGroups: ['abs'], equipment: 'bodyweight', difficulty: 'advanced' },
  { id: 46, name: 'Farmer\'s Walk', muscleGroups: ['forearms', 'traps'], equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 47, name: 'Shrug', muscleGroups: ['traps'], equipment: 'barbell', difficulty: 'beginner' },
  { id: 48, name: 'Good Morning', muscleGroups: ['hamstrings', 'back'], equipment: 'barbell', difficulty: 'intermediate' },
  { id: 49, name: 'Box Jump', muscleGroups: ['quads', 'glutes'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { id: 50, name: 'Kettlebell Swing', muscleGroups: ['glutes', 'hamstrings'], equipment: 'kettlebell', difficulty: 'intermediate' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    icon: 'trophy',
    title: 'New PR: Bench Press 92.5kg',
    subtitle: '2 days ago',
    date: '2024-01-13',
  },
  {
    id: 2,
    icon: 'flame',
    title: '7-Day Streak',
    subtitle: '1 day ago',
    date: '2024-01-14',
  },
];

export const WEEKLY_CONSISTENCY = [
  { day: 'Mon', completed: true, type: 'push' as const },
  { day: 'Tue', completed: true, type: 'pull' as const },
  { day: 'Wed', completed: true, type: 'legs' as const },
  { day: 'Thu', completed: true, type: 'rest' as const },
  { day: 'Fri', completed: true, type: 'push' as const },
  { day: 'Sat', completed: false, type: 'pull' as const },
  { day: 'Sun', completed: false, type: 'legs' as const },
];

export const TODAY_SUPPLEMENTS = [
  { id: 1, name: 'Creatine', taken: true, icon: 'beaker', color: '#00E676' },
  { id: 2, name: 'Whey', taken: true, icon: 'cup', color: '#FF9100' },
  { id: 3, name: 'Omega-3', taken: false, icon: 'droplet', color: '#2979FF' },
  { id: 4, name: 'Mg', taken: true, icon: 'pill', color: '#7C4DFF' },
];

export const BURNED_CALORIES = 420;

export const STEPS_DATA = generateStepsData();
export const SLEEP_DATA = generateSleepData();
export const HEART_RATE_DATA = generateHeartRateData();
export const CALORIES_BURNED_DATA = generateCaloriesBurnedData();
export const INTRADAY_HR = generateIntradayHR();

export const TODAY_HYDRATION = 1.8;
export const TODAY_STEPS = 6240;
export const TODAY_SLEEP = 7.2;
export const SLEEP_QUALITY: HealthDataEntry['sleepQuality'] = 'good';
