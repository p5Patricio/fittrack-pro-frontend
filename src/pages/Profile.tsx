import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { UserProfile, NutritionTargets } from '@/types';
import UserProfileCard from '@/components/profile/UserProfileCard';
import GoalsCard from '@/components/profile/GoalsCard';
import MacroTargetsCard from '@/components/profile/MacroTargetsCard';
import SupplementTracker from '@/components/profile/SupplementTracker';
import AdherenceScore from '@/components/profile/AdherenceScore';
import SettingsCard from '@/components/profile/SettingsCard';

export default function Profile() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const supplements = useStore((s) => s.supplements);
  const toggleSupplement = useStore((s) => s.toggleSupplement);
  const nutritionTargets = useStore((s) => s.nutritionTargets);

  // Local state for user and targets since store has no setter
  const [localUser, setLocalUser] = useState<UserProfile>(user);
  const [localTargets, setLocalTargets] = useState<NutritionTargets>(nutritionTargets);
  const [units, setUnits] = useState<'metric' | 'imperial'>(user.unitSystem);

  // Track which supplements are taken
  const takenIds = supplements.filter((s) => s.taken).map((s) => s.id);

  // Supplement toggle handler
  const handleToggleSupplement = useCallback(
    (id: number) => {
      toggleSupplement(id);
    },
    [toggleSupplement]
  );

  // User update handler
  const handleUpdateUser = useCallback((updates: Partial<UserProfile>) => {
    setLocalUser((prev) => ({ ...prev, ...updates }));
  }, []);

  // Targets update handler
  const handleUpdateTargets = useCallback((updates: Partial<NutritionTargets>) => {
    setLocalTargets((prev) => ({ ...prev, ...updates }));
  }, []);

  // Units toggle
  const handleToggleUnits = useCallback(() => {
    setUnits((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  }, []);

  // Clear all data
  const handleClearData = useCallback(() => {
    setLocalUser((prev) => ({
      ...prev,
      name: 'Alex',
      age: 22,
      height: 172,
      currentWeight: 81.5,
      goalWeight: 78,
      activityLevel: 'very_active',
      goal: 'lose',
    }));
    setLocalTargets({ calories: 2800, protein: 170, carbs: 365, fats: 75 });
    setUnits('metric');
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="sticky top-0 z-40 glass border-b border-divider"
      >
        <div className="flex items-center justify-between h-14 px-4">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-text-secondary touch-target"
          >
            <ChevronLeft size={22} />
            <span className="text-[14px]">Atras</span>
          </motion.button>

          <h1 className="text-[16px] font-semibold tracking-wide uppercase text-text-primary">
            Perfil
          </h1>

          <div className="w-[60px]" />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* User Profile Card */}
        <UserProfileCard user={localUser} onUpdateUser={handleUpdateUser} />

        {/* Goals Card */}
        <GoalsCard user={localUser} />

        {/* Macro Targets Card */}
        <MacroTargetsCard
          targets={localTargets}
          userWeight={localUser.currentWeight}
          userHeight={localUser.height}
          userAge={localUser.age}
          userGender={localUser.gender}
          userActivity={localUser.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'}
          onUpdateTargets={handleUpdateTargets}
        />

        {/* Supplement Tracker */}
        <SupplementTracker
          takenIds={takenIds}
          onToggle={handleToggleSupplement}
        />

        {/* Weekly Adherence Score */}
        <AdherenceScore />

        {/* Settings & Data Management */}
        <SettingsCard
          units={units}
          onToggleUnits={handleToggleUnits}
          onClearData={handleClearData}
        />

        {/* Footer spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
