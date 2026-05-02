import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Camera, User } from 'lucide-react';
import type { UserProfile } from '@/types';

interface UserProfileCardProps {
  user: UserProfile;
  onUpdateUser: (user: Partial<UserProfile>) => void;
}

const experienceLabels: Record<string, string> = {
  sedentary: 'Sedentario',
  light: 'Ligero',
  moderate: 'Moderado',
  active: 'Activo',
  very_active: 'Muy Activo',
};

export default function UserProfileCard({ user, onUpdateUser }: UserProfileCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name);
  const [editingStat, setEditingStat] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const bmi = (user.currentWeight / ((user.height / 100) ** 2)).toFixed(1);
  const tdee = Math.round(
    user.gender === 'male'
      ? 10 * user.currentWeight + 6.25 * user.height - 5 * user.age + 5
      : 10 * user.currentWeight + 6.25 * user.height - 5 * user.age - 161
  );

  const stats = [
    { key: 'bmi', label: 'IMC', value: bmi },
    { key: 'tdee', label: 'TDEE', value: `${tdee.toLocaleString()}` },
    { key: 'experience', label: 'Actividad', value: experienceLabels[user.activityLevel] || 'Moderado' },
  ];

  const handleSaveName = () => {
    if (nameValue.trim()) {
      onUpdateUser({ name: nameValue.trim() });
    }
    setEditingName(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="bg-bg-secondary rounded-2xl border border-divider p-5"
    >
      {/* Avatar row */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="relative shrink-0"
        >
          <div className="w-[72px] h-[72px] rounded-full border-[3px] border-accent-green overflow-hidden bg-bg-tertiary">
            <img
              src="/avatar-default.jpg"
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <User size={32} />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bg-elevated border border-divider flex items-center justify-center">
            <Camera size={12} className="text-text-secondary" />
          </div>
        </motion.div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {editingName ? (
              <motion.input
                ref={nameInputRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setNameValue(user.name);
                    setEditingName(false);
                  }
                }}
                className="bg-bg-tertiary text-text-primary text-[22px] font-bold leading-tight rounded-lg px-2 py-0.5 border border-accent-green/30 outline-none focus:border-accent-green"
              />
            ) : (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[22px] font-bold text-text-primary leading-tight"
              >
                {user.name}
              </motion.h2>
            )}
            {!editingName && (
              <button
                onClick={() => setEditingName(true)}
                className="p-1 rounded-md hover:bg-bg-tertiary transition-colors"
                aria-label="Editar nombre"
              >
                <Pencil size={14} className="text-text-muted" />
              </button>
            )}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-[13px] text-text-secondary mt-0.5"
          >
            {user.gender === 'male' ? 'Hombre' : 'Mujer'}, {user.age} años • {user.height} cm • {user.currentWeight} kg
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1.5 inline-flex"
          >
            <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-accent-green/15 text-accent-green">
              {user.goal === 'lose'
                ? user.goalWeight < user.currentWeight
                  ? 'Pérdida de Grasa'
                  : 'Recomposición Corporal'
                : user.goal === 'gain'
                  ? 'Ganancia Muscular'
                  : 'Mantenimiento'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-divider"
      >
        {stats.map((stat, index) => (
          <motion.button
            key={stat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setEditingStat(editingStat === stat.key ? null : stat.key)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-bg-tertiary/50 transition-colors text-center"
          >
            <span className="text-[18px] font-semibold text-text-primary tabular-nums">
              {stat.value}
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted">
              {stat.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
