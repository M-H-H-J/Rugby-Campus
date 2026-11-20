-- ============================================================================
-- RUN ORDER: run this ONLY AFTER this PR is merged AND its production deploy on
-- https://www.rugbycampus.org shows Ready in Vercel.
-- Also run it AFTER supabase/manual/2026-11-20-launch-fixes.sql (PR #13). That file
-- rewrites the Rio Grande description, and this one has to land on top of it.
-- Why: the table wins over the bundle for description, achievements and program
-- type. Run early and the live pages would disagree with the prerendered HTML,
-- llms-full.txt and the search facts until the deploy catches up.
-- ============================================================================
-- Rugby Campus fact-check fixes, 20 Nov 2026 (fact-check-2026-11-20.md).
-- REVIEW, THEN RUN BY HAND in Supabase -> SQL Editor. Not run by the PR that added it.
-- Mirrors the same changes made in src/data/colleges.ts and src/data/collegeSearchFacts.json.
-- Safe to run twice: every statement sets a fixed value by slug. No inserts or deletes.
-- Tier columns are not touched. Coach fields are not touched.
-- UCLA's NCR D1 / CRAA dual wording is unchanged (held for Hugh); only its 2025–26 record
-- and home-ground sentence change.
-- Wrapped in one transaction: if any line fails, nothing changes.

-- PREVIEW (optional, run first): the rows this file touches, as they are now.
SELECT slug, program_type, achievements, left(description, 90) AS description_start
  FROM public.colleges
 WHERE slug IN ('lindenwood-university','university-of-california-los-angeles-ucla','mount-st-mary-s-university',
                'brigham-young-university','pennsylvania-state-university','university-of-arizona',
                'arkansas-state-university','university-of-michigan','wheeling-university','mckendree-university',
                'university-of-san-diego','siena-college','california-state-university-long-beach','university-of-rio-grande')
 ORDER BY slug;

BEGIN;

-- 1. Descriptions (full text, identical to colleges.ts).
--    Lindenwood: unbeaten (6–0), not 5–0. UCLA: drop the unsourced 5–2; home games at Wallis Annenberg and the IM field.
--    Mount St. Mary's: 2018 was premier team sport status, varsity coverage came later. Arkansas State: third straight postseason.
--    Michigan: September 2025, not October. McKendree: 36–14 was a loss to Ohio State; the other win was 59–15 at Illinois.
--    San Diego: 5–1–1. Long Beach State: did not top the South. Rio Grande: varsity since fall 2021.
UPDATE public.colleges SET description = $d$Lindenwood went unbeaten to win the Midwest Conference in 2025–26, then beat Penn State 31–10 in the 2026 D1A playoffs before losing a 31–24 quarterfinal to Life. Rugby is run by the university's Student Life Sports department in St. Charles, Missouri, near St. Louis.$d$ WHERE slug = 'lindenwood-university';
UPDATE public.colleges SET description = $d$UCLA plays both NCR Division 1 and CRAA D1A for 2026–27. In 2025–26 it played CRAA D1A in the southern half of the California Conference. The team runs through UCLA Club Sports and has played home games at both Wallis Annenberg Stadium and the campus intramural field.$d$ WHERE slug = 'university-of-california-los-angeles-ucla';
UPDATE public.colleges SET description = $d$Mount St. Mary's won the 2016 NSCRO national title and joined Rugby East in CRAA D1A in fall 2022. In 2018 the Mount promoted men's rugby from a club to a premier team sport, with scholarships and a full-time head coach, and the athletics department has since moved it to varsity-level coverage. Ask Coach Myles what aid looks like now. In 2026 the Mount went 7–6 and reached the D1A playoffs, losing in the first round at Life.$d$ WHERE slug = 'mount-st-mary-s-university';
UPDATE public.colleges SET description = $d$Arkansas State went 4–1 in the Midwest Conference in 2025–26 and reached the D1A playoffs, losing 42–17 at Army in the first round. That was the Red Wolves' third straight D1A postseason. Rugby is a club sport at the university in Jonesboro, Arkansas.$d$ WHERE slug = 'arkansas-state-university';
UPDATE public.colleges SET description = $d$Michigan beat Ohio State 25–22 in September 2025, its first 15s win over the Buckeyes since 2013, and went 2–1 in the Big Ten East. The Wolverines lost the Big Ten Cup semifinal 38–10 at Indiana. Home games are at Mitchell Field in Ann Arbor.$d$ WHERE slug = 'university-of-michigan';
UPDATE public.colleges SET description = $d$McKendree plays CRAA D1A in the Midwest Conference. In 2025–26 the Bearcats finished 3–12, with wins including 36–5 at Michigan State and 59–15 at Illinois, and three players were named all-conference. McKendree is a small private university in Lebanon, Illinois, about 25 miles east of St. Louis.$d$ WHERE slug = 'mckendree-university';
UPDATE public.colleges SET description = $d$San Diego went 5–1–1 in the southern half of the California Conference in 2025–26, including a 36–28 win over Long Beach State. The Toreros made the 2026 D1A playoffs as the West's No. 8 seed and lost in the first round at Cal.$d$ WHERE slug = 'university-of-san-diego';
UPDATE public.colleges SET description = $d$Long Beach State went 6–4 in the California Conference in 2025–26. Results included wins over UC Davis (71–5) and San Diego State (51–29) and a 36–28 loss to San Diego. The university is in Long Beach, California.$d$ WHERE slug = 'california-state-university-long-beach';
UPDATE public.colleges SET description = $d$Brad Sandig has been head coach since 2024. In spring 2026 the RedStorm finished runner-up at the Big Rivers 7s championship. Rio Grande runs rugby as a varsity sport. The university is in Rio Grande, a small town in southeast Ohio.$d$ WHERE slug = 'university-of-rio-grande';

-- 2. Achievements.
UPDATE public.colleges SET achievements = '["2025–26 Midwest Conference champions (6–0)"]'::jsonb WHERE slug = 'lindenwood-university';
UPDATE public.colleges SET achievements = '["2024 CRC National 7s champions","Unbeaten 2024 7s season"]'::jsonb WHERE slug = 'wheeling-university';

-- 3. Program type. BYU (extramural), Penn State (Team Sport in Intercollegiate Athletics) and Arizona
--    (Elite Team Sport since fall 2025) are neither Varsity nor Club, so blank: the profile hides the fact.
--    Siena (varsity since 2021) and Rio Grande (varsity since fall 2021) are Varsity.
UPDATE public.colleges SET program_type = '' WHERE slug = 'brigham-young-university';
UPDATE public.colleges SET program_type = '' WHERE slug = 'pennsylvania-state-university';
UPDATE public.colleges SET program_type = '' WHERE slug = 'university-of-arizona';
UPDATE public.colleges SET program_type = 'Varsity' WHERE slug = 'siena-college';
UPDATE public.colleges SET program_type = 'Varsity' WHERE slug = 'university-of-rio-grande';

COMMIT;

-- VERIFY (expect the values in the comments)
SELECT slug, program_type FROM public.colleges
 WHERE slug IN ('brigham-young-university','pennsylvania-state-university','university-of-arizona','siena-college','university-of-rio-grande')
 ORDER BY slug;                                                                       -- '', '', '', Varsity, Varsity
SELECT achievements FROM public.colleges WHERE slug = 'lindenwood-university';      -- ["2025–26 Midwest Conference champions (6–0)"]
SELECT achievements FROM public.colleges WHERE slug = 'wheeling-university';        -- ["2024 CRC National 7s champions","Unbeaten 2024 7s season"]
SELECT count(*) FROM public.colleges
 WHERE description ~ '(5–0 to win the Midwest|fourth straight D1A|October 2025, its first 15s|36–14 over Ohio State|topped the southern half|announced varsity rugby in 2018|going 5–2)'; -- 0
SELECT tier, count(*) FROM public.colleges GROUP BY tier ORDER BY tier;              -- unchanged: championship 8, competitive 13, emerging 15, playoff 14
