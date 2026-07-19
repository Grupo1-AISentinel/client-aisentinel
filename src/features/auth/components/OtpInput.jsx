import { useRef, useEffect, useCallback } from 'react';
import { cn } from '../../../shared/utils/cn.js';

const OtpInput = ({ value = '', onChange, length = 6, disabled, autoFocus = true, error }) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const setRef = useCallback((el, index) => {
    inputsRef.current[index] = el;
  }, []);

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(0, 1);
    const next = (value || '').split('');
    next[index] = digit;
    const result = next.join('').slice(0, length);
    onChange?.(result);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (!value?.[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        const next = (value || '').split('');
        next[index] = '';
        onChange?.(next.join('').slice(0, length));
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const data = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!data) return;
    onChange?.(data);
    const focusIndex = Math.min(data.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => setRef(el, index)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value?.[index] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={cn(
            'w-12 h-14 text-center text-2xl font-display font-semibold',
            'bg-surface-container-low text-on-surface border rounded-md',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400',
            'focus:shadow-[0_0_0_4px_rgba(245,197,58,0.12)]',
            'hover:border-amber-300/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error focus:ring-error focus:border-error' : 'border-outline-soft'
          )}
          aria-label={`Dígito ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
