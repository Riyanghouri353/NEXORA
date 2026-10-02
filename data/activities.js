/* 30 activity events for the dashboard feed + detail timelines. */

import { seededRandom, pick, intBetween } from '@/lib/utils';
import { projects } from './projects';
import { customers } from './customers';
import { teamMembers } from './team';

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

const TEMPLATES = [
  (p, c, m) => ({ type: 'project', text: `${m.name} updated the timeline on ${p.name}` }),
  (p, c, m) => ({ type: 'task', text: `${m.name} completed a task in ${p.name}` }),
  (p, c, m) => ({ type: 'transaction', text: `Invoice for ${c.company} was paid in full` }),
  (p, c, m) => ({ type: 'customer', text: `${m.name} added a note to ${c.company}` }),
  (p, c, m) => ({ type: 'team', text: `${m.name} joined ${p.name}` }),
  (p, c, m) => ({ type: 'project', text: `${p.name} moved to a new milestone` }),
  (p, c, m) => ({ type: 'task', text: `${m.name} commented on a task in ${p.name}` }),
  (p, c, m) => ({ type: 'system', text: `Weekly report for ${c.company} was generated` }),
];

export const activities = Array.from({ length: 30 }, (_, i) => {
  const rand = seededRandom(8000 + i);
  const p = pick(rand, projects);
  const c = pick(rand, customers);
  const m = pick(rand, teamMembers);
  const tpl = pick(rand, TEMPLATES)(p, c, m);
  return {
    id: `act-${String(i + 1).padStart(3, '0')}`,
    type: tpl.type,
    text: tpl.text,
    actorId: m.id,
    projectId: p.id,
    customerId: c.id,
    createdAt: hoursAgo(intBetween(rand, 0, 200)),
  };
}).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export function activitiesForProject(projectId) {
  return activities.filter((a) => a.projectId === projectId);
}

export function activitiesForCustomer(customerId) {
  return activities.filter((a) => a.customerId === customerId);
}
