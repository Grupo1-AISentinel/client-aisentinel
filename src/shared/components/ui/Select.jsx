import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

const Select = forwardRef(
  (
    {
      label,
      helper,
      error,
      options = [],
      placeholder = 'Seleccionar',
      className,
      wrapperClassName,
      id,
      required,
      leftIcon,
      rightIcon,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const selectId = id || autoId;
    const helperId = `${selectId}-helper`;
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="font-label text-[11px] text-on-surface-variant ml-1 tracking-wide"
          >
            {label}
            {required && <span className="text-error-bright ml-1">*</span>}
          </label>
        )}
        <div
          className={cn(
            'input-glow rounded-md h-11 relative flex items-center',
            error && 'border-error'
          )}
        >
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center [&_svg]:w-4 [&_svg]:h-4 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-full bg-transparent text-sm text-on-surface appearance-none cursor-pointer',
              'focus:outline-none focus:ring-0',
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              className
            )}
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%23c6c6cd%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M4 6l4 4 4-4z%27/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={helper || error ? helperId : undefined}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const label = typeof opt === 'object' ? opt.label : opt;
              return (
                <option
                  key={String(value)}
                  value={value}
                  className="bg-surface-container text-on-surface"
                >
                  {label}
                </option>
              );
            })}
          </select>
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center [&_svg]:w-4 [&_svg]:h-4">
              {rightIcon}
            </span>
          )}
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

Select.displayName = 'Select';

export default Select;
