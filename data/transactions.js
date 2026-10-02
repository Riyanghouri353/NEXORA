/* 50 transactions. customerId -> customers. Keep ids stable: txn-001 … txn-050. */

import { seededRandom, pick, intBetween, daysAgo } from '@/lib/utils';
import { customers } from './customers';

const TYPES = ['invoice', 'subscription', 'payout', 'refund', 'expense'];
const STATUSES = ['completed', 'completed', 'completed', 'completed', 'pending', 'pending', 'failed', 'refunded'];
const METHODS = ['Card', 'Bank transfer', 'Wire', 'ACH', 'Digital wallet'];

const DESCRIPTIONS = {
  invoice: ['Q3 platform license invoice', 'Implementation milestone 2', 'Annual support renewal', 'Consulting hours — September', 'Additional seats (25)'],
  subscription: ['Professional plan — monthly', 'Enterprise plan — monthly', 'Analytics add-on', 'Starter plan — monthly'],
  payout: ['Partner revenue share', 'Contractor payout — design', 'Referral commission'],
  refund: ['Service credit issued', 'Duplicate charge refund', 'Cancelled module refund'],
  expense: ['Cloud infrastructure', 'Software licenses', 'Travel — client onsite', 'Marketing spend'],
};

export const transactions = Array.from({ length: 50 }, (_, i) => {
  const rand = seededRandom(7000 + i);
  const customer = pick(rand, customers);
  const type = pick(rand, TYPES);
  const status = pick(rand, STATUSES);
  const isNegative = type === 'refund' || type === 'expense' || type === 'payout';
  const amount = intBetween(rand, 900, 85000) * (isNegative ? -1 : 1);
  return {
    id: `txn-${String(i + 1).padStart(3, '0')}`,
    customerId: customer.id,
    amount,
    type,
    status,
    method: pick(rand, METHODS),
    date: daysAgo(intBetween(rand, 0, 120)),
    description: pick(rand, DESCRIPTIONS[type]),
    reference: `NX-${intBetween(rand, 100000, 999999)}`,
  };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

export const transactionById = Object.fromEntries(transactions.map((t) => [t.id, t]));

export const TRANSACTION_TYPES = [
  { id: 'invoice', label: 'Invoice' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'payout', label: 'Payout' },
  { id: 'refund', label: 'Refund' },
  { id: 'expense', label: 'Expense' },
];

export const TRANSACTION_STATUSES = [
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
  { id: 'refunded', label: 'Refunded' },
];

export function transactionsForCustomer(customerId) {
  return transactions.filter((t) => t.customerId === customerId);
}
