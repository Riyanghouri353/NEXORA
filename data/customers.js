/* 30 customers. Referenced by projects (clientId), transactions (customerId).
   Keep ids stable: cus-001 … cus-030. */

import { seededRandom, pick, intBetween, daysAgo } from '@/lib/utils';

const SEED = [
  // [company, contact, email, phone, industry, city]
  ['Vertex Labs', 'Maya Chen', 'maya.chen@vertexlabs.io', '+1 (415) 555-0101', 'Technology', 'San Francisco'],
  ['BluePeak Retail', 'James Whitfield', 'j.whitfield@bluepeakretail.com', '+1 (312) 555-0102', 'Retail', 'Chicago'],
  ['Northwind Logistics', 'Sarah O’Connell', 'sarah.oconnell@northwindlog.com', '+1 (206) 555-0103', 'Logistics', 'Seattle'],
  ['Cedar Health', 'Dr. Alan Ruiz', 'alan.ruiz@cedarhealth.org', '+1 (617) 555-0104', 'Healthcare', 'Boston'],
  ['Meridian Bank', 'Olivia Grant', 'olivia.grant@meridianbank.com', '+1 (212) 555-0105', 'Finance', 'New York'],
  ['Brightfield Energy', 'Tomasz Kowalski', 't.kowalski@brightfield.energy', '+1 (713) 555-0106', 'Energy', 'Houston'],
  ['Lumen Media', 'Chloe Dubois', 'chloe.dubois@lumenmedia.fr', '+33 1 55 50 10 07', 'Media', 'Paris'],
  ['Atlas Manufacturing', 'Robert Vance', 'robert.vance@atlasmfg.com', '+1 (412) 555-0108', 'Manufacturing', 'Pittsburgh'],
  ['Fern & Field', 'Emma Lindqvist', 'emma@fernandfield.se', '+46 8 555 01 09', 'Retail', 'Stockholm'],
  ['Quantia Capital', 'Victor Hale', 'victor.hale@quantiacap.com', '+1 (212) 555-0110', 'Finance', 'New York'],
  ['Nimbus Cloud', 'Raj Patel', 'raj.patel@nimbuscloud.io', '+1 (408) 555-0111', 'Technology', 'San Jose'],
  ['Harborview Hotels', 'Isabella Rossi', 'isabella.rossi@harborview.com', '+1 (305) 555-0112', 'Hospitality', 'Miami'],
  ['Pioneer Foods', 'George Adeyemi', 'george.adeyemi@pioneerfoods.com', '+1 (773) 555-0113', 'Food & Beverage', 'Chicago'],
  ['Stratos Airways', 'Amelia Hart', 'amelia.hart@stratosair.com', '+44 20 5550 0114', 'Travel', 'London'],
  ['Copperline Mining', 'Diego Fuentes', 'diego.fuentes@copperline.cl', '+56 2 555 0115', 'Energy', 'Santiago'],
  ['EduSpark', 'Hannah Weiss', 'hannah.weiss@eduspark.org', '+1 (617) 555-0116', 'Education', 'Boston'],
  ['Vantage Insurance', 'Nathan Cole', 'nathan.cole@vantageins.com', '+1 (214) 555-0117', 'Finance', 'Dallas'],
  ['Greenline Transit', 'Priya Sharma', 'priya.sharma@greenlinetransit.com', '+1 (503) 555-0118', 'Logistics', 'Portland'],
  ['Nova Biotech', 'Dr. Lena Fischer', 'lena.fischer@novabiotech.de', '+49 30 555 0119', 'Healthcare', 'Berlin'],
  ['Summit Outfitters', 'Jake Morrison', 'jake.morrison@summitoutfitters.com', '+1 (303) 555-0120', 'Retail', 'Denver'],
  ['Aurora Telecom', 'Kenji Sato', 'kenji.sato@auroratelecom.jp', '+81 3 5550 0121', 'Technology', 'Tokyo'],
  ['Foundry & Co', 'Laura Bennett', 'laura.bennett@foundryco.com', '+1 (216) 555-0122', 'Manufacturing', 'Cleveland'],
  ['Solstice Solar', 'Marco Alvarez', 'marco.alvarez@solsticesolar.com', '+1 (602) 555-0123', 'Energy', 'Phoenix'],
  ['Pixelbay Studios', 'Nina Petrova', 'nina.petrova@pixelbay.studio', '+1 (310) 555-0124', 'Media', 'Los Angeles'],
  ['TrueNorth Legal', 'William Ashford', 'w.ashford@truenorthlegal.com', '+1 (312) 555-0125', 'Legal', 'Chicago'],
  ['Bloom Cosmetics', 'Sofia Almeida', 'sofia.almeida@bloomcosmetics.com', '+55 11 5555 0126', 'Retail', 'São Paulo'],
  ['Ironpeak Steel', 'Piotr Nowak', 'piotr.nowak@ironpeak.pl', '+48 22 555 0127', 'Manufacturing', 'Warsaw'],
  ['Cloudharbor', 'Emily Zhang', 'emily.zhang@cloudharbor.io', '+1 (425) 555-0128', 'Technology', 'Bellevue'],
  ['Maritime Freight Co', 'Lars Johansson', 'lars.johansson@maritimefreight.se', '+46 31 555 0129', 'Logistics', 'Gothenburg'],
  ['Willow Creek Farms', 'Anna Kowalska', 'anna@willowcreekfarms.com', '+1 (515) 555-0130', 'Food & Beverage', 'Des Moines'],
];

const STATUSES = ['active', 'active', 'active', 'active', 'active', 'active', 'trial', 'trial', 'churned', 'paused'];

export const customers = SEED.map((row, i) => {
  const rand = seededRandom(9000 + i);
  const [company, contact, email, phone, industry, city] = row;
  const status = pick(rand, STATUSES);
  const revenue = intBetween(rand, 18000, 480000);
  const joinedDays = intBetween(rand, 40, 900);
  const lastActiveDays = status === 'churned' ? intBetween(rand, 60, 300) : intBetween(rand, 0, 14);
  return {
    id: `cus-${String(i + 1).padStart(3, '0')}`,
    company,
    contact,
    email,
    phone,
    industry,
    city,
    status,
    revenue,
    joinedAt: daysAgo(joinedDays),
    lastActivity: daysAgo(lastActiveDays),
    address: `${intBetween(rand, 100, 9900)} ${pick(rand, ['Market St', 'Broadway', 'Fifth Ave', 'Harbor Blvd', 'Lakeview Dr', 'Commerce Way'])}, ${city}`,
    notes: pick(rand, [
      'Prefers quarterly business reviews with the executive team.',
      'Very responsive on email; slow on procurement paperwork.',
      'Expanding to two new regions this year — upsell opportunity.',
      'Price-sensitive; renews only with multi-year discount.',
      'Champion left last quarter; rebuilding relationship with new stakeholder.',
      'High engagement with the analytics module; potential case study.',
      '',
    ]),
  };
});

export const customerById = Object.fromEntries(customers.map((c) => [c.id, c]));

export const industries = [...new Set(customers.map((c) => c.industry))].sort();

export const CUSTOMER_STATUSES = [
  { id: 'active', label: 'Active' },
  { id: 'trial', label: 'Trial' },
  { id: 'paused', label: 'Paused' },
  { id: 'churned', label: 'Churned' },
];
