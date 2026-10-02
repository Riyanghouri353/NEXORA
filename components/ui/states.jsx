'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

function StateShell({ icon, title, description, action, className, children }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
      {children}
    </div>
  );
}

const defaultEmptyIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export function EmptyState({ icon = defaultEmptyIcon, title = 'Nothing here yet', description, action, className }) {
  return <StateShell icon={icon} title={title} description={description} action={action} className={className} />;
}

const defaultErrorIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export function ErrorState({
  icon = defaultErrorIcon,
  title = 'Something went wrong',
  description = 'We couldn’t load this data. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}) {
  return (
    <StateShell
      icon={<span className="text-red-500 dark:text-red-400">{icon}</span>}
      title={title}
      description={description}
      className={className}
      action={onRetry ? <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button> : undefined}
    />
  );
}
