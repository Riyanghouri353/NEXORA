'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ label, description, className, id: idProp, ...rest }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 bg-white text-brand-600 shadow-sm transition focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900"
        {...rest}
      />
      {label && (
        <label htmlFor={id} className="cursor-pointer text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">{label}</span>
          {description && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
        </label>
      )}
    </div>
  );
}

export function Switch({ label, description, checked, onChange, disabled, className, id: idProp }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </label>
          )}
          {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-950',
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
