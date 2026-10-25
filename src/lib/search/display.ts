// Plain display helpers for college facts. No '@/' imports so node scripts can load this.

export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export type ClimateBand = 'warm_winters' | 'cool_winters' | 'cold_winters';

export function climateBand(winterF: number | null): ClimateBand | null {
  if (winterF == null || Number.isNaN(winterF)) return null;
  if (winterF >= 45) return 'warm_winters';
  if (winterF >= 30) return 'cool_winters';
  return 'cold_winters';
}

export const CLIMATE_LABEL: Record<ClimateBand, string> = {
  warm_winters: 'Mild winters',
  cool_winters: 'Cool winters',
  cold_winters: 'Cold, snowy winters',
};

export const CLIMATE_HINT: Record<ClimateBand, string> = {
  warm_winters: 'Rarely freezes. Winter days feel cool, not cold.',
  cool_winters: 'Some snow and frost. Coat weather, not deep freeze.',
  cold_winters: 'Long, hard winters. Snow and ice for months.',
};

export const CLIMATE_RANGE: Record<ClimateBand, string> = {
  warm_winters: '≥45°F (≥7°C)',
  cool_winters: '30–44.9°F (−1 to 7°C)',
  cold_winters: 'under 30°F (under −1°C)',
};

export function climateText(f: { winter_avg_computed_f: number | null; summer_high_f: number | null }): string {
  const band = climateBand(f.winter_avg_computed_f);
  if (!band || f.winter_avg_computed_f == null) return '';
  const winter = Math.round(f.winter_avg_computed_f);
  let text = `${CLIMATE_LABEL[band]} · winter average about ${winter}°F (${fToC(winter)}°C)`;
  if (f.summer_high_f != null) {
    const summer = Math.round(f.summer_high_f);
    text += ` · summer highs about ${summer}°F (${fToC(summer)}°C)`;
  }
  return text;
}

export function isVeryHot(f: { summer_high_f: number | null }): boolean {
  return f.summer_high_f != null && f.summer_high_f >= 95;
}

export const VERY_HOT_LABEL = 'Very hot summers';

// ONE climate rule for the whole site: the stats chip, the search pills, the Weather sentence and the
// monthly table all use climateBand() (winters) and summerLabel() (summers). Thresholds match the
// "climate_tag" definition in collegeSearchFacts.json: mild winters >= 45°F, cool 30–44.9°F, cold < 30°F.
export function summerLabel(summerF: number): string {
  if (summerF >= 95) return VERY_HOT_LABEL;
  if (summerF >= 85) return 'Hot summers';
  if (summerF >= 75) return 'Warm summers';
  return 'Mild summers';
}

const WINTER_PHRASE: Record<ClimateBand, string> = { warm_winters: 'mild winters', cool_winters: 'cool winters', cold_winters: 'cold, snowy winters' };

/** "Hot summers, cool winters." Built from numbers, never typed by hand. */
export function weatherSentence(f: { winter_avg_computed_f: number | null; summer_high_f: number | null }): string {
  const band = climateBand(f.winter_avg_computed_f);
  if (!band) return '';
  const winter = WINTER_PHRASE[band];
  if (f.summer_high_f == null) return winter[0].toUpperCase() + winter.slice(1) + '.';
  return `${summerLabel(f.summer_high_f)}, ${winter}.`;
}

/** Winter average (Dec–Feb mean of high and low) and summer high (Jun–Aug mean high) from a 12-month table. */
export function climateFromTemps(temps: { month: string; hF: number; lF: number }[]): { winter_avg_computed_f: number; summer_high_f: number } | null {
  if (!Array.isArray(temps) || temps.length !== 12) return null;
  const by = new Map(temps.map((t) => [t.month, t]));
  const w = ['Dec', 'Jan', 'Feb'].map((m) => by.get(m));
  const s = ['Jun', 'Jul', 'Aug'].map((m) => by.get(m));
  if ([...w, ...s].some((t) => !t)) return null;
  return {
    winter_avg_computed_f: w.reduce((a, t) => a + (t!.hF + t!.lF) / 2, 0) / 3,
    summer_high_f: s.reduce((a, t) => a + t!.hF, 0) / 3,
  };
}
export const VERY_HOT_DETAIL = 'Summer highs of 95°F (35°C) or more.';

export type SizeBand = 'small' | 'medium' | 'big';

export function sizeBand(enrollment: number | null): SizeBand | null {
  if (enrollment == null || Number.isNaN(enrollment)) return null;
  if (enrollment < 3000) return 'small';
  if (enrollment < 15000) return 'medium';
  return 'big';
}

export const SIZE_LABEL: Record<SizeBand, string> = {
  small: 'Small (under 3,000)',
  medium: 'Medium (3,000–14,999)',
  big: 'Big (15,000+)',
};

export const CAMPUS_FEEL_LABEL: Record<'city' | 'college_town' | 'suburb' | 'country', string> = {
  city: 'In a city',
  college_town: 'College town or smaller city',
  suburb: 'Suburb',
  country: 'Quiet small town or countryside',
};

type AirportFacts = {
  nearest_airport_iata: string | null;
  nearest_airport_name: string | null;
  airport_distance_miles: number | null;
  flights_airport_iata: string | null;
  flights_airport_name: string | null;
  flights_airport_miles: number | null;
  flights_airport_limited: boolean | null;
};

export function airportRows(f: AirportFacts): [string, string][] {
  const rows: [string, string][] = [];
  if (f.nearest_airport_iata) {
    rows.push(['Nearest major airport', `${f.nearest_airport_name} (${f.nearest_airport_iata}), about ${f.airport_distance_miles} miles in a straight line, not driving distance`]);
  }
  if (f.flights_airport_iata && f.flights_airport_iata !== f.nearest_airport_iata) {
    const limited = f.flights_airport_limited ? ' · only a few flights a day at most' : '';
    rows.push(['Nearest airport with flights', `${f.flights_airport_name} (${f.flights_airport_iata}), about ${f.flights_airport_miles} miles in a straight line${limited}`]);
  }
  return rows;
}

export function rugbyAidText(f: { rugby_aid: 'full' | 'partial' | 'none' | 'varies' | null }): string {
  if (f.rugby_aid === 'full') return 'Full rugby aid reported';
  if (f.rugby_aid === 'partial') return 'Partial rugby aid reported';
  if (f.rugby_aid === 'none') return 'No rugby aid reported';
  if (f.rugby_aid === 'varies') return 'Varies. Ask the coach';
  return 'Ask the coach';
}

export const SAFETY_TEXT = 'Not scored yet. See the official campus safety report (US Dept of Education).';
export const SAFETY_URL = 'https://ope.ed.gov/campussafety/';

export const MLR_EXPLAINER = 'Being drafted gives an MLR club the rights to a player. It doesn\'t mean he signed or played. “Played” is a confirmed minimum from match records, so the true number could be a little higher.';
export const MLR_SOURCES = 'MLR College Draft results, NARDB and Americas Rugby News, checked October 2026.';

export function mlrSummary(c: {
  draftPicks: number;
  mlrPlayed: number | null;
  mlrUnconfirmed: number;
  mlrNoAppearance: number;
  mlrNotYet: number;
  mlrNote?: string;
}) {
  const drafted = c.draftPicks;
  const played = c.mlrPlayed;
  const unconfirmed = c.mlrUnconfirmed;
  const draftedText = drafted === 0 ? 'None found' : String(drafted);
  const playedText = drafted === 0 ? '—' : played === 0 || played == null ? 'None confirmed yet' : `${played} confirmed`;
  const unconfirmedText = unconfirmed > 0 ? `${unconfirmed} not confirmed either way` : '';
  const parts: string[] = [];
  if (played != null && played > 0) parts.push(`${played} confirmed played`);
  if (c.mlrNoAppearance > 0) parts.push(`${c.mlrNoAppearance} with no recorded appearance`);
  if (unconfirmed > 0) parts.push(`${unconfirmed} not confirmed either way`);
  if (c.mlrNotYet > 0) parts.push(`${c.mlrNotYet} from the 2026 class (no season played yet)`);
  const breakdown = drafted > 0 && parts.length ? `Of the ${drafted} drafted: ${parts.join(', ')}.` : '';
  return {
    drafted,
    played,
    draftedText,
    playedText,
    unconfirmed,
    unconfirmedText,
    breakdown,
    explainer: MLR_EXPLAINER,
    sources: MLR_SOURCES,
  };
}
