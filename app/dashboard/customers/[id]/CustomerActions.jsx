'use client';

import { Button, IconButton } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';

/* Header actions for the customer detail page. All demo actions toast a mock confirmation. */
export function CustomerActions({ customer }) {
  const { toast } = useToast();
  const company = (customer && customer.company) || 'customer';

  const mock = (label, description) =>
    toast({
      title: label,
      description: description || `“${label}” is a demo action for ${company}. Nothing was changed.`,
      variant: 'info',
    });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        leftIcon={<Icon name="pencil" className="h-4 w-4" />}
        onClick={() => mock('Edit customer', `Editing ${company} is not wired up in this demo.`)}
      >
        Edit
      </Button>
      <Dropdown
        label="More customer actions"
        align="right"
        trigger={
          <IconButton label="More customer actions">
            <Icon name="dots" className="h-5 w-5" />
          </IconButton>
        }
        items={[
          { label: 'Log a call', icon: <Icon name="clock" className="h-4 w-4" />, onClick: () => mock('Log a call') },
          { label: 'Send email', icon: <Icon name="bell" className="h-4 w-4" />, onClick: () => mock('Send email') },
          {
            label: 'Export profile',
            icon: <Icon name="download" className="h-4 w-4" />,
            onClick: () => mock('Export profile'),
          },
          { divider: true },
          {
            label: 'Archive customer',
            icon: <Icon name="trash" className="h-4 w-4" />,
            danger: true,
            onClick: () => mock('Archive customer'),
          },
        ]}
      />
    </div>
  );
}
