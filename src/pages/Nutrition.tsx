import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Camera,
  Search,
  X,
  Trash2,
  Minus,
  CheckSquare,
  Utensils,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { MEALS as MOCK_MEALS } from '@/lib/mockData';
import type { FoodItem, MealEntry } from '@/types';

/* ─── Constants ─────────────────────────────────────────────── */
const CALORIE_TARGET = 2800;
const MACRO_TARGETS = { protein: 170, carbs: 365, fats: 75 };

const COLORS = {
  protein: '#00E676',
  carbs: '#2979FF',
  fats: '#FF9100',
  track: '#1E2028',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snack: 'Pre-Entreno',
  dinner: 'Cena',
};

const MEAL_TIMES: Record<string, string> = {
  breakfast: '8:00 AM',
  lunch: '1:30 PM',
  snack: '5:00 PM',
  dinner: '8:30 PM',
};

const FREQUENT_FOODS = [
  { name: 'Oats', calories: 150, emoji: '🌾' },
  { name: 'Banana', calories: 105, emoji: '🍌' },
  { name: 'Chicken', calories: 165, emoji: '🍗' },
  { name: 'Eggs', calories: 70, emoji: '🥚' },
  { name: 'Rice', calories: 130, emoji: '🍚' },
  { name: 'Broccoli', calories: 35, emoji: '🥦' },
  { name: 'Protein Shake', calories: 120, emoji: '🥤' },
  { name: 'Greek Yogurt', calories: 100, emoji: '🥣' },
  { name: 'Peanut Butter', calories: 95, emoji: '🥜' },
  { name: 'Sweet Potato', calories: 90, emoji: '🍠' },
];

const FOOD_DB = [
  ...FREQUENT_FOODS.map(f => ({ ...f, protein: 5, carbs: 15, fats: 3, serving: '100g' })),
  { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g', emoji: '🍗' },
  { name: 'Salmon Fillet', calories: 208, protein: 20, carbs: 0, fats: 13, serving: '100g', emoji: '🐟' },
  { name: 'Brown Rice (cooked)', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, serving: '100g', emoji: '🍚' },
  { name: 'Whole Egg', calories: 72, protein: 6.3, carbs: 0.4, fats: 5, serving: '1 large', emoji: '🥚' },
  { name: 'Egg Whites', calories: 17, protein: 3.6, carbs: 0.2, fats: 0.1, serving: '1 large', emoji: '🥚' },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, serving: '100g', emoji: '🥑' },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, serving: '100g', emoji: '🌰' },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g', emoji: '🥦' },
  { name: 'Oats (dry)', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving: '100g', emoji: '🌾' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: '1 medium', emoji: '🍌' },
  { name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fats: 1, serving: '1 scoop', emoji: '🥤' },
  { name: 'Greek Yogurt (0%)', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: '100g', emoji: '🥣' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: '100g', emoji: '🍠' },
  { name: 'Tuna (canned)', calories: 116, protein: 26, carbs: 0, fats: 1, serving: '100g', emoji: '🐟' },
  { name: 'Pasta (cooked)', calories: 131, protein: 5, carbs: 25, fats: 1.1, serving: '100g', emoji: '🍝' },
  { name: 'Ground Beef (95% lean)', calories: 137, protein: 21, carbs: 0, fats: 5, serving: '100g', emoji: '🥩' },
  { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fats: 1, serving: '100g', emoji: '🦃' },
  { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, serving: '100g', emoji: '🧀' },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, serving: '100g', emoji: '🍃' },
];

const WEEKLY_DATA = [
  { day: 'Mon', protein: 155, carbs: 320, fats: 68 },
  { day: 'Tue', protein: 170, carbs: 280, fats: 72 },
  { day: 'Wed', protein: 145, carbs: 350, fats: 65 },
  { day: 'Thu', protein: 160, carbs: 300, fats: 70 },
  { day: 'Fri', protein: 175, carbs: 340, fats: 75 },
  { day: 'Sat', protein: 150, carbs: 310, fats: 80 },
  { day: 'Sun', protein: 165, carbs: 290, fats: 66 },
];

/* ─── Easing ────────────────────────────────────────────────── */
const snappy = [0.16, 1, 0.3, 1] as [number, number, number, number];
const bounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ─── Stagger variants ──────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: snappy } },
};

/* ═══════════════════════════════════════════════════════════════
   Nutrition Page
   ═══════════════════════════════════════════════════════════════ */
export default function Nutrition() {
  const navigate = useNavigate();
  // Store integration available via useStore when needed

  /* ── State ─────────────────────────────────────────────── */
  const [currentDate, setCurrentDate] = useState(new Date('2024-01-15'));
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [meals, setMeals] = useState<MealEntry[]>(MOCK_MEALS);
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true,
  });

  /* Bottom sheet */
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMealType, setSheetMealType] = useState<string>('breakfast');
  const [sheetTab, setSheetTab] = useState<'search' | 'frequent' | 'meals'>('search');
  const [searchQuery, setSearchQuery] = useState('');

  /* Serving selector */
  const [servingSelector, setServingSelector] = useState<{
    food: typeof FOOD_DB[0];
    mealType: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [servingUnit, setServingUnit] = useState('serving');

  /* Photo estimation */
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [photoPhase, setPhotoPhase] = useState<'camera' | 'analyzing' | 'results'>('camera');
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedFoods, setDetectedFoods] = useState<
    { name: string; portion: string; calories: number; confidence: number; checked: boolean }[]
  >([]);

  /* Toast */
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Derived values ────────────────────────────────────── */
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totalCalories,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fats: acc.fats + m.totalFats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const caloriePct = Math.min(Math.round((totals.calories / CALORIE_TARGET) * 100), 100);

  const filteredFoods = searchQuery.trim()
    ? FOOD_DB.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.emoji?.includes(searchQuery)
      )
    : FOOD_DB.slice(0, 8);

  /* ── Handlers ──────────────────────────────────────────── */
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const toggleMeal = (type: string) => {
    setExpandedMeals((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const openAddSheet = (mealType: string) => {
    setSheetMealType(mealType);
    setSheetTab('search');
    setSearchQuery('');
    setSheetOpen(true);
  };

  const openServingSelector = (food: typeof FOOD_DB[0], mealType: string) => {
    setServingSelector({ food, mealType });
    setQuantity(1);
    setServingUnit('serving');
  };

  const addFoodToMeal = (
    food: typeof FOOD_DB[0],
    mealType: string,
    qty: number = 1
  ) => {
    const newFood: FoodItem = {
      name: food.name,
      calories: Math.round(food.calories * qty),
      protein: Math.round(food.protein * qty * 10) / 10,
      carbs: Math.round(food.carbs * qty * 10) / 10,
      fats: Math.round(food.fats * qty * 10) / 10,
      serving: `${qty} ${servingUnit}`,
    };

    setMeals((prev) =>
      prev.map((m) =>
        m.mealType === mealType
          ? {
              ...m,
              foods: [...m.foods, newFood],
              totalCalories: m.totalCalories + newFood.calories,
              totalProtein: Math.round((m.totalProtein + newFood.protein) * 10) / 10,
              totalCarbs: Math.round((m.totalCarbs + newFood.carbs) * 10) / 10,
              totalFats: Math.round((m.totalFats + newFood.fats) * 10) / 10,
            }
          : m
      )
    );

    showToast(`${food.name} added to ${MEAL_LABELS[mealType]}`);
    setServingSelector(null);
    setSheetOpen(false);
  };

  const deleteFood = (mealType: string, foodIndex: number) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.mealType !== mealType) return m;
        const food = m.foods[foodIndex];
        if (!food) return m;
        const newFoods = m.foods.filter((_, i) => i !== foodIndex);
        return {
          ...m,
          foods: newFoods,
          totalCalories: m.totalCalories - food.calories,
          totalProtein: Math.round((m.totalProtein - food.protein) * 10) / 10,
          totalCarbs: Math.round((m.totalCarbs - food.carbs) * 10) / 10,
          totalFats: Math.round((m.totalFats - food.fats) * 10) / 10,
        };
      })
    );
    showToast('Food removed', 'info');
  };

  const handlePhotoSelect = () => {
    setPhotoPhase('analyzing');
    setScanProgress(0);

    /* Simulate scanning animation */
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPhotoPhase('results');
          setDetectedFoods([
            { name: 'Grilled chicken breast', portion: '200g', calories: 330, confidence: 87, checked: true },
            { name: 'White rice', portion: '150g', calories: 195, confidence: 92, checked: true },
            { name: 'Steamed broccoli', portion: '100g', calories: 35, confidence: 78, checked: true },
          ]);
          return 100;
        }
        return p + 2;
      });
    }, 40);
  };

  const toggleDetectedFood = (idx: number) => {
    setDetectedFoods((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, checked: !f.checked } : f))
    );
  };

  const addDetectedFoods = () => {
    const selected = detectedFoods.filter((f) => f.checked);
    if (selected.length === 0) return;

    setMeals((prev) =>
      prev.map((m) => {
        if (m.mealType !== 'lunch') return m;
        const newFoods: FoodItem[] = selected.map((s) => ({
          name: s.name,
          calories: s.calories,
          protein: Math.round(s.calories * 0.15 * 0.1),
          carbs: Math.round(s.calories * 0.1 * 0.1),
          fats: Math.round(s.calories * 0.05 * 0.1),
          serving: s.portion,
        }));
        const addedCals = newFoods.reduce((a, f) => a + f.calories, 0);
        return {
          ...m,
          foods: [...m.foods, ...newFoods],
          totalCalories: m.totalCalories + addedCals,
        };
      })
    );

    showToast(`${selected.length} foods added to Almuerzo`);
    setPhotoSheetOpen(false);
    setPhotoPhase('camera');
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const prevDay = () => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 1);
      return nd;
    });
  };

  const nextDay = () => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      return nd;
    });
  };

  /* ── Donut data ────────────────────────────────────────── */
  const donutData = [
    { name: 'Protein', value: totals.protein, color: COLORS.protein },
    { name: 'Carbs', value: totals.carbs, color: COLORS.carbs },
    { name: 'Fats', value: totals.fats, color: COLORS.fats },
  ];

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-bg-primary pb-24">
      {/* ═══════ Header ════════════════════════════════════ */}
      <motion.header
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: snappy }}
        className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-bg-primary border-b border-divider"
      >
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-bg-tertiary transition-colors"
        >
          <ChevronLeft size={22} className="text-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary tracking-tight">NUTRITION</h1>
        <button
          onClick={() => {
            setPhotoPhase('camera');
            setPhotoSheetOpen(true);
          }}
          className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-bg-tertiary transition-colors"
        >
          <Camera size={20} className="text-text-secondary" />
        </button>
      </motion.header>

      {/* ═══════ Date Nav ══════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="sticky top-14 z-30 flex items-center justify-between px-4 py-2 bg-bg-primary border-b border-divider"
      >
        {/* Segmented control */}
        <div className="flex bg-bg-tertiary rounded-xl p-1 gap-0.5">
          {(['daily', 'weekly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewMode(tab)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                viewMode === tab ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {viewMode === tab && (
                <motion.div
                  layoutId="dateTab"
                  className="absolute inset-0 bg-bg-elevated rounded-lg shadow-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-1">
          <button onClick={prevDay} className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-bg-tertiary">
            <ChevronLeft size={16} className="text-text-secondary" />
          </button>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentDate.toISOString()}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-text-secondary w-16 text-center tabular-nums"
            >
              {formatDate(currentDate)}
            </motion.span>
          </AnimatePresence>
          <button onClick={nextDay} className="w-8 h-8 flex items-center justify-center rounded-lg active:bg-bg-tertiary">
            <ChevronRight size={16} className="text-text-secondary" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'daily' ? (
          <motion.div
            key="daily"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* ═══════ Hero Calorie Summary ════════════════════ */}
            <HeroCalorieSummary totals={totals} caloriePct={caloriePct} />

            {/* ═══════ Macro Donut Chart ═══════════════════════ */}
            <MacroDonutCard donutData={donutData} totals={totals} />

            {/* ═══════ Meal Sections ═══════════════════════════ */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="px-4 mt-4 space-y-3"
            >
              {meals.map((meal) => (
                <motion.div key={meal.mealType} variants={itemVariants}>
                  <MealCard
                    meal={meal}
                    expanded={!!expandedMeals[meal.mealType]}
                    onToggle={() => toggleMeal(meal.mealType)}
                    onAddFood={() => openAddSheet(meal.mealType)}
                    onDeleteFood={(idx) => deleteFood(meal.mealType, idx)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* ═══════ Frequent Foods ══════════════════════════ */}
            <FrequentFoodsRow
              foods={FREQUENT_FOODS}
              onQuickAdd={(food) => {
                const dbFood = FOOD_DB.find((f) => f.name === food.name);
                if (dbFood) addFoodToMeal(dbFood, 'breakfast', 1);
              }}
            />

            {/* ═══════ Nutrient Breakdown ══════════════════════ */}
            <NutrientBreakdown totals={totals} />
          </motion.div>
        ) : (
          <motion.div
            key="weekly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WeeklyChartSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ FAB ═══════════════════════════════════════ */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 500, damping: 15 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => openAddSheet('breakfast')}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-accent-green flex items-center justify-center shadow-fab"
      >
        <Plus size={24} className="text-bg-primary" />
      </motion.button>

      {/* ═══════ Add Food Bottom Sheet ═══════════════════ */}
      <AnimatePresence>
        {sheetOpen && (
          <BottomSheet onClose={() => setSheetOpen(false)} title={`Add to ${MEAL_LABELS[sheetMealType]}`}>
            {/* Search */}
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-11 pl-10 pr-4 bg-bg-tertiary rounded-xl text-text-primary text-sm placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent-green transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={16} className="text-text-muted" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex bg-bg-tertiary rounded-xl p-1 mb-3">
              {(['search', 'frequent', 'meals'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSheetTab(tab)}
                  className={`relative flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    sheetTab === tab ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {sheetTab === tab && (
                    <motion.div layoutId="sheetTab" className="absolute inset-0 bg-bg-elevated rounded-lg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            {sheetTab === 'search' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-0">
                {filteredFoods.map((food, i) => (
                  <motion.button
                    key={`${food.name}-${i}`}
                    variants={itemVariants}
                    onClick={() => openServingSelector(food, sheetMealType)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-tertiary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-lg">
                      {food.emoji || <Utensils size={18} className="text-text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{food.name}</p>
                      <p className="text-xs text-text-muted">{food.serving} — {food.calories} kcal</p>
                    </div>
                    <span className="text-xs text-text-secondary tabular-nums">P:{food.protein}g C:{food.carbs}g F:{food.fats}g</span>
                  </motion.button>
                ))}
                {filteredFoods.length === 0 && (
                  <div className="py-12 text-center text-text-muted text-sm">No foods found</div>
                )}
              </motion.div>
            )}

            {sheetTab === 'frequent' && (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-3 gap-2">
                {FREQUENT_FOODS.map((food) => (
                  <motion.button
                    key={food.name}
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const dbFood = FOOD_DB.find((f) => f.name === food.name);
                      if (dbFood) addFoodToMeal(dbFood, sheetMealType, 1);
                    }}
                    className="flex flex-col items-center gap-1 p-3 bg-bg-tertiary rounded-xl border border-divider active:bg-bg-elevated transition-colors"
                  >
                    <span className="text-2xl">{food.emoji}</span>
                    <span className="text-[10px] font-medium text-text-primary truncate w-full text-center">{food.name}</span>
                    <span className="text-[10px] text-text-muted">~{food.calories} kcal</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {sheetTab === 'meals' && (
              <div className="space-y-2">
                {meals.filter((m) => m.foods.length > 0).map((m) => (
                  <button
                    key={m.mealType}
                    onClick={() => {
                      setMeals((prev) =>
                        prev.map((pm) =>
                          pm.mealType === sheetMealType
                            ? {
                                ...pm,
                                foods: [...pm.foods, ...m.foods],
                                totalCalories: pm.totalCalories + m.totalCalories,
                                totalProtein: pm.totalProtein + m.totalProtein,
                                totalCarbs: pm.totalCarbs + m.totalCarbs,
                                totalFats: pm.totalFats + m.totalFats,
                              }
                            : pm
                        )
                      );
                      showToast(`Added ${MEAL_LABELS[m.mealType]} to ${MEAL_LABELS[sheetMealType]}`);
                      setSheetOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-bg-tertiary rounded-xl text-left hover:bg-bg-elevated transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{MEAL_LABELS[m.mealType]}</p>
                      <p className="text-xs text-text-muted">{m.foods.length} items</p>
                    </div>
                    <span className="text-sm text-accent-green font-medium">{m.totalCalories} kcal</span>
                  </button>
                ))}
              </div>
            )}
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* ═══════ Serving Size Selector Modal ═══════════════ */}
      <AnimatePresence>
        {servingSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setServingSelector(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] mx-4 mb-8 bg-bg-elevated rounded-2xl p-5 border border-divider"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-text-primary">{servingSelector.food.name}</h3>
                <button onClick={() => setServingSelector(null)}>
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>

              <p className="text-xs text-text-secondary mb-4">
                1 {servingUnit} ({servingSelector.food.serving}) — {servingSelector.food.calories} kcal
              </p>

              {/* Quantity stepper */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(0.25, q - 0.25))}
                  className="w-11 h-11 rounded-xl bg-bg-tertiary flex items-center justify-center active:bg-bg-primary transition-colors"
                >
                  <Minus size={18} className="text-text-primary" />
                </button>
                <span className="text-xl font-bold text-text-primary w-16 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 0.25))}
                  className="w-11 h-11 rounded-xl bg-bg-tertiary flex items-center justify-center active:bg-bg-primary transition-colors"
                >
                  <Plus size={18} className="text-text-primary" />
                </button>
              </div>

              {/* Unit picker */}
              <select
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full h-10 bg-bg-tertiary rounded-xl px-3 text-sm text-text-primary outline-none mb-4 border border-divider"
              >
                {['serving', 'g', 'oz', 'cup', 'tbsp', 'piece'].map((u) => (
                  <option key={u} value={u} className="bg-bg-elevated">{u}</option>
                ))}
              </select>

              {/* Live preview */}
              <div className="bg-bg-tertiary rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-text-secondary">
                  {Math.round(servingSelector.food.calories * quantity)} kcal
                  <span className="mx-2 text-text-muted">•</span>
                  P:{Math.round(servingSelector.food.protein * quantity)}g
                  <span className="mx-2 text-text-muted">•</span>
                  C:{Math.round(servingSelector.food.carbs * quantity)}g
                  <span className="mx-2 text-text-muted">•</span>
                  F:{Math.round(servingSelector.food.fats * quantity)}g
                </p>
              </div>

              <button
                onClick={() => addFoodToMeal(servingSelector.food, servingSelector.mealType, quantity)}
                className="w-full h-12 bg-accent-green rounded-xl text-sm font-semibold text-bg-primary active:scale-[0.98] transition-transform"
              >
                Add to {MEAL_LABELS[servingSelector.mealType]}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Photo Estimation Bottom Sheet ═══════════ */}
      <AnimatePresence>
        {photoSheetOpen && (
          <BottomSheet onClose={() => { setPhotoSheetOpen(false); setPhotoPhase('camera'); }} title="Photo Estimation">
            {photoPhase === 'camera' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="w-full h-48 bg-bg-tertiary rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed border-divider">
                  <Camera size={36} className="text-text-muted" />
                  <p className="text-sm text-text-secondary">Take a photo or choose from gallery</p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="flex items-center justify-center gap-2 w-full h-12 bg-accent-green rounded-xl text-sm font-semibold text-bg-primary cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <Camera size={18} />
                  Take Photo / Choose from Gallery
                </label>

                <button
                  onClick={() => setPhotoSheetOpen(false)}
                  className="w-full h-11 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {photoPhase === 'analyzing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6">
                {/* Photo preview with scanning line */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-5">
                  <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                    <Utensils size={48} className="text-text-muted" />
                  </div>
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 bg-accent-green/10" />
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-accent-green shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                  />
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#00E676 1px, transparent 1px), linear-gradient(90deg, #00E676 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-text-primary mb-2">Analyzing your meal...</h3>

                {/* Pulsing dots */}
                <div className="flex items-center gap-2 mb-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent-green"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>

                <div className="w-full space-y-2">
                  {['Detecting foods...', 'Estimating portions...', 'Calculating nutrition...'].map((text, i) => (
                    <motion.p
                      key={text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: scanProgress > i * 33 ? 1 : 0.3, x: 0 }}
                      className="text-xs text-text-secondary text-center"
                    >
                      {scanProgress > (i + 1) * 33 ? '✓' : scanProgress > i * 33 ? '●' : '○'} {text}
                    </motion.p>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-bg-tertiary rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="h-full gradient-calories rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}

            {photoPhase === 'results' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-xl bg-bg-tertiary flex items-center justify-center">
                    <Utensils size={28} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-primary">
                      {detectedFoods.reduce((a, f) => a + (f.checked ? f.calories : 0), 0)} kcal
                    </p>
                    <p className="text-xs text-text-secondary">Estimated total</p>
                  </div>
                </div>

                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">Detected foods</p>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
                  {detectedFoods.map((food, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-xl"
                    >
                      <button onClick={() => toggleDetectedFood(i)}>
                        <CheckSquare
                          size={20}
                          className={food.checked ? 'text-accent-green' : 'text-text-muted'}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{food.name}</p>
                        <p className="text-xs text-text-muted">{food.portion} — {food.calories} kcal</p>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          food.confidence > 80
                            ? 'bg-accent-green/20 text-accent-green'
                            : food.confidence > 50
                            ? 'bg-accent-orange/20 text-accent-orange'
                            : 'bg-accent-red/20 text-accent-red'
                        }`}
                      >
                        {food.confidence}%
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                <button
                  onClick={addDetectedFoods}
                  className="w-full h-12 bg-accent-green rounded-xl text-sm font-semibold text-bg-primary mt-3 active:scale-[0.98] transition-transform"
                >
                  Add All to Almuerzo
                </button>
                <button
                  onClick={() => { setPhotoPhase('camera'); setPhotoSheetOpen(false); }}
                  className="w-full h-11 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Retake Photo
                </button>
              </motion.div>
            )}
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* ═══════ Toast Notification ══════════════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed top-4 left-4 right-4 z-[80] flex justify-center pointer-events-none"
          >
            <div
              className={`px-4 py-3 rounded-xl shadow-elevated border border-divider pointer-events-auto ${
                toast.type === 'success' ? 'border-l-2 border-l-accent-green' : 'border-l-2 border-l-accent-blue'
              } bg-bg-elevated`}
            >
              <p className="text-sm text-text-primary">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ─── Hero Calorie Summary ───────────────────────────────────── */
function HeroCalorieSummary({
  totals,
  caloriePct,
}: {
  totals: { calories: number; protein: number; carbs: number; fats: number };
  caloriePct: number;
}) {
  const [displayCals, setDisplayCals] = useState(0);

  useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayCals(Math.round(totals.calories * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [totals.calories]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: snappy }}
      className="px-4 pt-6 pb-4"
    >
      {/* Hero number */}
      <div className="text-center mb-3">
        <motion.p
          className="text-5xl font-bold text-text-primary tabular-nums tracking-tight"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 80, damping: 20 }}
        >
          {displayCals.toLocaleString()}
        </motion.p>
        <p className="text-xs text-text-secondary mt-1">kcal consumed</p>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-bg-tertiary rounded-full overflow-hidden mb-2">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full gradient-calories"
          initial={{ width: '0%' }}
          animate={{ width: `${caloriePct}%` }}
          transition={{ duration: 0.8, ease: bounce }}
        />
      </div>
      <p className="text-[10px] text-text-muted text-right uppercase tracking-wider mb-4">
        {caloriePct}% of {CALORIE_TARGET.toLocaleString()} kcal
      </p>

      {/* Macro pills */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex items-center justify-center gap-3"
      >
        {[
          { label: 'P', value: totals.protein, target: MACRO_TARGETS.protein, color: 'accent-green', borderColor: '#00E676' },
          { label: 'C', value: totals.carbs, target: MACRO_TARGETS.carbs, color: 'accent-blue', borderColor: '#2979FF' },
          { label: 'F', value: totals.fats, target: MACRO_TARGETS.fats, color: 'accent-orange', borderColor: '#FF9100' },
        ].map((macro) => (
          <motion.div
            key={macro.label}
            variants={itemVariants}
            className="flex items-center gap-1.5 px-3 py-2 bg-bg-tertiary rounded-lg border-l-[3px]"
            style={{ borderLeftColor: macro.borderColor }}
          >
            <span className="text-xs text-text-secondary">
              {macro.label}:{' '}
              <span className="text-text-primary font-medium">{Math.round(macro.value)}g</span>
              {' / '}
              {macro.target}g
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

/* ─── Macro Donut Card ───────────────────────────────────────── */
function MacroDonutCard({
  donutData,
  totals,
}: {
  donutData: { name: string; value: number; color: string }[];
  totals: { calories: number; protein: number; carbs: number; fats: number };
}) {
  const totalGrams = totals.protein + totals.carbs + totals.fats;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: snappy }}
      className="mx-4 mt-3 p-4 bg-bg-secondary rounded-2xl border border-divider"
    >
      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={66}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-text-primary tabular-nums">{totals.calories}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">kcal</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {[
            { name: 'Protein', value: totals.protein, target: MACRO_TARGETS.protein, color: COLORS.protein, pct: totalGrams > 0 ? Math.round((totals.protein / totalGrams) * 100) : 0 },
            { name: 'Carbs', value: totals.carbs, target: MACRO_TARGETS.carbs, color: COLORS.carbs, pct: totalGrams > 0 ? Math.round((totals.carbs / totalGrams) * 100) : 0 },
            { name: 'Fats', value: totals.fats, target: MACRO_TARGETS.fats, color: COLORS.fats, pct: totalGrams > 0 ? Math.round((totals.fats / totalGrams) * 100) : 0 },
          ].map((macro) => (
            <div key={macro.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: macro.color }} />
                  <span className="text-xs text-text-primary">{macro.name}</span>
                </div>
                <span className="text-xs text-text-secondary tabular-nums">
                  {Math.round(macro.value)}g / {macro.target}g
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: bounce }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Meal Card ──────────────────────────────────────────────── */
function MealCard({
  meal,
  expanded,
  onToggle,
  onAddFood,
  onDeleteFood,
}: {
  meal: MealEntry;
  expanded: boolean;
  onToggle: () => void;
  onAddFood: () => void;
  onDeleteFood: (idx: number) => void;
}) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-divider overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            {MEAL_LABELS[meal.mealType] || meal.mealType}
          </span>
          <span className="text-xs text-text-secondary">— {meal.totalCalories} kcal</span>
          <span className="text-[10px] text-text-muted">{MEAL_TIMES[meal.mealType]}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFood();
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-accent-green active:opacity-70 transition-opacity"
          >
            <Plus size={14} />
            Add
          </button>
          {expanded ? (
            <ChevronUp size={18} className="text-text-muted" />
          ) : (
            <ChevronDown size={18} className="text-text-muted" />
          )}
        </div>
      </button>

      {/* Food items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: snappy }}
            className="overflow-hidden"
          >
            {meal.foods.length > 0 ? (
              <div className="px-4 pb-3">
                {meal.foods.map((food, i) => (
                  <SwipeableFoodItem
                    key={`${food.name}-${i}`}
                    food={food}
                    onDelete={() => onDeleteFood(i)}
                    isLast={i === meal.foods.length - 1}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-3"
              >
                <button
                  onClick={onAddFood}
                  className="w-full h-10 border-2 border-dashed border-divider rounded-lg flex items-center justify-center text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  Tap + to add foods
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Swipeable Food Item ────────────────────────────────────── */
function SwipeableFoodItem({
  food,
  onDelete,
  isLast,
}: {
  food: FoodItem;
  onDelete: () => void;
  isLast: boolean;
}) {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-100, 0], [1, 0]);
  const iconScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0]);

  return (
    <div className={`relative ${!isLast ? 'border-b border-divider' : ''}`}>
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 bg-accent-red rounded-lg flex items-center justify-end pr-4"
        style={{ opacity: bgOpacity }}
      >
        <motion.div style={{ scale: iconScale }}>
          <Trash2 size={18} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) onDelete();
        }}
        className="relative bg-bg-secondary py-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
      >
        <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center text-lg flex-shrink-0">
          <Utensils size={16} className="text-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{food.name}</p>
          <p className="text-xs text-text-muted">{food.serving}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-medium text-text-primary tabular-nums">{food.calories} kcal</p>
          <p className="text-[10px] text-text-muted tabular-nums">
            P:{Math.round(food.protein)}g C:{Math.round(food.carbs)}g F:{Math.round(food.fats)}g
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Frequent Foods Row ─────────────────────────────────────── */
function FrequentFoodsRow({
  foods,
  onQuickAdd,
}: {
  foods: typeof FREQUENT_FOODS;
  onQuickAdd: (food: (typeof FREQUENT_FOODS)[0]) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="mt-5"
    >
      <p className="px-4 text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2">
        Frequent Foods
      </p>
      <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex gap-2 pb-1"
        >
          {foods.map((food) => (
            <motion.button
              key={food.name}
              variants={itemVariants}
              whileTap={{ scale: 0.92 }}
              onClick={() => onQuickAdd(food)}
              className="flex-shrink-0 w-[100px] h-[80px] flex flex-col items-center justify-center gap-0.5 bg-bg-tertiary rounded-xl border border-divider snap-start active:bg-bg-elevated transition-colors"
            >
              <span className="text-2xl">{food.emoji}</span>
              <span className="text-[10px] font-medium text-text-primary truncate w-full text-center px-1">
                {food.name}
              </span>
              <span className="text-[10px] text-text-muted">~{food.calories}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ─── Nutrient Breakdown ─────────────────────────────────────── */
function NutrientBreakdown({
  totals,
}: {
  totals: { calories: number; protein: number; carbs: number; fats: number };
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mx-4 mt-5 mb-4 p-4 bg-bg-secondary rounded-2xl border border-divider"
    >
      <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-3">
        Nutrient Breakdown
      </p>

      {/* Micros */}
      <div className="space-y-3">
        {[
          { label: 'Fiber', value: Math.round(totals.carbs * 0.1), target: 38, color: 'accent-green', colorHex: '#00E676' },
          { label: 'Sugar', value: Math.round(totals.carbs * 0.15), target: 50, color: 'accent-orange', colorHex: '#FF9100' },
          { label: 'Sodium', value: 1800, target: 2300, color: 'accent-yellow', colorHex: '#FFD740', unit: 'mg' },
          { label: 'Cholesterol', value: 180, target: 0, color: 'accent-blue', colorHex: '#2979FF', unit: 'mg', noTarget: true },
        ].map((micro) => (
          <div key={micro.label} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-24">{micro.label}</span>
            <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: micro.colorHex }}
                initial={{ width: '0%' }}
                animate={{
                  width: micro.noTarget
                    ? '60%'
                    : `${Math.min((micro.value / micro.target) * 100, 100)}%`,
                }}
                transition={{ duration: 0.5, ease: snappy }}
              />
            </div>
            <span className="text-xs text-text-primary tabular-nums w-20 text-right">
              {micro.value.toLocaleString()}
              {micro.unit || 'g'}
              {!micro.noTarget && (
                <span className="text-text-muted"> / {micro.target}{micro.unit || 'g'}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ─── Weekly Chart Section ───────────────────────────────────── */
function WeeklyChartSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-4 space-y-4"
    >
      {/* 7-Day Macro Bar Chart */}
      <div className="bg-bg-secondary rounded-2xl border border-divider p-4">
        <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-4">
          7-Day Macro Breakdown
        </p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_DATA} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#8B9098', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8B9098', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 500]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#262930',
                  border: '1px solid #272A30',
                  borderRadius: '12px',
                  color: '#F5F6F7',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#F5F6F7' }}
                labelStyle={{ color: '#8B9098' }}
              />
              <Bar dataKey="protein" stackId="a" fill={COLORS.protein} radius={[0, 0, 0, 0]} />
              <Bar dataKey="carbs" stackId="a" fill={COLORS.carbs} radius={[0, 0, 0, 0]} />
              <Bar dataKey="fats" stackId="a" fill={COLORS.fats} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-bg-secondary rounded-2xl border border-divider p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-secondary">
              Avg: <span className="text-text-primary font-medium">2,650 kcal/day</span>
            </p>
            <p className="text-xs text-accent-green">
              Protein avg: <span className="font-medium">155g/day</span>
            </p>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="18" fill="none" stroke="#1E2028" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="#00E676"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(5 / 7) * 113} 113`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-text-primary">5/7</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-2">On track 5 of 7 days</p>
      </div>
    </motion.div>
  );
}

/* ─── Bottom Sheet (shared) ──────────────────────────────────── */
function BottomSheet({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-bg-secondary rounded-t-3xl border-t border-divider max-h-[85vh] overflow-y-auto scrollbar-hide"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-text-muted/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-tertiary"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-8">{children}</div>
      </motion.div>
    </motion.div>
  );
}
