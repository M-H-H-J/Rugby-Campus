import type { CollegeFacts } from './facts';
import type { Filters } from './filters';

export const COST_DISCLAIMER = "Before scholarships. Ask the coach what's available.";

export type Residency = 'in_state' | 'out_of_state' | 'international';

export interface CostView {
  /** number used for matching (null = unknown) */
  amount: number | null;
  /** 'total' = published cost of attendance or tuition+room+board; 'tuition' = tuition & fees only */
  kind: 'total' | 'tuition' | 'none';
  /** which price we used */
  rate: 'in_state' | 'out_of_state';
  assumed: boolean; // true when we had to assume the out-of-state/international rate
}

export function pickRate(c: CollegeFacts, residency: Residency | null, homeState: string | null): { rate: 'in_state' | 'out_of_state'; assumed: boolean } {
  if (c.control !== 'public') return { rate: 'in_state', assumed: false }; // private: one rate
  if (residency === 'in_state') return { rate: 'in_state', assumed: false };
  if (residency === 'international' || residency === 'out_of_state') return { rate: 'out_of_state', assumed: false };
  if (homeState && homeState === c.state) return { rate: 'in_state', assumed: false };
  return { rate: 'out_of_state', assumed: true };
}

export function costFor(c: CollegeFacts, residency: Residency | null, homeState: string | null): CostView {
  const { rate, assumed } = pickRate(c, residency, homeState);
  const total = rate === 'in_state' ? c.total_cost_in_state : c.total_cost_out_of_state;
  const tuition = rate === 'in_state' ? c.tuition_fees_in_state : c.tuition_fees_out_of_state;
  if (total != null) return { amount: total, kind: 'total', rate, assumed };
  if (c.cost_basis === 'service_academy') return { amount: 0, kind: 'tuition', rate, assumed };
  if (tuition != null) return { amount: tuition, kind: 'tuition', rate, assumed };
  return { amount: null, kind: 'none', rate, assumed };
}

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
export { usd };

/** Short text for a card or college page. Always ends with the before-scholarships line when a number is shown. */
export function costText(c: CollegeFacts, residency: Residency | null = null, homeState: string | null = null): { headline: string; sub: string; askCoach: boolean } {
  if (c.cost_basis === 'service_academy') {
    return { headline: 'No tuition (service commitment)', sub: 'US service academy: tuition, room and board are covered in return for military service. Ask the coach.', askCoach: false };
  }
  const v = costFor(c, residency, homeState);
  if (v.amount == null) return { headline: 'Ask the coach', sub: 'We could not find a published figure we trust.', askCoach: true };
  const isPublic = c.control === 'public';
  const part = v.kind === 'total' ? 'per year, tuition + room + board + extras' : 'per year, tuition & fees only (room and board not included)';
  let head: string;
  if (isPublic && !residency && !(homeState)) {
    const a = c.total_cost_in_state ?? c.tuition_fees_in_state; const b = c.total_cost_out_of_state ?? c.tuition_fees_out_of_state;
    head = a != null && b != null && a !== b ? `${usd(a)} in-state / ${usd(b)} out-of-state` : usd(v.amount);
  } else head = usd(v.amount) + (isPublic ? (v.rate === 'in_state' ? ' (in-state rate)' : ' (out-of-state rate)') : '');
  return { headline: head, sub: `${part}${c.cost_year ? ' · ' + c.cost_year : ''}. ${COST_DISCLAIMER}`, askCoach: false };
}
export function residencyOf(f: Filters): Residency | null { return f.residency; }
