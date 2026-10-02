// Filter vocabulary + validation for sentence search. Shared by the browser and the Vercel functions.
// IMPORTANT: no '@/' alias imports in this file (the api/ functions import it by relative path).
import { z } from 'zod';

export const FILTER_VERSION = 3;
export const MAX_SENTENCE_CHARS = 300;

export const STATE_CODES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const;
export const REGIONS = ['northeast', 'midwest', 'south', 'west'] as const;            // US Census regions
export const CONTROLS = ['public', 'private_nonprofit'] as const;
export const SETTINGS = ['city', 'college_town', 'suburb', 'country'] as const;       // campus feel
export const DIVISIONS = ['d1', 'd2', 'd3', 'naia'] as const;
export const SIZE_BANDS = ['small', 'medium', 'big'] as const;                        // under 3,000 / 3,000–14,999 / 15,000+
export const CLIMATES = ['warm_winters', 'cool_winters', 'cold_winters'] as const;
export const RELIGIONS = ['none_only', 'religious', 'catholic', 'christian_other', 'any'] as const;
export const RUGBY_TIERS = ['championship', 'playoff', 'competitive', 'emerging'] as const;
export const RUGBY_PROGRAMS = ['varsity', 'club'] as const;
export const RESIDENCIES = ['in_state', 'out_of_state', 'international'] as const;

/** Broad major fields -> College Scorecard / IPEDS 2-digit CIP families. Fixed table, never an AI guess. */
export const MAJOR_FIELDS: Record<string, { label: string; cip2: string[] }> = {
  engineering: { label: 'Engineering', cip2: ['14', '15'] },
  business: { label: 'Business', cip2: ['52'] },
  computer_science: { label: 'Computer science & IT', cip2: ['11'] },
  mathematics: { label: 'Maths & statistics', cip2: ['27'] },
  biology: { label: 'Biology', cip2: ['26'] },
  physical_sciences: { label: 'Physical sciences', cip2: ['40'] },
  health: { label: 'Health & nursing', cip2: ['51'] },
  psychology: { label: 'Psychology', cip2: ['42'] },
  social_sciences: { label: 'Social sciences & economics', cip2: ['45'] },
  education: { label: 'Education', cip2: ['13'] },
  communications: { label: 'Communications & media', cip2: ['09', '10'] },
  arts_humanities: { label: 'Arts & humanities', cip2: ['16', '23', '24', '38', '50', '54'] },
  law_justice: { label: 'Law, politics & justice', cip2: ['22', '43', '44'] },
  sport_exercise: { label: 'Sport, exercise & fitness', cip2: ['31'] },
  agriculture_environment: { label: 'Agriculture & environment', cip2: ['01', '03'] },
  architecture_design: { label: 'Architecture & design', cip2: ['04'] },
};
export const MAJOR_KEYS = Object.keys(MAJOR_FIELDS);

export const EXAMPLE_PROMPTS = [
  'Decent rugby, study maths, not freezing',
  'Big university, engineering, somewhere warm',
  'Small college near a city, under US$60k a year',
];

// ---- tolerant zod schema: unknown array values are dropped rather than failing the whole parse ----
const enumList = <T extends readonly [string, ...string[]]>(vals: T) =>
  z.preprocess((v) => (Array.isArray(v) ? v.map((x) => String(x).toLowerCase().trim()).filter((x) => (vals as readonly string[]).includes(x)) : []), z.array(z.enum(vals)).max(8));
const enumOrNull = <T extends readonly [string, ...string[]]>(vals: T) =>
  z.preprocess((v) => (typeof v === 'string' && (vals as readonly string[]).includes(v.toLowerCase().trim()) ? v.toLowerCase().trim() : null), z.enum(vals).nullable());

export const FilterSchema = z.object({
  version: z.number().optional(),
  residency: enumOrNull(RESIDENCIES),
  home_state: z.preprocess((v) => (typeof v === 'string' && (STATE_CODES as readonly string[]).includes(v.toUpperCase().trim()) ? v.toUpperCase().trim() : null), z.enum(STATE_CODES).nullable()),
  // Every filter is soft. A miss only changes pill colour and order. Unknown never excludes.
  states: z.preprocess((v) => (Array.isArray(v) ? v.map((x) => String(x).toUpperCase().trim()).filter((x) => (STATE_CODES as readonly string[]).includes(x)) : []), z.array(z.enum(STATE_CODES)).max(12)),
  regions: enumList(REGIONS),
  control: enumList(CONTROLS),
  setting: enumList(SETTINGS),
  division: enumList(DIVISIONS),
  size_band: enumList(SIZE_BANDS),
  conference: z.preprocess((v) => (Array.isArray(v) ? v.map((x) => String(x).slice(0, 60).trim()).filter(Boolean).slice(0, 4) : []), z.array(z.string()).max(4)),
  max_cost_usd_per_year: z.preprocess((v) => (typeof v === 'number' && isFinite(v) && v > 0 && v < 1_000_000 ? Math.round(v) : null), z.number().nullable()),
  religion: enumOrNull(RELIGIONS),
  climate: enumList(CLIMATES),
  majors: z.preprocess((v) => (Array.isArray(v) ? v.map((x) => String(x).toLowerCase().trim()).filter((x) => MAJOR_KEYS.includes(x)) : []), z.array(z.string()).max(4)),
  rugby_tier: enumList(RUGBY_TIERS),
  rugby_program: enumOrNull(RUGBY_PROGRAMS),
  unparsed: z.preprocess((v) => (Array.isArray(v) ? v.map((x) => String(x).slice(0, 80)).slice(0, 6) : []), z.array(z.string()).max(6)),
});
export type Filters = z.infer<typeof FilterSchema>;

export const FILTER_KEYS = ['states', 'regions', 'control', 'setting', 'division', 'size_band', 'conference', 'max_cost_usd_per_year', 'religion', 'climate', 'majors', 'rugby_tier', 'rugby_program'] as const;

export function emptyFilters(): Filters {
  return FilterSchema.parse({});
}
export function parseFilters(raw: unknown): Filters | null {
  const r = FilterSchema.safeParse(raw && typeof raw === 'object' ? raw : {});
  return r.success ? { ...r.data, version: FILTER_VERSION } : null;
}
export function hasAnyFilter(f: Filters): boolean {
  return FILTER_KEYS.some((k) => {
    const v = f[k as keyof Filters];
    return Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined;
  });
}

// ---- input hygiene (also used before anything is logged) ----
export function stripPII(s: string): string {
  return s
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[link]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[number]');
}
export function cleanSentence(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_SENTENCE_CHARS);
}
