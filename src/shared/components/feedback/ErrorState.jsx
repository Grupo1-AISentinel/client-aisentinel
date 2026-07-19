import { AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../ui/index.js';

const ErrorState = ({ title = 'Algo salió mal', description, onRetry, className }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center gap-3 p-10 bg-surface-container border border-error/30 rounded-lg',
      'inner-glow-critical',
      className
    )}
  >
    <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center">
      <AlertCircle className="w-6 h-6 text-error-bright" />
    </div>
    <h3 className="text-base font-display font-semibold text-on-surface">{title}</h3>
    {description && <p className="text-sm text-on-surface-variant max-w-md">{description}</p>}
    {onRetry && (
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onRetry}
        leftIcon={<RefreshCcw className="w-4 h-4" />}
        className="mt-1"
      >
        Reintentar
      </Button>
    )}
  </div>
);

export default ErrorState;
