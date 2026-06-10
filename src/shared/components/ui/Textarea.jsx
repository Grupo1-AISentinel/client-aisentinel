import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

const Textarea = forwardRef(
  ({ label, helper, error, className, wrapperClassName, id, required, rows = 3, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    const helperId = `${inputId}-helper`;
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-label text-[11px] text-on-surface-variant ml-1 tracking-wide"
          >
            {label}
            {required && <span className="text-error-bright ml-1">*</span>}
          </label>
        )}
        <div className={cn('input-glow rounded-md relative', error && 'border-error')}>
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            className={cn(
              'w-full bg-transparent text-sm text-on-surface p-3 resize-y',
              'placeholder:text-on-surface-dim',
              'focus:outline-none focus:ring-0',
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={helper || error ? helperId : undefined}
            {...rest}
          />
        </div>
        {(helper || error) && (
          <p
            id={helperId}
            className={cn('text-xs ml-1', error ? 'text-error-bright' : 'text-on-surface-dim')}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
