import { Camera, Video, Globe, Wifi } from 'lucide-react';
import { cn } from '../../../shared/utils/cn.js';
import { CAMERA_SOURCES } from '../camera.constants.js';

const ICONS = {
  webcam: Camera,
  video: Video,
  ip: Globe,
  wifi: Wifi,
};

const CameraSourceSelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {CAMERA_SOURCES.map((src) => {
        const Icon = ICONS[src.value];
        const selected = value === src.value;
        const disabled = src.comingSoon;
        return (
          <button
            key={src.value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(src.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 p-3 rounded-md border text-xs transition-all',
              'font-label uppercase tracking-wider',
              selected
                ? 'border-amber-400 bg-amber-400/10 text-secondary'
                : 'border-white/10 bg-surface-container-low text-on-surface-variant hover:border-white/30',
              disabled && 'opacity-40 cursor-not-allowed hover:border-white/10'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{src.label}</span>
            {disabled && (
              <span className="text-[9px] text-on-surface-dim normal-case">Próximamente</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CameraSourceSelector;
