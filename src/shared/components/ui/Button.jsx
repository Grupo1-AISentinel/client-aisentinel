import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

/* Variante principal: amarillo sólido con texto mostaza oscuro y glow generoso */
const variants = {
  primary: [
    'bg-amber-400 text-amber-900 font-bold',
    'border border-amber-300/70',
    'shadow-[var(--btn-primary-shadow)]',
    'hover:bg-amber-300 hover:border-amber-200',
    'hover:shadow-[var(--btn-primary-shadow-hover)]',
    'hover:-translate-y-px',
    'active:translate-y-0 active:bg-amber-500',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  success:
    'bg-success-bright !text-on-primary font-bold hover:bg-success hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] focus-visible:ring-2 focus-visible:ring-success-bright focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  danger:
    'bg-error-bright !text-on-primary font-bold hover:bg-error hover:shadow-[0_0_20px_rgba(255,138,128,0.4)] focus-visible:ring-2 focus-visible:ring-error-bright focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  subtle: [
    'border',
    'bg-[var(--btn-subtle-bg)] text-[var(--btn-subtle-text)]',
    'border-transparent',
    'hover:bg-[var(--btn-subtle-hover-bg)]',
    'focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  secondary: [
    'border',
    'bg-white/10 text-on-surface',
    'border-white/15',
    'hover:bg-white/15 hover:border-white/25',
    'focus-visible:ring-2 focus-visible:ring-on-surface focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  ghost: [
    'border border-transparent',
    'bg-transparent text-[var(--btn-ghost-text)]',
    'hover:bg-[var(--btn-ghost-hover-bg)]',
    'focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  outline: [
    'border',
    'bg-transparent text-[var(--btn-outline-text)]',
    'border-[var(--btn-outline-border)]',
    'hover:border-[var(--btn-outline-hover-border)] hover:bg-amber-400/10',
    'focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
};

/* Tamaños con padding generoso y altura cómoda */
const sizes = {
  xs: 'h-8 px-3 text-xs gap-1.5',
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2.5',
  xl: 'h-14 px-8 text-base gap-3',
};

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          'group relative inline-flex items-center justify-center rounded-md whitespace-nowrap',
          'transition-all duration-200 select-none font-semibold',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        style={
          isDisabled
            ? {
                backgroundColor: 'var(--btn-disabled-bg)',
                color: 'var(--btn-disabled-text)',
                borderColor: 'var(--btn-disabled-border)',
                opacity: 1,
              }
            : undefined
        }
        {...rest}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          leftIcon && <span className="inline-flex items-center shrink-0">{leftIcon}</span>
        )}
        <span className="font-label tracking-wide">{children}</span>
        {!loading && rightIcon && (
          <span className="btn-arrow-icon inline-flex items-center shrink-0" aria-hidden>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
