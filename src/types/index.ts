export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
}

export interface MealEntry {
  id?: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface Set {
  id?: number;
  reps: number;
  weight: number;
  completed: boolean;
  rpe?: number;
}

export interface ExerciseEntry {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  sets: Set[];
  restSeconds: number;
  notes?: string;
}

export interface WorkoutEntry {
  id?: number;
  date: string;
  routineName: string;
  workoutType: 'push' | 'pull' | 'legs' | 'rest';
  exercises: ExerciseEntry[];
  durationMinutes: number;
  completed: boolean;
  totalVolume: number;
}

export interface WeightLogEntry {
  id?: number;
  date: string;
  weight: number;
  unit: 'kg';
}

export interface MeasurementEntry {
  id?: number;
  date: string;
  chest: number;
  waist: number;
  arms: number;
  thighs: number;
  shoulders: number;
  unit: 'cm';
}

export interface PhotoEntry {
  id?: number;
  date: string;
  filePath: string;
  type: 'front' | 'side' | 'back';
}

export interface Supplement {
  id: number;
  name: string;
  dosage: string;
  timing: string;
  icon: string;
  color: string;
}

export interface SupplementLog {
  id?: number;
  date: string;
  supplementName: string;
  taken: boolean;
  takenAt?: string;
}

export interface HealthDataEntry {
  id?: number;
  date: string;
  source: 'samsung' | 'manual';
  steps?: number;
  caloriesBurned?: number;
  restingHeartRate?: number;
  avgHeartRate?: number;
  peakHeartRate?: number;
  sleepHours?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  hydration?: number;
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
}

export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  dailyStepsGoal: number;
  sleepGoal: number;
  hydrationGoal: number;
  unitSystem: 'metric' | 'imperial';
  createdAt: string;
}

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Achievement {
  id: number;
  icon: 'trophy' | 'flame' | 'star';
  title: string;
  subtitle: string;
  date: string;
}

export interface TodaysSupplement {
  id: number;
  name: string;
  taken: boolean;
  icon: string;
  color: string;
}
