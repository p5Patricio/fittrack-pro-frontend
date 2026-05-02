import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, X, CheckSquare, Square, Plus, Flame } from 'lucide-react';
import { SUPPLEMENTS_DATA, type SupplementDetail, type SupplementTier } from './supplementData';

interface SupplementTrackerProps {
  takenIds: number[];
  onToggle: (id: number) => void;
}

const tierColors: Record<SupplementTier, { bg: string; text: string; border: string }> = {
  Esencial: { bg: 'bg-accent-green/15', text: 'text-accent-green', border: 'border-accent-green/30' },
  Recomendado: { bg: 'bg-accent-blue/15', text: 'text-accent-blue', border: 'border-accent-blue/30' },
  Opcional: { bg: 'bg-accent-orange/15', text: 'text-accent-orange', border: 'border-accent-orange/30' },
};

const evidenceLabels: Record<string, string> = {
  A: 'Evidencia fuerte - 500+ estudios',
  B: 'Evidencia moderada - estudios prometedores',
  C: 'Evidencia limitada - resultados mixtos',
};

export default function SupplementTracker({ takenIds, onToggle }: SupplementTrackerProps) {
  const [selectedSupp, setSelectedSupp] = useState<SupplementDetail | null>(null);
  const [localTakenIds, setLocalTakenIds] = useState<Set<number>>(new Set(takenIds));

  const handleToggle = (id: number) => {
    setLocalTakenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    onToggle(id);
  };

  const supplements = SUPPLEMENTS_DATA;
  const streak = 12; // Mock streak

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="bg-bg-secondary rounded-2xl border border-divider p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pill size={14} className="text-text-muted" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted">
              Suplementos
            </span>
          </div>
          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-accent-yellow/15 text-accent-yellow flex items-center gap-1">
            <Flame size={10} />
            {streak} dias seguidos
          </span>
        </div>

        {/* Supplement Grid */}
        <div className="grid grid-cols-2 gap-3">
          {supplements.map((supp, index) => {
            const isTaken = localTakenIds.has(supp.id);
            const tier = supp.tier;
            const colors = tierColors[tier];

            return (
              <motion.button
                key={supp.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05, duration: 0.25 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggle(supp.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedSupp(supp);
                }}
                className={`relative bg-bg-tertiary rounded-xl border p-3 transition-colors text-left ${
                  isTaken
                    ? 'border-accent-green/50 bg-accent-green/5'
                    : 'border-divider'
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-2.5 right-2.5">
                  {isTaken ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <CheckSquare size={18} className="text-accent-green" />
                    </motion.div>
                  ) : (
                    <Square size={18} className="text-text-muted" />
                  )}
                </div>

                {/* Image */}
                <div className="w-10 h-10 rounded-lg bg-bg-secondary mx-auto mb-2 overflow-hidden flex items-center justify-center">
                  <img
                    src={supp.image}
                    alt={supp.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <Pill size={18} className="text-text-muted absolute" />
                </div>

                {/* Name */}
                <p className="text-[12px] font-medium text-text-primary text-center leading-tight mb-1">
                  {supp.name}
                </p>

                {/* Dosage */}
                <p className="text-[10px] text-text-muted text-center mb-1">
                  {supp.dosage}
                </p>

                {/* Timing */}
                <p className="text-[10px] text-text-muted text-center mb-2">
                  {supp.timing}
                </p>

                {/* Tier badge */}
                <div className="flex justify-center">
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {tier}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Add Supplement Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-divider flex items-center justify-center gap-2 text-[12px] text-text-secondary hover:bg-bg-tertiary/30 transition-colors"
        >
          <Plus size={14} />
          <span>Agregar Suplemento</span>
        </motion.button>

        {/* Hint */}
        <p className="text-[10px] text-text-muted text-center mt-2">
          Toca para marcar como tomado, mantén presionado para detalles
        </p>
      </motion.div>

      {/* Supplement Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedSupp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSupp(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-bg-secondary rounded-t-3xl max-h-[80vh] overflow-y-auto no-scrollbar"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-text-muted/30" />
              </div>

              <div className="px-4 pb-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-[22px] font-bold text-text-primary pr-4">
                    {selectedSupp.name}
                  </h3>
                  <button
                    onClick={() => setSelectedSupp(null)}
                    className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors shrink-0"
                  >
                    <X size={18} className="text-text-secondary" />
                  </button>
                </div>

                {/* Image */}
                <div className="w-20 h-20 rounded-2xl bg-bg-tertiary mx-auto mb-4 overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedSupp.image}
                    alt={selectedSupp.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <Pill size={28} className="text-text-muted absolute" />
                </div>

                {/* Tier Badge */}
                <div className="flex justify-center mb-4">
                  <span
                    className={`text-[11px] font-medium px-3 py-1.5 rounded-full ${tierColors[selectedSupp.tier].bg} ${tierColors[selectedSupp.tier].text}`}
                  >
                    {selectedSupp.tier} Tier
                  </span>
                </div>

                {/* Evidence Badge */}
                <div className="flex justify-center mb-4">
                  <span
                    className={`text-[10px] font-medium px-2 py-1 rounded-md ${
                      selectedSupp.evidence === 'A'
                        ? 'bg-accent-green/15 text-accent-green'
                        : selectedSupp.evidence === 'B'
                          ? 'bg-accent-blue/15 text-accent-blue'
                          : 'bg-accent-orange/15 text-accent-orange'
                    }`}
                  >
                    Evidencia {selectedSupp.evidence} - {evidenceLabels[selectedSupp.evidence]}
                  </span>
                </div>

                {/* Info Section */}
                <div className="space-y-3 mb-6">
                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Dosis</p>
                    <p className="text-[14px] text-text-primary">{selectedSupp.dosage}</p>
                  </div>
                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Timing</p>
                    <p className="text-[14px] text-text-primary">{selectedSupp.timing}</p>
                  </div>
                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Descripcion</p>
                    <p className="text-[13px] text-text-secondary leading-relaxed">
                      {selectedSupp.description}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">Beneficios</p>
                    <ul className="space-y-1.5">
                      {selectedSupp.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-green mt-1.5 shrink-0" />
                          <span className="text-[13px] text-text-secondary">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Instrucciones</p>
                    <p className="text-[13px] text-text-secondary leading-relaxed">
                      {selectedSupp.instructions}
                    </p>
                  </div>

                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Costo Mensual</p>
                    <p className="text-[14px] text-text-primary">{selectedSupp.monthlyCost}</p>
                  </div>

                  <div className="bg-bg-tertiary rounded-xl p-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Marca Recomendada</p>
                    <p className="text-[14px] text-accent-green">{selectedSupp.buyLink}</p>
                  </div>
                </div>

                {/* Toggle taken from detail */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleToggle(selectedSupp.id);
                  }}
                  className={`w-full py-3.5 rounded-xl font-semibold text-[15px] transition-colors ${
                    localTakenIds.has(selectedSupp.id)
                      ? 'bg-accent-green text-[#0F1215]'
                      : 'bg-bg-elevated text-text-primary border border-divider'
                  }`}
                >
                  {localTakenIds.has(selectedSupp.id) ? 'Marcado como tomado' : 'Marcar como tomado'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
