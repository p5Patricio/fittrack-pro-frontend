import { create } from 'zustand';
import type {
  UserProfile,
  DailyNutrition,
  NutritionTargets,
  WeightLogEntry,
  TodaysSupplement,
  WorkoutEntry,
} from '@/types';
import {
  USER_PROFILE,
  TODAY_NUTRITION,
  NUTRITION_TARGETS,
  WEIGHT_DATA,
  TODAY_SUPPLEMENTS,
  CURRENT_WORKOUT,
  TODAY_HYDRATION,
  TODAY_STEPS,
  TODAY_SLEEP,
  BURNED_CALORIES,
} from './mockData';

interface UIState {
  activeTab: string;
  showNotifications: boolean;
  showAddMealModal: boolean;
  refreshing: boolean;
}

interface FitTrackStore {
  user: UserProfile;
  nutrition: DailyNutrition;
  nutritionTargets: NutritionTargets;
  weightLogs: WeightLogEntry[];
  supplements: TodaysSupplement[];
  todaysWorkout: WorkoutEntry | null;
  steps: number;
  stepsGoal: number;
  sleep: number;
  sleepGoal: number;
  hydration: number;
  hydrationGoal: number;
  burnedCalories: number;
  ui: UIState;

  toggleSupplement: (id: number) => void;
  setActiveTab: (tab: string) => void;
  setRefreshing: (v: boolean) => void;
  setShowNotifications: (v: boolean) => void;
  setShowAddMealModal: (v: boolean) => void;
  updateNutrition: (partial: Partial<DailyNutrition>) => void;
  addWeight: (entry: WeightLogEntry) => void;
  setTodaysWorkout: (workout: WorkoutEntry | null) => void;
  addHydration: (amount: number) => void;
}

export const useStore = create<FitTrackStore>((set) => ({
  user: USER_PROFILE,
  nutrition: TODAY_NUTRITION,
  nutritionTargets: NUTRITION_TARGETS,
  weightLogs: WEIGHT_DATA,
  supplements: TODAY_SUPPLEMENTS,
  todaysWorkout: CURRENT_WORKOUT,
  steps: TODAY_STEPS,
  stepsGoal: 10000,
  sleep: TODAY_SLEEP,
  sleepGoal: 8,
  hydration: TODAY_HYDRATION,
  hydrationGoal: 3,
  burnedCalories: BURNED_CALORIES,
  ui: {
    activeTab: 'home',
    showNotifications: false,
    showAddMealModal: false,
    refreshing: false,
  },

  toggleSupplement: (id) =>
    set((state) => ({
      supplements: state.supplements.map((s) =>
        s.id === id ? { ...s, taken: !s.taken } : s
      ),
    })),

  setActiveTab: (tab) =>
    set((state) => ({
      ui: { ...state.ui, activeTab: tab },
    })),

  setRefreshing: (v) =>
    set((state) => ({
      ui: { ...state.ui, refreshing: v },
    })),

  setShowNotifications: (v) =>
    set((state) => ({
      ui: { ...state.ui, showNotifications: v },
    })),

  setShowAddMealModal: (v) =>
    set((state) => ({
      ui: { ...state.ui, showAddMealModal: v },
    })),

  updateNutrition: (partial) =>
    set((state) => ({
      nutrition: { ...state.nutrition, ...partial },
    })),

  addWeight: (entry) =>
    set((state) => ({
      weightLogs: [...state.weightLogs, entry],
    })),

  setTodaysWorkout: (workout) =>
    set({ todaysWorkout: workout }),

  addHydration: (amount) =>
    set((state) => ({
      hydration: Math.min(
        state.hydration + amount,
        state.hydrationGoal * 2
      ),
    })),
}));
