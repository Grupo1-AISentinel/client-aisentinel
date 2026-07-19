import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

/* Variante principal: tokens de tema para mantener contraste en claro y oscuro. */
const variants = {
  primary: [
    'btn-primary-style',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'hover:-translate-y-px hover:shadow-[var(--btn-primary-shadow-hover)]',
    'active:translate-y-0',
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
    'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)]',
    'border-[var(--btn-secondary-border)]',
    'hover:bg-[var(--btn-secondary-bg-hover)] hover:border-[var(--btn-secondary-border-hover)]',
    'focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
        <span className="font-semibold tracking-normal leading-none">{children}</span>
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
