/* 50 notifications across 5 categories. Read state is persisted via
   hooks/useNotifications.js. Keep ids stable: not-001 … not-050. */

import { seededRandom, pick, intBetween } from '@/lib/utils';
import { projects } from './projects';
import { customers } from './customers';
import { teamMembers } from './team';

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

const TEMPLATES = [
  { category: 'project', title: 'Milestone reached', message: '{project} hit {pct}% completion ahead of schedule.' },
  { category: 'project', title: 'Deadline approaching', message: '{project} is due in {days} days — {pct}% complete.' },
  { category: 'project', title: 'Project at risk', message: '{project} was flagged at-risk: budget burn is above forecast.' },
  { category: 'task', title: 'Task assigned to you', message: '{member} assigned you “{task}”.' },
  { category: 'task', title: 'Task moved to review', message: '“{task}” was moved to Review by {member}.' },
  { category: 'task', title: 'Overdue task', message: '“{task}” is overdue by {days} days.' },
  { category: 'transaction', title: 'Payment received', message: '{customer} paid {amount} — invoice settled.' },
  { category: 'transaction', title: 'Payment failed', message: 'A {amount} charge for {customer} failed. Retry scheduled.' },
  { category: 'transaction', title: 'Refund issued', message: 'A {amount} refund was issued to {customer}.' },
  { category: 'team', title: 'New team member', message: '{member} joined the {dept} team. Say hello!' },
  { category: 'team', title: 'Time-off request', message: '{member} requested time off — approval needed.' },
  { category: 'system', title: 'Weekly digest ready', message: 'Your operations digest for last week is ready to view.' },
  { category: 'system', title: 'Maintenance window', message: 'Scheduled maintenance Sunday 02:00–04:00 UTC.' },
  { category: 'system', title: 'New feature released', message: 'Custom dashboard widgets are now generally available.' },
];

const TASK_NAMES = ['API contract review', 'Empty state designs', 'Auth token migration', 'Load test report', 'Roadmap draft', 'Scheduler timezone fix'];

export const baseNotifications = Array.from({ length: 50 }, (_, i) => {
  const rand = seededRandom(5000 + i);
  const tpl = pick(rand, TEMPLATES);
  const project = pick(rand, projects);
  const customer = pick(rand, customers);
  const member = pick(rand, teamMembers);
  const message = tpl.message
    .replace('{project}', project.name)
    .replace('{pct}', String(intBetween(rand, 35, 98)))
    .replace('{days}', String(intBetween(rand, 1, 14)))
    .replace('{member}', member.name)
    .replace('{task}', pick(rand, TASK_NAMES))
    .replace('{customer}', customer.company)
    .replace('{amount}', `$${intBetween(rand, 2, 60)},${intBetween(rand, 100, 999)}`)
    .replace('{dept}', member.department);
  return {
    id: `not-${String(i + 1).padStart(3, '0')}`,
    category: tpl.category,
    title: tpl.title,
    message,
    read: i >= 18, // first 18 start unread
    createdAt: hoursAgo(intBetween(rand, 0, 160)),
    link:
      tpl.category === 'project' ? `/dashboard/projects/${project.id}`
      : tpl.category === 'task' ? '/dashboard/tasks'
      : tpl.category === 'transaction' ? '/dashboard/transactions'
      : tpl.category === 'team' ? '/dashboard/team'
      : '/dashboard/overview',
  };
}).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
