/* 40 tasks. projectId -> projects, assigneeId -> teamMembers.
   Keep ids stable: tsk-001 … tsk-040. Local user changes are merged
   via hooks/useTasks.js (persisted to localStorage). */

import { seededRandom, pick, intBetween, daysAgo, daysFromNow } from '@/lib/utils';
import { projects } from './projects';
import { teamMembers } from './team';

const TITLES = [
  ['Finalize API contract for billing service', 'Write OpenAPI spec and get sign-off from the client tech lead.'],
  ['Design empty states for reports module', 'Cover no-data, no-results, and error variants in both themes.'],
  ['Migrate auth to short-lived tokens', 'Rotate secrets and update the mobile clients before rollout.'],
  ['Load-test checkout under 5x traffic', 'Run k6 scenario and document p95 latency findings.'],
  ['Draft Q4 roadmap proposal', 'Include capacity plan and dependency map for review.'],
  ['Fix timezone bug in scheduler', 'Events shift by one hour for AEDT users after DST change.'],
  ['User interviews: onboarding friction', 'Five sessions scheduled; synthesize findings into themes.'],
  ['Set up staging environment parity', 'Mirror production data shapes without PII.'],
  ['Write runbook for incident response', 'Cover paging, comms, and rollback procedures.'],
  ['Audit third-party dependencies', 'Check licenses and known CVEs across all services.'],
  ['Prototype offline sync for field app', 'Conflict resolution strategy for concurrent edits.'],
  ['Refine onboarding email sequence', 'A/B test subject lines for activation lift.'],
  ['Backfill analytics events', 'Replay warehouse events for the last 90 days.'],
  ['Security review: file uploads', 'Validate MIME sniffing, size limits, and virus scanning.'],
  ['Customer health score v2', 'Incorporate support ticket sentiment into scoring.'],
  ['Kubernetes cost optimization', 'Right-size requests; evaluate spot instances for batch jobs.'],
  ['Design system: data table patterns', 'Sorting, filtering, density, and responsive behavior.'],
  ['Prepare SOC 2 evidence pack', 'Collect access logs and change tickets for auditors.'],
  ['Churned account win-back playbook', 'Define triggers, messaging, and offer ladder.'],
  ['Refactor notification service', 'Split into digest vs realtime paths; add retries.'],
];

const STATUSES = ['backlog', 'todo', 'todo', 'in-progress', 'in-progress', 'review', 'done', 'done'];
const PRIORITIES = ['low', 'medium', 'medium', 'medium', 'high', 'high', 'critical'];

const projectIds = projects.map((p) => p.id);
const memberIds = teamMembers.map((m) => m.id);

export const baseTasks = Array.from({ length: 40 }, (_, i) => {
  const rand = seededRandom(2000 + i);
  const [title, description] = TITLES[i % TITLES.length];
  const status = pick(rand, STATUSES);
  const dueIn = intBetween(rand, -10, 30);
  return {
    id: `tsk-${String(i + 1).padStart(3, '0')}`,
    title: i >= TITLES.length ? `${title} (phase ${Math.floor(i / TITLES.length) + 1})` : title,
    description,
    assigneeId: pick(rand, memberIds),
    projectId: pick(rand, projectIds),
    priority: pick(rand, PRIORITIES),
    dueDate: dueIn >= 0 ? daysFromNow(dueIn) : daysAgo(-dueIn),
    status,
    createdAt: daysAgo(intBetween(rand, 1, 60)),
  };
});

export const taskById = Object.fromEntries(baseTasks.map((t) => [t.id, t]));

export function tasksForProject(projectId, tasks) {
  return (tasks || baseTasks).filter((t) => t.projectId === projectId);
}

export function tasksForMember(memberId, tasks) {
  return (tasks || baseTasks).filter((t) => t.assigneeId === memberId);
}
