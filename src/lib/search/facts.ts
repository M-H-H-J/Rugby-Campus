// Typed view of src/data/collegeSearchFacts.json (generated from the verified research file; do not hand-edit values).
// No '@/' alias imports so it also works from tests and node scripts.
export interface Prov { c: 'high' | 'medium' | 'low' | 'none'; u: string; d: string }
export interface CollegeFacts {
  unitid: number; name: string; city_state: string; state: string;
  region_census: 'Northeast' | 'Midwest' | 'South' | 'West';
  control: 'public' | 'private_nonprofit' | 'private_forprofit';
  setting: 'city' | 'suburb' | 'town' | 'rural' | null;
  enrollment_undergrad: number | null;
  size_band: 'small' | 'medium' | 'large' | 'very_large' | null;
  athletics_division: 'ncaa_d1' | 'ncaa_d2' | 'ncaa_d3' | 'naia' | null;
  football_level: 'fbs' | 'fcs' | 'd2' | 'd3' | 'naia' | 'none' | null;
  has_football: boolean | null;
  athletics_conference: string | null; football_conference: string | null;
  mens_rugby_program_type: 'varsity' | 'club' | null;
  rugby_tier: 'championship' | 'playoff' | 'competitive' | 'emerging' | null;
  tuition_fees_in_state: number | null; tuition_fees_out_of_state: number | null;
  total_cost_in_state: number | null; total_cost_out_of_state: number | null;
  cost_basis: 'official_coa' | 'direct_sum' | 'tuition_only' | 'service_academy' | 'unclear' | null;
  cost_year: string | null;
  religious_affiliation: string | null;
  religion_group: 'none' | 'none_formal' | 'catholic' | 'christian_other' | 'other' | null;
  winter_avg_computed_f: number | null; summer_high_f: number | null;
  climate_tag: 'Mild winters' | 'Has seasons' | 'Cold winters' | 'Hot' | null;
  freezing_nights_per_year: number | null;
  nearest_airport_iata: string | null; nearest_airport_name: string | null; airport_distance_miles: number | null;
  campus_feel: 'city' | 'college_town' | 'suburb' | 'country' | null;
  flights_airport_iata: string | null; flights_airport_name: string | null; flights_airport_miles: number | null; flights_airport_limited: boolean | null;
  safety_clery: null;
  rugby_aid: 'full' | 'partial' | 'none' | 'varies' | null;
  big_sport_tag: string | null;
  intl_admission_route: string | null; intl_warning: string | null;
  test_policy: string | null; acceptance_rate: number | null; graduation_rate_6yr: number | null;
  majors_top: string[] | null;
  majors_cip2: Record<string, number>;
  majors_programs: [string, number][];
  prov: Record<string, Prov>;
}
export interface FactsFile { version: number; generated: string; definitions: Record<string, string>; colleges: Record<string, CollegeFacts> }

let cache: FactsFile | null = null;
/** Lazy-loaded so the ~170 KB file only ships to pages that use search / the new college fields. */
export async function loadFacts(): Promise<FactsFile> {
  if (cache) return cache;
  const mod = await import('../../data/collegeSearchFacts.json');
  cache = (mod.default ?? mod) as unknown as FactsFile;
  return cache;
}
export function getFactsSync(): FactsFile | null { return cache; }
