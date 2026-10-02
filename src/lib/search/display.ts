// Plain display helpers for college facts. No '@/' imports so node scripts can load this.

export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export type ClimateBand = 'warm_winters' | 'cool_winters' | 'cold_winters';

export function climateBand(winterF: number | null): ClimateBand | null {
  if (winterF == null || Number.isNaN(winterF)) return null;
  if (winterF >= 40) return 'warm_winters';
  if (winterF >= 30) return 'cool_winters';
  return 'cold_winters';
}

export const CLIMATE_LABEL: Record<ClimateBand, string> = {
  warm_winters: 'Warm winters',
  cool_winters: 'Cool winters',
  cold_winters: 'Cold, snowy winters',
};

export const CLIMATE_HINT: Record<ClimateBand, string> = {
  warm_winters: 'Rarely freezes. Winter days feel cool, not cold.',
  cool_winters: 'Some snow and frost. Coat weather, not deep freeze.',
  cold_winters: 'Long, hard winters. Snow and ice for months.',
};

export const CLIMATE_RANGE: Record<ClimateBand, string> = {
  warm_winters: '≥40°F (≥4.5°C)',
  cool_winters: '30–39.9°F (−1 to 4.5°C)',
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
