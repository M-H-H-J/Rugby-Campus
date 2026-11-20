-- ============================================================================
-- RUN ORDER: run this ONLY AFTER PR #13 is merged AND the production deploy on
-- https://www.rugbycampus.org shows Ready in Vercel. Then run it immediately.
-- Why: on main the site falls back to the code copy for any coach field the table leaves blank.
-- Run before the merge, and main (which still has Luke Gross in colleges.ts) would show
-- Brad Tucker with Luke Gross's old email.
-- After the bug-hunt PR (2026-11-20) the table is the answer for coach_name / coach_email whenever
-- the row exists, blank included. Until this file runs, UC Santa Cruz and Air Force (blank in the
-- table today) show "Head coach not confirmed yet" instead of the coaches added in colleges.ts.
-- ============================================================================
-- Rugby Campus launch fixes, 20 Nov 2026.
-- REVIEW, THEN RUN BY HAND in Supabase -> SQL Editor. Not run by the PR that added it.
-- Mirrors the same changes made in src/data/colleges.ts and src/data/collegeSearchFacts.json.
-- Safe to run twice: every statement sets a fixed value by slug. No tier changes. No inserts or deletes.
-- Wrapped in one transaction: if any line fails, nothing changes.

-- PREVIEW (optional, run first): the rows this file touches, as they are now.
SELECT slug, conference, program_type, coach_name, coach_email, rugby_program_url
  FROM public.colleges
 WHERE slug IN ('indiana-university','united-states-air-force-academy','university-of-california-santa-cruz',
                'dartmouth-college','marian-university','santa-clara-university','southern-nazarene-university',
                'university-of-michigan','university-of-san-diego','the-ohio-state-university')
 ORDER BY slug;

BEGIN;

-- 1. Indiana: Brad Tucker is head coach since 1 Oct 2026 (iurugby.com). No published email, so blank (the unlock hides).
UPDATE public.colleges SET coach_name = 'Brad Tucker', coach_email = '' WHERE slug = 'indiana-university';

-- 2. Air Force: club, not varsity. Coach John Cullen. Team inbox approved by Hugh on 20 Nov 2026.
UPDATE public.colleges
   SET program_type = 'Club', coach_name = 'John Cullen', coach_email = 'ZoomieMensRugby@gmail.com',
       rugby_program_url = 'https://zoomierugby.com/mens-team'
 WHERE slug = 'united-states-air-force-academy';

-- 3. UC Santa Cruz: coach Jeremy Sanford (UCSC News, Nov 2025); club (UCSC News: "Men's and Women's Rugby Clubs"). No email.
UPDATE public.colleges SET program_type = 'Club', coach_name = 'Jeremy Sanford', coach_email = '' WHERE slug = 'university-of-california-santa-cruz';

-- 4. Ohio State: conference Big Ten (Hugh's decision, 20 Nov 2026).
UPDATE public.colleges SET conference = 'Big Ten' WHERE slug = 'the-ohio-state-university';

-- 5. Coaches already in this table: restated so the table and the repo agree exactly (no change expected).

UPDATE public.colleges SET coach_name = 'Kyle Sumsion', coach_email = 'kyle.r.sumsion@dartmouth.edu' WHERE slug = 'dartmouth-college';
UPDATE public.colleges SET coach_name = 'John Harley', coach_email = 'jharley@marian.edu' WHERE slug = 'marian-university';
UPDATE public.colleges SET coach_name = 'Paul Keeler', coach_email = 'pkeeler@scu.edu' WHERE slug = 'santa-clara-university';
UPDATE public.colleges SET coach_name = 'Aric Gilliland', coach_email = 'agilliland@mail.snu.edu' WHERE slug = 'southern-nazarene-university';
UPDATE public.colleges SET coach_name = 'Christian Mentzer', coach_email = 'mensrugby@umich.edu' WHERE slug = 'university-of-michigan';
UPDATE public.colleges SET coach_name = 'Charlie Purdon', coach_email = 'usdrugbycoach@gmail.com' WHERE slug = 'university-of-san-diego';

-- 6. Descriptions (the table wins over the repo for this field, so these must match colleges.ts).
--    Army/Navy/Air Force: one citizenship line. Air Force/UCSC/Rio Grande/Aquinas: research notes removed. Ohio State: Big Ten.
--    Dartmouth: D1AA spelling. Davenport: coach name matches the coach card.
UPDATE public.colleges SET description = $d$You need U.S. citizenship to attend, apart from a small number of students nominated by their own government. Navy reached the 2026 D1A final, beating Army 38–10 and Life on the way before losing 36–22 to Cal. Navy went 5–0 to top Rugby East in 2025–26. Gavin Hickie has led the program since 2017.$d$ WHERE slug = 'united-states-naval-academy';
UPDATE public.colleges SET description = $d$You need U.S. citizenship to attend, apart from a small number of students nominated by their own government. Army won the 2022 D1A national title. In 2026 Army beat Arkansas State 42–17 in the first round of the playoffs, then lost 38–10 at Navy in the quarterfinals to finish 10–4. Matt Sherman is head coach.$d$ WHERE slug = 'united-states-military-academy-army';
UPDATE public.colleges SET description = $d$You need U.S. citizenship to attend, apart from a small number of students nominated by their own government. Air Force rugby is a club that fields three teams. The top side plays CRAA D1A in the Rocky Mountain Conference. John Cullen is head coach and director of rugby. The campus is in Colorado Springs, Colorado.$d$ WHERE slug = 'united-states-air-force-academy';
UPDATE public.colleges SET description = $d$UC Santa Cruz plays CRAA D1A in the California Conference as a club. Jeremy Sanford is head coach of the men's and women's rugby clubs. The campus is in Santa Cruz, California.$d$ WHERE slug = 'university-of-california-santa-cruz';
UPDATE public.colleges SET description = $d$Brad Sandig has been head coach since 2024. In spring 2026 the RedStorm finished runner-up at the Big Rivers 7s championship. The university is in Rio Grande, a small town in southeast Ohio.$d$ WHERE slug = 'university-of-rio-grande';
UPDATE public.colleges SET description = $d$Aquinas added men's rugby in 2021. Head coach Lance Hohaia, a 2008 Rugby League World Cup winner with New Zealand, has led it from the start. In fall 2025 the Saints went 6–2 and finished third in the Big Rivers Conference. Aquinas is a small Catholic college in Grand Rapids, Michigan.$d$ WHERE slug = 'aquinas-college';
UPDATE public.colleges SET description = $d$Ohio State finished third in the Big Ten East in fall 2025 and beat Michigan State 73–19 in November. Ohio State plays in the Big Ten for 2026–27. The team plays in Columbus, Ohio.$d$ WHERE slug = 'the-ohio-state-university';
UPDATE public.colleges SET description = $d$Dartmouth won the 2019 D1AA spring national title. In fall 2025 the team reached an NCR Division 1 play-in game and lost 38–33 to Wheeling. Dartmouth plays out of the Corey Ford Rugby Clubhouse in Hanover, New Hampshire.$d$ WHERE slug = 'dartmouth-college';
UPDATE public.colleges SET description = $d$Davenport won the 2026 D1A Challenger Cup, beating St. Thomas (Florida) 30–23 and Utah 37–17. The Panthers also won back-to-back Division 1AA national titles in 2010–11 and 2011–12. Dominique (Dom) Bailey has been head coach since December 2024, and the university is in Grand Rapids, Michigan.$d$ WHERE slug = 'davenport-university';

-- 7. Honours spelling (the table wins over the repo for achievements too).
UPDATE public.colleges SET achievements = '["2019 D1AA Spring Championship"]'::jsonb WHERE slug = 'dartmouth-college';
UPDATE public.colleges SET achievements = '["7× Big Ten 15s champions"]'::jsonb WHERE slug = 'indiana-university';

COMMIT;

-- VERIFY (expect the values in the comments)
SELECT slug, coach_name, coach_email FROM public.colleges WHERE slug = 'indiana-university';                -- Brad Tucker, ''
SELECT slug, program_type, coach_name, coach_email, rugby_program_url FROM public.colleges
 WHERE slug = 'united-states-air-force-academy';                                                          -- Club, John Cullen, ZoomieMensRugby@gmail.com, zoomierugby.com
SELECT slug, program_type, coach_name FROM public.colleges WHERE slug = 'university-of-california-santa-cruz'; -- Club, Jeremy Sanford
SELECT slug, conference FROM public.colleges WHERE slug = 'the-ohio-state-university';                    -- Big Ten
SELECT count(*) FROM public.colleges WHERE coach_email ILIKE '%coachgross%' OR coach_name = 'Luke Gross';  -- 0
SELECT tier, count(*) FROM public.colleges GROUP BY tier ORDER BY tier;                                   -- unchanged: championship 8, competitive 13, emerging 15, playoff 14
