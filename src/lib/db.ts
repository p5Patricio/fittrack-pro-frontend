import Dexie, { type Table } from 'dexie';
import type {
  MealEntry,
  WorkoutEntry,
  WeightLogEntry,
  MeasurementEntry,
  PhotoEntry,
  Exercise,
  SupplementLog,
  HealthDataEntry,
  UserProfile,
} from '@/types';

export class FitTrackDB extends Dexie {
  meals!: Table<MealEntry>;
  workouts!: Table<WorkoutEntry>;
  weightLogs!: Table<WeightLogEntry>;
  measurements!: Table<MeasurementEntry>;
  photos!: Table<PhotoEntry>;
  exercises!: Table<Exercise>;
  supplements!: Table<SupplementLog>;
  healthData!: Table<HealthDataEntry>;
  userProfile!: Table<UserProfile>;

  constructor() {
    super('FitTrackDB');
    this.version(1).stores({
      meals: '++id, date, mealType',
      workouts: '++id, date, routineName',
      weightLogs: '++id, date',
      measurements: '++id, date',
      photos: '++id, date',
      exercises: '++id, muscleGroups',
      supplements: '++id, date, supplementName',
      healthData: '++id, date, source',
      userProfile: '++id',
    });
  }
}

export const db = new FitTrackDB();
