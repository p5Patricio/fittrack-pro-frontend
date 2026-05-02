import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  Trash2,
  Ruler,
  Moon,
  Bell,
  Info,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';

interface SettingsCardProps {
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
  onClearData: () => void;
}

export default function SettingsCard({ units, onToggleUnits, onClearData }: SettingsCardProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notifications, setNotifications] = useState({
    workout: true,
    supplement: true,
    weighIn: true,
    achievements: false,
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile: {
        name: 'Alex',
        age: 22,
        height: 172,
        weight: 81.5,
        goal: 'Body Recomposition',
      },
      nutrition: {
        targets: { calories: 2800, protein: 170, carbs: 365, fats: 75 },
        logs: [],
      },
      workouts: [],
      supplements: [],
      weightLog: [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        console.log('Imported data:', data);
        alert('Datos importados correctamente');
      } catch {
        alert('Error al importar: archivo JSON invalido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const settingsRows = [
    {
      key: 'export',
      icon: Download,
      iconColor: 'text-accent-green',
      label: 'Exportar Datos',
      action: handleExport,
    },
    {
      key: 'import',
      icon: Upload,
      iconColor: 'text-accent-blue',
      label: 'Importar Datos',
      action: handleImportClick,
    },
    {
      key: 'clear',
      icon: Trash2,
      iconColor: 'text-accent-red',
      label: 'Borrar Todos los Datos',
      action: () => setShowClearConfirm(true),
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="bg-bg-secondary rounded-2xl border border-divider overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <span className="text-[11px] font-medium tracking-wide uppercase text-text-muted">
            Datos y Configuracion
          </span>
        </div>

        {/* Settings Rows */}
        <div className="divide-y divide-divider">
          {/* Data management rows */}
          {settingsRows.map((row, index) => {
            const Icon = row.icon;
            return (
              <motion.button
                key={row.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={row.action}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-tertiary/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={row.iconColor} />
                  <span className="text-[14px] text-text-primary">{row.label}</span>
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </motion.button>
            );
          })}

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Units Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.54 }}
            className="flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <Ruler size={20} className="text-text-secondary" />
              <span className="text-[14px] text-text-primary">Unidades</span>
            </div>
            <div className="flex items-center bg-bg-tertiary rounded-xl p-0.5">
              <button
                onClick={onToggleUnits}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  units === 'metric'
                    ? 'bg-bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                    : 'text-text-secondary'
                }`}
              >
                Metrico
              </button>
              <button
                onClick={onToggleUnits}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  units === 'imperial'
                    ? 'bg-bg-elevated text-text-primary shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                    : 'text-text-secondary'
                }`}
              >
                Imperial
              </button>
            </div>
          </motion.div>

          {/* Dark Mode Toggle (decorative) */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.57 }}
            className="flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-text-secondary" />
              <span className="text-[14px] text-text-primary">Modo Oscuro</span>
            </div>
            <div className="relative w-12 h-7 rounded-full bg-accent-green cursor-default">
              <motion.div
                animate={{ x: 20 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              />
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.button
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNotifications(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-tertiary/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-text-secondary" />
              <span className="text-[14px] text-text-primary">Notificaciones</span>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </motion.button>

          {/* About */}
          <motion.button
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.63 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAbout(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-tertiary/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Info size={20} className="text-text-secondary" />
              <span className="text-[14px] text-text-primary">Acerca de FitTrack Pro</span>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </motion.button>
        </div>
      </motion.div>

      {/* Clear Data Confirmation Dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative bg-bg-secondary rounded-2xl border border-divider p-5 w-full max-w-[320px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent-red/15 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-accent-red" />
                </div>
                <h3 className="text-[18px] font-bold text-text-primary">Borrar Datos</h3>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-5">
                Esto eliminara todos tus datos de forma permanente. No se puede deshacer.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-bg-tertiary text-[14px] text-text-primary font-medium"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClearData();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-accent-red text-[14px] text-white font-medium"
                >
                  Borrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Bottom Sheet */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-bg-secondary rounded-t-3xl"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-text-muted/30" />
              </div>
              <div className="px-4 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[22px] font-bold text-text-primary">Notificaciones</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-1.5 rounded-lg hover:bg-bg-tertiary">
                    <X size={18} className="text-text-secondary" />
                  </button>
                </div>

                <div className="space-y-1">
                  {[
                    { key: 'workout', label: 'Recordatorios de entreno', desc: 'Notificacion antes de cada sesion' },
                    { key: 'supplement', label: 'Recordatorios de suplementos', desc: 'Recuerda tomar tus suplementos' },
                    { key: 'weighIn', label: 'Registro de peso', desc: 'Recordatorio diario para pesarte' },
                    { key: 'achievements', label: 'Logros y hitos', desc: 'Notifica cuando alcances metas' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[14px] text-text-primary">{item.label}</p>
                        <p className="text-[11px] text-text-muted">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))
                        }
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? 'bg-accent-green' : 'bg-bg-elevated'
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: notifications[item.key as keyof typeof notifications] ? 20 : 2,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Bottom Sheet */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative bg-bg-secondary rounded-t-3xl"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-text-muted/30" />
              </div>
              <div className="px-4 pb-8 text-center">
                <button
                  onClick={() => setShowAbout(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-tertiary"
                >
                  <X size={18} className="text-text-secondary" />
                </button>

                <div className="w-16 h-16 rounded-2xl bg-bg-tertiary mx-auto mb-4 flex items-center justify-center">
                  <img src="/app-icon.png" alt="FitTrack Pro" className="w-12 h-12 rounded-xl" />
                </div>

                <h3 className="text-[22px] font-bold text-text-primary mb-1">FitTrack Pro</h3>
                <p className="text-[13px] text-text-secondary mb-4">Version 1.0.0</p>

                <div className="bg-bg-tertiary rounded-xl p-4 mb-4 text-left">
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    FitTrack Pro es tu compañero completo para el fitness. Rastrea nutricion, 
                    entrenamientos, peso, suplementos y salud — todo en un solo lugar.
                  </p>
                </div>

                <div className="bg-bg-tertiary rounded-xl p-4 text-left">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted mb-1">Disclaimer</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Esta aplicacion es solo para fines informativos. Consulta a un profesional 
                    de la salud antes de comenzar cualquier programa de ejercicio o dieta. 
                    Los calculos son estimaciones y pueden variar según el individuo.
                  </p>
                </div>

                <p className="text-[11px] text-text-muted mt-4">
                  2024 FitTrack Pro. Todos los derechos reservados.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
