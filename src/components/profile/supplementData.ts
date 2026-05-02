export type SupplementTier = 'Esencial' | 'Recomendado' | 'Opcional';
export type EvidenceLevel = 'A' | 'B' | 'C';

export interface SupplementDetail {
  id: number;
  name: string;
  dosage: string;
  timing: string;
  tier: SupplementTier;
  evidence: EvidenceLevel;
  description: string;
  benefits: string[];
  instructions: string;
  monthlyCost: string;
  buyLink: string;
  image: string;
  taken: boolean;
}

export const SUPPLEMENTS_DATA: SupplementDetail[] = [
  {
    id: 1,
    name: 'Creatina Monohidratada',
    dosage: '5g/día',
    timing: 'Cualquier momento',
    tier: 'Esencial',
    evidence: 'A',
    description: 'Aumenta las reservas de fosfocreatina para mejorar la fuerza y potencia muscular.',
    benefits: [
      'Aumento de fuerza y potencia',
      'Mejora la recuperación entre series',
      'Aumenta la masa muscular magra',
      'Beneficios cognitivos documentados',
    ],
    instructions: 'Tomar 5g diarios, preferiblemente post-entreno. No requiere fase de carga.',
    monthlyCost: '~$8/mes',
    buyLink: 'Creapure®',
    image: '/supplement-creatine.jpg',
    taken: true,
  },
  {
    id: 2,
    name: 'Whey Protein',
    dosage: '30g post-entreno',
    timing: 'Post-entreno',
    tier: 'Esencial',
    evidence: 'A',
    description: 'Proteína de rápida absorción ideal para la recuperación post-entreno.',
    benefits: [
      'Recuperación muscular rápida',
      'Alto contenido de leucina',
      'Conveniente para alcanzar proteína diaria',
      'Digestión rápida',
    ],
    instructions: '30-40g post-entreno o como snack proteico entre comidas.',
    monthlyCost: '~$25/mes',
    buyLink: 'Optimum Nutrition Gold Standard',
    image: '/supplement-whey.jpg',
    taken: true,
  },
  {
    id: 3,
    name: 'Cafeína',
    dosage: '250mg pre-entreno',
    timing: 'Pre-entreno',
    tier: 'Esencial',
    evidence: 'A',
    description: 'Estimulante que mejora el rendimiento, enfoque y capacidad de entrenamiento.',
    benefits: [
      'Aumento de energía y enfoque',
      'Mejora del rendimiento físico',
      'Aumento del gasto calórico',
      'Reduce la percepción del esfuerzo',
    ],
    instructions: '250-350mg 30-45 minutos antes del entrenamiento. Evitar después de las 6pm.',
    monthlyCost: '~$5/mes',
    buyLink: 'Bulk Supplements',
    image: '/supplement-creatine.jpg',
    taken: true,
  },
  {
    id: 4,
    name: 'Magnesio Glicinato',
    dosage: '400mg antes de dormir',
    timing: 'Antes de dormir',
    tier: 'Esencial',
    evidence: 'B',
    description: 'Mineral esencial para la recuperación muscular, calidad del sueño y función nerviosa.',
    benefits: [
      'Mejora la calidad del sueño',
      'Reduce calambres musculares',
      'Apoya la recuperación',
      'Reduce el estrés y ansiedad',
    ],
    instructions: '200-400mg antes de dormir. La forma de glicinato tiene mejor absorción.',
    monthlyCost: '~$12/mes',
    buyLink: 'Doctor\'s Best High Absorption Magnesium',
    image: '/supplement-omega3.jpg',
    taken: true,
  },
  {
    id: 5,
    name: 'Omega-3',
    dosage: '3g EPA+DHA',
    timing: 'Con comidas',
    tier: 'Recomendado',
    evidence: 'A',
    description: 'Ácidos grasos esenciales con potentes efectos antiinflamatorios y cardiovasculares.',
    benefits: [
      'Reduce la inflamación muscular',
      'Apoya la salud cardiovascular',
      'Mejora la densidad ósea',
      'Beneficios para la salud cerebral',
    ],
    instructions: '2-3g de EPA+DHA total diarios, divididos en 2-3 tomas con comidas.',
    monthlyCost: '~$15/mes',
    buyLink: 'Nordic Naturals Ultimate Omega',
    image: '/supplement-omega3.jpg',
    taken: false,
  },
  {
    id: 6,
    name: 'Vitamina D3',
    dosage: '4000 UI',
    timing: 'Mañanas',
    tier: 'Recomendado',
    evidence: 'A',
    description: 'Vitamina liposoluble crucial para la salud ósea, inmunidad y función muscular.',
    benefits: [
      'Fortalece el sistema inmune',
      'Apoya la salud ósea',
      'Mejora la función muscular',
      'Regula los niveles de testosterona',
    ],
    instructions: '2000-4000 UI diarias por la mañana con una comida que contenga grasa.',
    monthlyCost: '~$6/mes',
    buyLink: 'NOW Foods Vitamin D-3 5000 IU',
    image: '/supplement-creatine.jpg',
    taken: true,
  },
  {
    id: 7,
    name: 'Ashwagandha',
    dosage: '600mg',
    timing: 'Mañanas',
    tier: 'Recomendado',
    evidence: 'B',
    description: 'Adaptógeno que reduce el estrés, mejora la recuperación y apoya los niveles de testosterona.',
    benefits: [
      'Reduce el cortisol (estrés)',
      'Mejora la fuerza y masa muscular',
      'Aumenta los niveles de testosterona',
      'Mejora la calidad del sueño',
    ],
    instructions: '300-600mg de extracto estandarizado (KSM-66) por la mañana.',
    monthlyCost: '~$18/mes',
    buyLink: 'KSM-66 Ashwagandha',
    image: '/supplement-whey.jpg',
    taken: false,
  },
];

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: 'Sedentario', value: 1.2, desc: 'Poco o ningún ejercicio' },
  light: { label: 'Ligero', value: 1.375, desc: 'Ejercicio 1-3 días/semana' },
  moderate: { label: 'Moderado', value: 1.55, desc: 'Ejercicio 3-5 días/semana' },
  active: { label: 'Activo', value: 1.725, desc: 'Ejercicio 6-7 días/semana' },
  very_active: { label: 'Muy Activo', value: 1.9, desc: 'Trabajo físico + entrenamiento' },
} as const;

export type ActivityKey = keyof typeof ACTIVITY_MULTIPLIERS;

export const GOAL_ADJUSTMENTS = {
  aggressive_loss: { label: 'Pérdida agresiva', calories: -750, desc: '-0.75kg/semana' },
  moderate_loss: { label: 'Pérdida moderada', calories: -500, desc: '-0.5kg/semana' },
  mild_loss: { label: 'Pérdida ligera', calories: -250, desc: '-0.25kg/semana' },
  maintenance: { label: 'Mantenimiento', calories: 0, desc: 'Peso estable' },
  mild_gain: { label: 'Superávit ligero', calories: 250, desc: '+0.25kg/semana' },
  moderate_gain: { label: 'Superávit fuerte', calories: 500, desc: '+0.5kg/semana' },
} as const;

export type GoalKey = keyof typeof GOAL_ADJUSTMENTS;

export const MACRO_PRESETS = {
  balanced: { label: 'Balanceado', protein: 30, carbs: 40, fat: 30 },
  low_carb: { label: 'Bajo Carb', protein: 40, carbs: 20, fat: 40 },
  high_carb: { label: 'Alto Carb', protein: 25, carbs: 55, fat: 20 },
  keto: { label: 'Keto', protein: 25, carbs: 5, fat: 70 },
} as const;

export type MacroPresetKey = keyof typeof MACRO_PRESETS;

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityKey: ActivityKey
): number {
  // Mifflin-St Jeor Equation
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityKey].value);
}

export function calculateMacroGrams(
  calories: number,
  proteinPct: number,
  carbsPct: number,
  fatPct: number,
  weight?: number
) {
  const protein = weight
    ? Math.round((proteinPct / 100) * weight) // g per kg bodyweight when weight provided
    : Math.round((calories * (proteinPct / 100)) / 4);
  const carbs = Math.round((calories * (carbsPct / 100)) / 4);
  const fat = Math.round((calories * (fatPct / 100)) / 9);
  return { protein, carbs, fat };
}
