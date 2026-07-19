import { forwardRef, useId, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { AlertCircle, Check } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      helper,
      error,
      leftIcon,
      rightIcon,
      className,
      wrapperClassName,
      id,
      type = 'text',
      required,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id || autoId;
    const helperId = `${inputId}-helper`;
    const [focused, setFocused] = useState(false);

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'font-label text-[11px] ml-1 tracking-[0.08em] transition-colors duration-200',
              focused ? 'text-amber-300' : 'text-on-surface-variant'
            )}
          >
            {label}
            {required && (
              <span className="text-error-bright ml-1 font-bold" aria-hidden>
                *
              </span>
            )}
          </label>
        )}
        <div
          className={cn(
            'input-glow rounded-md h-12 relative flex items-center',
            focused && 'animate-ring-expand',
            error && 'border-error/70 focus-within:border-error'
          )}
        >
          {leftIcon && (
            <span
              className={cn(
                'absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center [&_svg]:w-4 [&_svg]:h-4 pointer-events-none transition-colors duration-200',
                focused ? 'text-amber-300' : 'text-on-surface-variant'
              )}
              aria-hidden
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            onFocus={(e) => {
              setFocused(true);
              onFocusProp?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlurProp?.(e);
            }}
            className={cn(
              'peer w-full h-full bg-transparent text-[15px] text-on-surface',
              'placeholder:text-on-surface-dim',
              'focus:outline-none focus:ring-0',
              leftIcon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={helper || error ? helperId : undefined}
            {...rest}
          />
          {rightIcon && (
            <span
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 flex items-center [&_svg]:w-4 [&_svg]:h-4 transition-colors duration-200',
                focused ? 'text-amber-300' : 'text-on-surface-variant'
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {(helper || error) && (
          <p
            id={helperId}
            className={cn(
              'text-xs ml-1 flex items-center gap-1.5',
              error ? 'text-error-bright' : 'text-on-surface-dim'
            )}
          >
            {error ? (
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            ) : (
              helper && <Check className="w-3.5 h-3.5 flex-shrink-0 text-amber-300" aria-hidden />
            )}
            <span>{error || helper}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
