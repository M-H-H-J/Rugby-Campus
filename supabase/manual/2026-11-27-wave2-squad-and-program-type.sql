-- ============================================================================
-- PROPOSAL ONLY. Not run by the PR that added it. Review, then run by hand in
-- Supabase -> SQL Editor. Run it after this PR's production deploy shows Ready
-- (either order is safe: these values match the bundle in src/data/colleges.ts).
-- ============================================================================
-- Rugby Campus, Wave 2 (27 Nov 2026): data fills approved by Hugh.
-- Mirrors src/data/colleges.ts and src/data/collegeSearchFacts.json (a test checks they match).
-- Safe to run twice: every statement sets a fixed value by slug. No inserts or deletes.
-- Not touched: tier, coach_name, coach_email, affiliation, conference, MLR numbers.
--
-- Why it matters live: the site reads program_type from this table first (useColleges.ts),
-- so until this runs, the four profiles below keep showing no Varsity/Club label.
-- Squad size is read from the bundle, so player_count here is kept in step for completeness.
--
-- Squad sizes, from official 2026–27 rosters:
--   Southern Virginia 37 · St. Thomas (Florida) 31 · Rio Grande 36 · Air Force 47
--   (Colorado, UC Santa Cruz and Western Washington publish no current roster: left at 0.)
-- Program types:
--   Aquinas Varsity · Arizona Club · BYU Club · Penn State Varsity

-- PREVIEW (optional, run first): the rows this file touches, as they are now.
SELECT slug, player_count, program_type
  FROM public.colleges
 WHERE slug IN ('southern-virginia-university','st-thomas-university-florida','university-of-rio-grande',
                'united-states-air-force-academy','aquinas-college','university-of-arizona',
                'brigham-young-university','pennsylvania-state-university')
 ORDER BY slug;

BEGIN;

UPDATE public.colleges SET player_count = 37 WHERE slug = 'southern-virginia-university';
UPDATE public.colleges SET player_count = 31 WHERE slug = 'st-thomas-university-florida';
UPDATE public.colleges SET player_count = 36 WHERE slug = 'university-of-rio-grande';
UPDATE public.colleges SET player_count = 47 WHERE slug = 'united-states-air-force-academy';

UPDATE public.colleges SET program_type = 'Varsity' WHERE slug = 'aquinas-college';
UPDATE public.colleges SET program_type = 'Club'    WHERE slug = 'university-of-arizona';
UPDATE public.colleges SET program_type = 'Club'    WHERE slug = 'brigham-young-university';
UPDATE public.colleges SET program_type = 'Varsity' WHERE slug = 'pennsylvania-state-university';

COMMIT;

-- VERIFY: 8 rows, values as listed above.
SELECT slug, player_count, program_type
  FROM public.colleges
 WHERE slug IN ('southern-virginia-university','st-thomas-university-florida','university-of-rio-grande',
                'united-states-air-force-academy','aquinas-college','university-of-arizona',
                'brigham-young-university','pennsylvania-state-university')
 ORDER BY slug;
