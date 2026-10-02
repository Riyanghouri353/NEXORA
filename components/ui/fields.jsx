'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

const inputCls =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:disabled:bg-slate-800';

const errorCls =
  'border-red-500 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500';

function FieldWrapper({ label, error, hint, id, required, children, className }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, error, hint, id: idProp, className, ...rest }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id} required={rest.required}>
      <input
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputCls, error && errorCls, className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Textarea({ label, error, hint, id: idProp, className, rows = 4, ...rest }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id} required={rest.required}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputCls, 'resize-y', error && errorCls, className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Select({ label, error, hint, id: idProp, className, children, ...rest }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id} required={rest.required}>
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputCls, 'pr-8', error && errorCls, className)}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

/* Compact select without label wrapper — for filter bars */
export function FilterSelect({ label, className, children, ...rest }) {
  return (
    <label className="inline-flex items-center gap-2">
      {label && <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>}
      <select
        aria-label={label || 'Filter'}
        className={cn(
          'h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
          className
        )}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className, autoFocus }) {
  return (
    <div className={cn('relative', className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
        className={cn(inputCls, 'pl-9', value && 'pr-9')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}
