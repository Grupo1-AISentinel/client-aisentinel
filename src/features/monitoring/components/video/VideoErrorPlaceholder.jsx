import { CameraOff, ShieldOff, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../../../shared/components/ui/index.js';
import { cn } from '../../../../shared/utils/cn.js';

const ICON_FOR = {
  NotAllowedError: ShieldOff,
  NotFoundError: CameraOff,
  OverconstrainedError: CameraOff,
  NotReadableError: Lock,
  SecurityError: ShieldOff,
  UnsupportedError: AlertTriangle,
};

const VideoErrorPlaceholder = ({ error, onRetry, compact = false, message }) => {
  const Icon = (error?.name && ICON_FOR[error.name]) || AlertTriangle;
  const text = message || error?.message || 'No se pudo iniciar la fuente de video.';
  return (
    <div
      className={cn(
        'absolute inset-0 grid place-items-center bg-surface-container-lowest text-on-surface-variant',
        compact ? 'p-3' : 'p-6'
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center max-w-xs">
        <Icon className="w-8 h-8 opacity-70" />
        <p className={cn('text-sm', compact && 'text-xs')}>{text}</p>
        {onRetry && (
          <Button size="xs" variant="subtle" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
};

export const VideoConnecting = ({ message = 'Conectando…' }) => (
  <div className="absolute inset-0 grid place-items-center bg-surface-container-lowest text-on-surface-variant">
    <div className="flex flex-col items-center gap-2 text-sm">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>{message}</span>
    </div>
  </div>
);

export default VideoErrorPlaceholder;
