// Builds the data tables in the Best Rugby Colleges guide from colleges.ts and collegeSearchFacts.json, so the guide
// never states a tier, label, title or cost the profiles don't. `node scripts/gen-guide-tables.mjs` rewrites them in
// src/data/articles.ts; src/lib/__tests__/wave2.test.ts fails when they drift from the data.
import { colleges, tierNumber, TIER_ORDER, type College } from '@/data/colleges';
import { visibleBadges } from '@/lib/search/display';
import factsFile from '@/data/collegeSearchFacts.json';
import type { CollegeFacts, FactsFile } from '@/lib/search/facts';

const FACTS = (factsFile as unknown as FactsFile).colleges;
const facts = (c: College) => FACTS[c.slug] as CollegeFacts | undefined;
const link = (c: College) => `[${c.name}](/colleges/${c.slug})`;
const byName = (a: College, b: College) => a.name.localeCompare(b.name);
const byTierThenName = (a: College, b: College) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || byName(a, b);
const k = (n: number) => `~$${Math.round(n / 1000)}k`;
const row = (cells: string[]) => `| ${cells.join(' | ')} |`;
const table = (header: string[], rows: string[][]) => [row(header), row(header.map(() => '---')), ...rows.map(row)].join('\n');

export const programKind = (c: College) => (c.programType === 'Varsity' || c.programType === 'Club' ? c.programType : 'Not confirmed');

/** Short cost for a table cell, from the same fields as the profile's Cost row. Rounded to the nearest $1k. */
export function shortCost(f: CollegeFacts | undefined): string {
  if (!f) return 'Ask the coach';
  if (f.cost_basis === 'service_academy') return 'No tuition (service commitment)';
  if (f.cost_residents_only) return f.tuition_fees_in_state != null ? `${k(f.tuition_fees_in_state)} in-state tuition only; ask the coach` : 'Ask the coach';
  const tuitionOnly = f.total_cost_in_state == null && f.total_cost_out_of_state == null;
  const a = tuitionOnly ? f.tuition_fees_in_state : f.total_cost_in_state ?? f.tuition_fees_in_state;
  const b = tuitionOnly ? f.tuition_fees_out_of_state : f.total_cost_out_of_state ?? f.tuition_fees_out_of_state;
  if (a == null && b == null) return 'Ask the coach';
  const tail = tuitionOnly ? ' (tuition only)' : '';
  if (f.control === 'public' && a != null && b != null && Math.round(a / 1000) !== Math.round(b / 1000)) return `${k(a)} in-state / ${k(b)} out-of-state${tail}`;
  return `${k((a ?? b)!)}${tail}`;
}

/** Titles first, then finals and other results; at most two, from the profile's own badges. */
const results = (c: College) => [...visibleBadges(c.badges)].sort((a, b) => Number(/Champions/.test(b)) - Number(/Champions/.test(a))).slice(0, 2).join('; ') || 'None listed';

/** Every program: tier, body, varsity/club, recent results, cost. Alphabetical inside each tier (tiers are not rankings). */
export function programTable(): string {
  return table(['School', 'Body', 'Tier', 'Varsity or club', 'Titles and recent results', 'Cost per year, before aid'],
    [...colleges].sort(byTierThenName).map((c) => [link(c), c.affiliation, tierNumber(c.tier), programKind(c), results(c), shortCost(facts(c))]));
}

/** CRAA D1A vs NCR D1 at a glance. Champions are the verified facts in AGENTS.md. */
export function bodyTable(): string {
  const n = (pred: (c: College) => boolean) => String(colleges.filter(pred).length);
  return table(['Body', 'Main 15s championship', 'Latest champion', 'Programs on Rugby Campus'], [
    ['CRAA D1A', 'Spring', 'Cal (2026, beat Navy 36–22)', n((c) => c.affiliation.startsWith('CRAA'))],
    ['NCR D1', 'Fall', 'St. Bonaventure (2025, beat Queens 55–19)', n((c) => c.affiliation.startsWith('NCR D1') && !c.affiliation.includes('CRAA'))],
    ['Listed under both', 'Fall and spring', 'See the two rows above', n((c) => c.affiliation.includes('/'))],
  ]);
}

/** Programs whose published label is Varsity, grouped by body. */
export function varsityList(): string {
  const v = colleges.filter((c) => programKind(c) === 'Varsity').sort(byName);
  const group = (label: string, pred: (c: College) => boolean) => `- **${label}:** ${v.filter(pred).map(link).join(', ')}`;
  return [group('CRAA D1A', (c) => c.affiliation.startsWith('CRAA')), group('NCR D1', (c) => !c.affiliation.startsWith('CRAA'))].join('\n');
}
export const varsityCount = () => colleges.filter((c) => programKind(c) === 'Varsity').length;
export const clubCount = () => colleges.filter((c) => programKind(c) === 'Club').length;
export const unconfirmedNames = () => colleges.filter((c) => programKind(c) === 'Not confirmed').sort(byName).map(link);

const TEST_POLICY: Record<string, string> = { required: 'Required', optional: 'Optional', not_considered: 'Not considered' };
export const SELECTIVE_BELOW = 35;

/** The most selective schools on the site (admit rate under 35%), most selective first. Same figure as "How hard to get in". */
export function selectivityTable(): string {
  const rows = colleges.map((c) => ({ c, f: facts(c) })).filter(({ f }) => f?.acceptance_rate != null && f.acceptance_rate < SELECTIVE_BELOW)
    .sort((a, b) => a.f!.acceptance_rate! - b.f!.acceptance_rate! || byName(a.c, b.c));
  return table(['School', 'Admitted', 'SAT / ACT', 'Tier'],
    rows.map(({ c, f }) => [link(c), `${Math.round(f!.acceptance_rate!)}%`, TEST_POLICY[f!.test_policy ?? ''] ?? 'Check with the school', tierNumber(c.tier)]));
}

/** "Best for" fits, each built from a rule on the data, never a hand-picked favourite list. */
export function fitTable(): string {
  const names = (pred: (c: College) => boolean) => colleges.filter(pred).sort(byName).map(link).join(', ');
  const isPublic = (c: College) => facts(c)?.control === 'public';
  const academy = (c: College) => facts(c)?.cost_basis === 'service_academy';
  return table(['If you want', 'Start with', 'Why'], [
    ['A national title shot', names((c) => c.tier === 'championship'), 'Tier 1: the programs winning or contending for CRAA D1A and NCR D1 titles now.'],
    ['Club rugby at a public university', names((c) => isPublic(c) && !academy(c) && programKind(c) === 'Club'), 'Public universities where rugby is a club. Out-of-state and international students pay the higher rate.'],
    ['US service academy', names(academy), 'No tuition in return for military service. US citizens only, apart from a few students nominated by their own government.'],
  ]);
}

/** The blocks gen-guide-tables.mjs writes into the guide. It finds each old block by its first line. */
export const GUIDE_BLOCKS: Record<string, string[]> = {
  'best-rugby-colleges-usa': [programTable(), bodyTable(), selectivityTable(), fitTable(), varsityList()],
};
