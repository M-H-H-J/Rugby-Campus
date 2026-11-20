import type { College } from '@/data/colleges';

/** Short names people actually type. Matched case- and punctuation-insensitively. */
export const COLLEGE_ALIASES: Record<string, string[]> = {
  'united-states-naval-academy': ['navy', 'usna', 'naval academy', 'annapolis'],
  'united-states-military-academy-army': ['army', 'usma', 'west point'],
  'united-states-air-force-academy': ['air force', 'usafa', 'afa', 'zoomies'],
  'brigham-young-university': ['byu', 'brigham young'],
  'pennsylvania-state-university': ['penn state', 'psu'],
  'university-of-california-berkeley': ['cal', 'uc berkeley', 'ucb', 'berkeley'],
  'university-of-california-los-angeles-ucla': ['ucla'],
  'university-of-california-santa-cruz': ['ucsc', 'uc santa cruz', 'santa cruz'],
  'saint-mary-s-college-of-california': ['st marys', 'saint marys', 'st marys college', 'smc', 'gaels'],
  'mount-st-mary-s-university': ['msm', 'mount st marys', 'the mount', 'msmu'],
  'university-of-notre-dame': ['nd', 'notre dame'],
  'kutztown-university': ['ku', 'kutztown'],
  'southern-virginia-university': ['svu', 'southern virginia'],
  'colorado-state-university': ['csu', 'colorado state'],
  'california-state-university-long-beach': ['csulb', 'long beach', 'long beach state', 'lbsu', 'cal state long beach'],
  'st-bonaventure-university': ['st bonaventure', 'saint bonaventure', 'bonnies', 'sbu'],
  'st-thomas-university-florida': ['st thomas', 'saint thomas', 'stu'],
  'the-ohio-state-university': ['ohio state', 'osu'],
  'california-polytechnic-state-university': ['cal poly', 'slo'],
  'grand-canyon-university': ['gcu', 'grand canyon'],
  'university-of-mary-washington': ['umw', 'mary washington'],
  'southern-nazarene-university': ['snu'],
  'indiana-university': ['iu', 'indiana'],
  'indiana-institute-of-technology': ['indiana tech'],
  'university-of-michigan': ['umich', 'michigan'],
  'university-of-colorado-boulder': ['cu boulder', 'cu', 'colorado'],
  'arkansas-state-university': ['a state', 'astate', 'arkansas state'],
  'university-of-san-diego': ['usd'],
  'university-of-utah': ['utah', 'utes'],
  'western-washington-university': ['wwu', 'western washington'],
  'queens-university-of-charlotte': ['queens'],
  'thomas-more-university': ['thomas more'],
  'university-of-rio-grande': ['rio', 'rio grande'],
  'university-of-arizona': ['arizona', 'u of a'],
};

/** Lower-case, no punctuation, "saint" -> "st", single spaces. */
export function normalizeName(s: string): string {
  return s.toLowerCase()
    .replace(/[’'`.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bsaint\b/g, 'st')
    .trim();
}

/**
 * Name search for the Colleges list. Very short queries that are an exact alias ("cal", "nd", "ku")
 * return just that college; anything else matches name, place, conference or alias as a substring.
 */
export function matchesCollegeQuery(c: College, query: string, exactAliasHit: boolean): boolean {
  const q = normalizeName(query);
  if (!q) return true;
  const aliases = (COLLEGE_ALIASES[c.slug] ?? []).map(normalizeName);
  if (q.length <= 4 && exactAliasHit) return aliases.includes(q);
  const hay = [c.name, c.location, c.state, c.conference].map(normalizeName);
  return hay.some((h) => h.includes(q)) || aliases.some((a) => a === q || (q.length >= 3 && a.includes(q)));
}

export function hasExactAlias(colleges: College[], query: string): boolean {
  const q = normalizeName(query);
  return !!q && colleges.some((c) => (COLLEGE_ALIASES[c.slug] ?? []).some((a) => normalizeName(a) === q));
}
