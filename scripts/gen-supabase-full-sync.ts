// Run from repo root: npx tsx scripts/gen-supabase-full-sync.ts > supabase-full-sync-2026-11-06.sql
import { colleges } from '../src/data/colleges';
const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
};
const j = (v: unknown) => q(JSON.stringify(v ?? [])) + '::jsonb';
const cols = ['slug','name','location','state','region','lat','lng','map_x','map_y','affiliation','conference','tier','program_type','draft_picks','player_count','coach_name','coach_email','description','enrollment','popular_majors','weather_summary','monthly_temps','badges','achievements','website','image_url','gender','rugby_program_url','assistant_coaches','recruitment_form_url','image_credit','image_source_page','mlr_played','mlr_unconfirmed','mlr_no_appearance','mlr_not_yet','mlr_note'];
const rows = colleges.map((c, i) => '(' + [i + 1, q(c.slug), q(c.name), q(c.location), q(c.state), q(c.region), q(c.lat), q(c.lng), q(c.mapX), q(c.mapY), q(c.affiliation), q(c.conference), q(c.tier), q(c.programType), q(c.draftPicks ?? 0), q(c.playerCount ?? 0), q(c.coachName ?? ''), q(c.coachEmail ?? ''), q(c.description), q(c.enrollment), j(c.popularMajors), q(c.weatherSummary), j(c.monthlyTemps), j(c.badges), j(c.achievements), q(c.website), q(c.imageUrl), q(c.gender ?? 'mens'), q(c.rugbyProgramUrl ?? ''), j(c.assistantCoaches), q(c.recruitmentFormUrl ?? ''), q(c.imageCredit ?? ''), q(c.imageSourcePage ?? ''), (c.mlrPlayed === null || c.mlrPlayed === undefined ? 'NULL::integer' : q(c.mlrPlayed)), q(c.mlrUnconfirmed ?? 0), q(c.mlrNoAppearance ?? 0), q(c.mlrNotYet ?? 0), q(c.mlrNote ?? '')].join(', ') + ')');
const out: string[] = [];
out.push(`-- Rugby Campus full colleges sync, generated ${new Date().toISOString()} from src/data/colleges.ts (${colleges.length} rows)`);
out.push(`-- PREVIEW (run before BEGIN if you want a dry look): existing rows where non-empty DB coach/program would change under a naive overwrite.
-- After the COALESCE fix, this should be 0 for coach fields when comparing to EXCLUDED blanks.
-- Safe to skip; the upsert itself uses COALESCE guards.`);
out.push('BEGIN;');
out.push(`ALTER TABLE public.colleges
  ADD COLUMN IF NOT EXISTS recruitment_form_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_credit text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_source_page text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mlr_played integer,
  ADD COLUMN IF NOT EXISTS mlr_unconfirmed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mlr_no_appearance integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mlr_not_yet integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mlr_note text NOT NULL DEFAULT '';`);
// Protect DB-only values: blank/empty from the bundle must not wipe live coach data.
const protectEmptyText = new Set(['coach_name', 'coach_email', 'rugby_program_url']);
const set = cols
  .filter((c) => c !== 'slug')
  .map((c) => {
    if (protectEmptyText.has(c)) {
      return `  ${c} = COALESCE(NULLIF(EXCLUDED.${c}, ''), colleges.${c})`;
    }
    if (c === 'assistant_coaches') {
      return `  assistant_coaches = CASE WHEN jsonb_array_length(EXCLUDED.assistant_coaches) = 0 THEN colleges.assistant_coaches ELSE EXCLUDED.assistant_coaches END`;
    }
    if (c === 'player_count') {
      return `  player_count = CASE WHEN EXCLUDED.player_count = 0 THEN colleges.player_count ELSE EXCLUDED.player_count END`;
    }
    return `  ${c} = EXCLUDED.${c}`;
  })
  .concat(['  updated_at = now()'])
  .join(',\n');
out.push(`WITH src (ord, ${cols.join(', ')}) AS (VALUES
${rows.join(',\n')}
)
INSERT INTO public.colleges (id, ${cols.join(', ')})
OVERRIDING SYSTEM VALUE
SELECT (SELECT coalesce(max(id),0) FROM public.colleges) + ord, ${cols.join(', ')} FROM src
ON CONFLICT (slug) DO UPDATE SET
${set};`);
out.push(`-- Retired programs (site already hides them)
DELETE FROM public.colleges WHERE slug IN ('university-of-st-thomas-minnesota','iona-university');`);
out.push('COMMIT;');
out.push(`-- Verify
SELECT count(*) AS total FROM public.colleges;  -- expect ${colleges.length}
SELECT slug, jsonb_array_length(monthly_temps) AS months, weather_summary FROM public.colleges
 WHERE jsonb_array_length(monthly_temps) <> 12 OR weather_summary IS NULL OR weather_summary = '' ORDER BY slug;  -- expect 0 rows
SELECT slug FROM public.colleges WHERE slug NOT IN (${colleges.map(c => q(c.slug)).join(', ')});  -- expect 0 rows
-- Coach emails that must still be present after sync (DB-only protection)
SELECT slug, coach_email FROM public.colleges
 WHERE slug IN ('dartmouth-college','marian-university','university-of-michigan','university-of-notre-dame','santa-clara-university','university-of-san-diego','southern-nazarene-university','walsh-university')
   AND (coach_email IS NULL OR coach_email = '')
 ORDER BY slug;  -- expect 0 rows`);
console.log(out.join('\n\n'));
