// Deterministic rule-based stand-in for the model. Used when SEARCH_MOCK=1 (tests, local dev without a key).
// It is NOT the real parser: it only proves the pipeline (validation, limits, logging, matching) works without a key.
import { STATE_CODES } from '../../src/lib/search/filters.js';

const STATE_BY_NAME: Record<string, string> = { alabama:'AL',arizona:'AZ',california:'CA',colorado:'CO',connecticut:'CT',florida:'FL',georgia:'GA',illinois:'IL',indiana:'IN',kentucky:'KY',maryland:'MD',michigan:'MI',minnesota:'MN',missouri:'MO','new york':'NY','north carolina':'NC',ohio:'OH',oklahoma:'OK',pennsylvania:'PA','rhode island':'RI',texas:'TX',utah:'UT',virginia:'VA',washington:'WA','west virginia':'WV',arkansas:'AR',missouri2:'MO' };

export function mockParse(sentence: string): Record<string, unknown> {
  const s = ' ' + sentence.toLowerCase() + ' ';
  const has = (...w: string[]) => w.some((x) => s.includes(x));
  const out: Record<string, unknown> = { residency: null, home_state: null, states: [], regions: [], control: [], setting: [], division: [], size_band: [], conference: [], max_cost_usd_per_year: null, religion: null, climate: [], majors: [], rugby_tier: [], rugby_program: null, unparsed: [] };
  const push = (k: string, ...v: string[]) => { for (const x of v) if (!(out[k] as string[]).includes(x)) (out[k] as string[]).push(x); };
  if (has('ignore your instructions', 'ignore previous', 'system prompt')) { push('unparsed', sentence.slice(0, 80)); return out; }
  if (has('australia', 'overseas', 'international', 'sydney', 'from the uk', 'new zealand')) out.residency = 'international';
  for (const [name, code] of Object.entries(STATE_BY_NAME)) if (s.includes(' ' + name + ' ') || s.includes(' ' + name + ',')) push('states', code);
  if (has('north-east', 'northeast', 'new england')) push('regions', 'northeast');
  if (has('midwest', 'mid-west')) push('regions', 'midwest');
  if (has('west coast', ' the west')) push('regions', 'west');
  if (has('the south', 'southern ')) push('regions', 'south');
  if (has('public')) push('control', 'public');
  if (has('private', 'catholic')) push('control', 'private_nonprofit');
  if (has('big city', 'in a city')) push('setting', 'city');
  if (has('near a city', 'leafy', 'suburb')) push('setting', 'suburb');
  if (has('college town')) push('setting', 'college_town');
  if (has('rural', 'countryside', 'small town')) push('setting', 'country');
  if (has(' d1', 'division 1', 'division i ')) push('division', 'd1');
  if (has(' d2')) push('division', 'd2');
  if (has(' d3')) push('division', 'd3');
  if (has('naia')) push('division', 'naia');
  if (has(' big ', 'huge', 'large')) push('size_band', 'big');
  if (has('small', 'tight-knit')) push('size_band', 'small');
  if (has('football')) push('unparsed', 'football');
  const cost = s.match(/(?:under|below|max|up to|less than)\s*(?:us)?\$?\s*(\d{2,3})\s*k/) || s.match(/\$\s*(\d{2,3})\s*k/);
  if (cost) out.max_cost_usd_per_year = Number(cost[1]) * 1000;
  const cost2 = s.match(/(?:under|below|up to)\s*\$\s*(\d{4,6})/); if (cost2) out.max_cost_usd_per_year = Number(cost2[1]);
  if (has('cheap')) push('unparsed', 'cheap');
  if (has('not religious', 'secular')) out.religion = 'none_only';
  else if (has('religious college', 'religious school')) out.religion = 'religious';
  else if (has('catholic')) out.religion = 'catholic';
  if (has('not freezing', 'warm', 'sunny', 'no snow', 'mild winter', 'desert', ' hot')) push('climate', 'warm_winters');
  if (has('four seasons', 'some snow')) push('climate', 'cool_winters');
  if (has('cold is fine', 'snow is fine', 'love snow')) push('climate', 'cold_winters');
  if (has('math', 'stats')) push('majors', 'mathematics');
  if (has('engineer')) push('majors', 'engineering');
  if (has('business')) push('majors', 'business');
  if (has('nursing', 'pre-med', 'health', 'physio')) push('majors', 'health');
  if (has('computer science', ' cs ', 'coding', 'software')) push('majors', 'computer_science');
  if (has('sports science', 'kinesiology', 'exercise')) push('majors', 'sport_exercise');
  if (has('psychology')) push('majors', 'psychology');
  if (has('top rugby', 'best rugby')) push('rugby_tier', 'championship', 'playoff'); else if (has('decent rugby', 'good rugby')) push('rugby_tier', 'championship', 'playoff', 'competitive');
  if (has('varsity')) out.rugby_program = 'varsity'; else if (has(' club rugby', 'club team')) out.rugby_program = 'club';
  return out;
}
export const _states = STATE_CODES;
