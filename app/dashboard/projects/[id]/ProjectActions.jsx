'use client';

import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';

export function ProjectActions({ projectName }) {
  const { toast } = useToast();

  const mockAction = (title, description, variant = 'info') => () =>
    toast({ title, description, variant });

  return (
    <Dropdown
      label="Project actions"
      align="right"
      trigger={
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <Icon name="dots" className="h-5 w-5" />
        </span>
      }
      items={[
        {
          label: 'Edit project',
          icon: <Icon name="pencil" className="h-4 w-4" />,
          onClick: mockAction('Edit project', `Editing “${projectName}” is not available in this demo.`),
        },
        {
          label: 'Export summary',
          icon: <Icon name="download" className="h-4 w-4" />,
          onClick: mockAction('Export started', 'The project summary export is being prepared (mock).', 'success'),
        },
        { divider: true },
        {
          label: 'Delete project',
          icon: <Icon name="trash" className="h-4 w-4" />,
          danger: true,
          onClick: mockAction('Delete project', 'Deleting projects is disabled in this demo.', 'error'),
        },
      ]}
    />
  );
}
