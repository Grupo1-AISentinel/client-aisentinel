import { useEffect, useRef, useState } from 'react';
import { X, ShieldAlert, ShieldCheck, AlertTriangle, User } from 'lucide-react';
import { cn } from '../../../shared/utils/cn.js';
import { formatRelativeTime } from '../../../shared/utils/formatters.js';
import {
  classifyStudent,
  studentLabel,
  STATE_LABEL,
  DETECTION_STATES,
} from '../utils/detectionColors.js';

const REASONS = {
  UNIFORME_INCOMPLETO: 'Uniforme incompleto',
  ACCESORIO_NO_PERMITIDO: 'Accesorio no permitido',
  PERSONA_DESCONOCIDA: 'Persona desconocida',
};

const getInitials = (name = '', surname = '') =>
  `${(name[0] || '').toUpperCase()}${(surname[0] || '').toUpperCase()}`;

const AUTO_DISMISS_MS = 8000;
const FADE_OUT_MS = 220;

// Mapa icono + color por estado semantico. Replicamos los colores que
// usa LiveBoundingBoxes para mantener consistencia visual entre el
// panel de la esquina y el bbox sobre el video.
const STATE_VISUAL = {
  [DETECTION_STATES.COMPLY]: {
    icon: ShieldCheck,
    borderClass: 'border-success/30',
    circleBg: 'bg-success/20 text-success-bright border-success/30',
    badgeBg: 'bg-success/20 text-success-bright border-success/30',
  },
  [DETECTION_STATES.PARTIAL]: {
    icon: AlertTriangle,
    borderClass: 'border-warning/40',
    circleBg: 'bg-warning/20 text-warning-bright border-warning/30',
    badgeBg: 'bg-warning/20 text-warning-bright border-warning/30',
  },
  [DETECTION_STATES.UNKNOWN]: {
    icon: User,
    borderClass: 'border-warning/30',
    circleBg: 'bg-warning/15 text-warning-bright border-warning/25',
    badgeBg: 'bg-warning/15 text-warning-bright border-warning/25',
  },
  [DETECTION_STATES.INFRACTION]: {
    icon: ShieldAlert,
    borderClass: 'border-error/40',
    circleBg: 'bg-error/20 text-error-bright border-error/30',
    badgeBg: 'bg-error/20 text-error-bright border-error/30',
  },
};

const DetectionOverlay = ({ detection, onDismiss }) => {
  const [exiting, setExiting] = useState(false);
  const [age, setAge] = useState(0);
  const timersRef = useRef([]);

  useEffect(() => {
    if (!detection) return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExiting(false);
    setAge(0);
    timersRef.current = [];
    const ageInterval = setInterval(() => setAge((a) => a + 1), 1000);
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      const fadeTimer = setTimeout(() => onDismiss?.(detection._id), FADE_OUT_MS);
      timersRef.current.push(fadeTimer);
    }, AUTO_DISMISS_MS);
    timersRef.current.push(ageInterval, dismissTimer);
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detection?._id]);

  if (!detection) return null;

  // Mismo clasificador que LiveBoundingBoxes, para que el panel de la
  // esquina muestre el MISMO estado que el bbox del video.
  const state = classifyStudent(detection);
  const visual = STATE_VISUAL[state] || STATE_VISUAL[DETECTION_STATES.UNKNOWN];
  const Icon = visual.icon;

  const isUnknown = state === DETECTION_STATES.UNKNOWN;

  const statusLabel = STATE_LABEL[state];
  const reasonLabel = REASONS[detection.reason] || detection.reason;
  // Para mostrar en el panel: si es desconocido usamos 'Desconocido'
  // (mismo texto que el bbox). Si tiene nombre real, nombre completo.
  const displayName = isUnknown ? 'Desconocido' : studentLabel(detection);
  const initials = isUnknown ? '?' : getInitials(detection.studentName, detection.studentSurname);
  const timestamp = detection.lastDetection || detection.createdAt;

  return (
    <div
      className={cn(
        'pointer-events-auto glass-panel-solid rounded-lg border p-3 flex items-center gap-3 min-w-[280px] max-w-[340px] shadow-elevated',
        visual.borderClass,
        exiting ? 'animate-fade-in opacity-0' : 'animate-slide-right'
      )}
      style={{ transition: 'opacity 0.2s ease-out' }}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
          visual.circleBg
        )}
      >
        {initials || <User className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs font-bold text-on-surface truncate">
            {isUnknown ? 'Sin carnet' : detection.studentCard}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-1 font-label text-[9px] px-1.5 py-0.5 rounded-full',
              visual.badgeBg
            )}
          >
            <Icon className="w-2.5 h-2.5" />
            {statusLabel}
          </span>
        </div>
        {displayName && <p className="text-xs text-on-surface-variant truncate">{displayName}</p>}
        {/* Detalle textual: mostramos clothingDetails si existe y NO es
            unknown (los desconocidos no tienen detalles de uniforme). En
            estado Parcial o Infraccion ayuda a entender que falta. */}
        {!isUnknown && detection.clothingDetails && (
          <p className="font-label text-[9px] text-on-surface-dim mt-0.5 truncate">
            {detection.clothingDetails}
          </p>
        )}
        {isUnknown && (
          <p className="font-label text-[9px] text-on-surface-dim mt-0.5">
            Persona no registrada en la base de datos
          </p>
        )}
        <p className="font-label text-[9px] text-on-surface-dim mt-0.5">
          {reasonLabel} · hace {formatRelativeTime(timestamp, age)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          timersRef.current.forEach((t) => clearTimeout(t));
          timersRef.current = [];
          setExiting(true);
          setTimeout(() => onDismiss?.(detection._id), FADE_OUT_MS);
        }}
        className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/10 shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default DetectionOverlay;
