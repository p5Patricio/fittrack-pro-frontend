import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Apple,
  Dumbbell,
  TrendingUp,
  HeartPulse,
  User,
} from 'lucide-react';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/', icon: LayoutDashboard },
  { key: 'nutrition', label: 'Nutrition', path: '/nutrition', icon: Apple },
  { key: 'workouts', label: 'Workouts', path: '/workouts', icon: Dumbbell },
  { key: 'progress', label: 'Progress', path: '/progress', icon: TrendingUp },
  { key: 'health', label: 'Health', path: '/health', icon: HeartPulse },
  { key: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const setActiveTab = useStore((s) => s.setActiveTab);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const idx = NAV_ITEMS.findIndex(
      (item) =>
        item.path === currentPath ||
        (item.path !== '/' && currentPath.startsWith(item.path))
    );
    if (idx >= 0) {
      setActiveIndex(idx);
      setActiveTab(NAV_ITEMS[idx].key);
    }
  }, [location.pathname, setActiveTab]);

  const handleTap = (index: number) => {
    setActiveIndex(index);
    navigate(NAV_ITEMS[index].path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-[env(safe-area-inset-bottom)] glass-nav border-t border-divider">
      <div className="relative flex items-center justify-around h-full px-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleTap(index)}
              className="flex flex-col items-center justify-center w-14 h-14 touch-target relative"
              aria-label={item.label}
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col items-center gap-1"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={
                    isActive ? 'text-accent-green' : 'text-text-secondary'
                  }
                  style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(0,230,118,0.3))' } : undefined}
                />
                <span
                  className={`text-[10px] font-medium tracking-wide uppercase ${
                    isActive ? 'text-accent-green' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}

        {/* Active indicator pill */}
        <motion.div
          className="absolute top-0 h-[3px] w-10 rounded-full bg-accent-green"
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            left: `calc(${(activeIndex / NAV_ITEMS.length) * 100}% + ${(100 / NAV_ITEMS.length / 2)}% - 20px)`,
          }}
        />
      </div>
    </nav>
  );
}
