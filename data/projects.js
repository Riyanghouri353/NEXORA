/* 25 projects. clientId -> customers, teamIds -> teamMembers.
   Keep ids stable: prj-001 … prj-025. */

import { seededRandom, pick, pickMany, intBetween, daysAgo, daysFromNow } from '@/lib/utils';
import { customers } from './customers';
import { teamMembers } from './team';

const SEED = [
  // [name, clientIdx, description]
  ['Atlas Cloud Migration', 0, 'Migrate Vertex Labs’ legacy infrastructure to a multi-region cloud setup with zero-downtime cutover.'],
  ['Beacon Analytics Rollout', 1, 'Deploy real-time sales analytics across 140 BluePeak retail locations.'],
  ['Harbor Freight Optimization', 2, 'Route optimization and telematics integration for Northwind’s national fleet.'],
  ['Patient Portal Redesign', 3, 'Accessibility-first redesign of Cedar Health’s patient portal and scheduling flow.'],
  ['Meridian Fraud Shield', 4, 'Real-time fraud detection pipeline for Meridian Bank card transactions.'],
  ['GridView Energy Dashboard', 5, 'Operations dashboard for Brightfield’s solar and wind portfolio.'],
  ['Lumen Content Pipeline', 6, 'Automated ingest, transcoding, and publishing pipeline for Lumen Media.'],
  ['Factory Pulse IoT', 7, 'IoT sensor network and predictive maintenance for Atlas Manufacturing plants.'],
  ['Nordic POS Modernization', 8, 'Replace legacy point-of-sale across Fern & Field’s Scandinavian stores.'],
  ['Quantia Risk Engine', 9, 'Portfolio risk scoring engine with intraday recalculation for Quantia Capital.'],
  ['Nimbus Edge Deployment', 10, 'Edge compute rollout for Nimbus Cloud’s latency-sensitive workloads.'],
  ['Harborview Booking Suite', 11, 'Unified booking, loyalty, and guest messaging for Harborview Hotels.'],
  ['Pioneer Supply Trace', 12, 'Farm-to-shelf traceability platform for Pioneer Foods suppliers.'],
  ['Stratos Crew Scheduler', 13, 'Crew rostering and compliance scheduling for Stratos Airways.'],
  ['Copperline Safety Monitor', 14, 'Real-time safety monitoring across Copperline mining operations.'],
  ['EduSpark Learning Paths', 15, 'Adaptive learning paths and progress analytics for EduSpark.'],
  ['Vantage Claims Automation', 16, 'ML-assisted claims triage and processing for Vantage Insurance.'],
  ['Greenline Fleet Tracker', 17, 'Live fleet tracking and maintenance alerts for Greenline Transit.'],
  ['Nova Lab Inventory', 18, 'Sample and reagent inventory with compliance audit trails for Nova Biotech.'],
  ['Summit Commerce Replatform', 19, 'Headless commerce replatform for Summit Outfitters’ DTC store.'],
  ['Aurora 5G Rollout Tracker', 20, 'Program tracker for Aurora Telecom’s 5G site deployment.'],
  ['Foundry ERP Integration', 21, 'ERP and shop-floor system integration for Foundry & Co.'],
  ['Solstice Field App', 22, 'Offline-first mobile app for Solstice Solar field technicians.'],
  ['Pixelbay Render Farm', 23, 'Burst render capacity orchestration for Pixelbay Studios.'],
  ['TrueNorth Document AI', 24, 'Contract review AI with clause extraction for TrueNorth Legal.'],
];

const STATUSES = ['planning', 'active', 'active', 'active', 'active', 'on-hold', 'at-risk', 'completed', 'completed'];
const PRIORITIES = ['low', 'medium', 'medium', 'high', 'high', 'critical'];

const teamIds = teamMembers.map((m) => m.id);

export const projects = SEED.map((row, i) => {
  const rand = seededRandom(4000 + i);
  const [name, clientIdx, description] = row;
  const client = customers[clientIdx];
  const status = pick(rand, STATUSES);
  const priority = pick(rand, PRIORITIES);
  const budget = intBetween(rand, 60, 900) * 1000;
  const progress = status === 'completed' ? 100 : status === 'planning' ? intBetween(rand, 2, 12) : intBetween(rand, 15, 92);
  const spent = Math.round(budget * (progress / 100) * (0.85 + rand() * 0.3));
  const startedDays = intBetween(rand, 30, 320);
  const deadlineDays = status === 'completed' ? -intBetween(rand, 5, 120) : intBetween(rand, -20, 180);
  return {
    id: `prj-${String(i + 1).padStart(3, '0')}`,
    name,
    clientId: client.id,
    description,
    status,
    priority,
    progress,
    teamIds: pickMany(rand, teamIds, intBetween(rand, 3, 6)),
    leadId: pick(rand, teamIds),
    budget,
    spent,
    startDate: daysAgo(startedDays),
    deadline: deadlineDays >= 0 ? daysFromNow(deadlineDays) : daysAgo(-deadlineDays),
    tags: pickMany(rand, ['cloud', 'analytics', 'mobile', 'ai', 'integration', 'security', 'ux', 'data-pipeline'], intBetween(rand, 1, 3)),
    files: intBetween(rand, 4, 48),
  };
});

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

export const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planning' },
  { id: 'active', label: 'Active' },
  { id: 'at-risk', label: 'At Risk' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'completed', label: 'Completed' },
];

export const PROJECT_PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];

export function projectsForCustomer(customerId) {
  return projects.filter((p) => p.clientId === customerId);
}

export function projectsForMember(memberId) {
  return projects.filter((p) => p.teamIds.includes(memberId));
}
