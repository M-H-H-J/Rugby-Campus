-- ============================================================================
-- RUN ORDER: run this ONLY AFTER this PR is merged AND its production deploy on
-- https://www.rugbycampus.org shows Ready in Vercel. Run it after the 2026-11-20 files.
-- Why: the table wins over the bundle for description, badges, achievements and the
-- image fields. Run early and the live pages would show the new history (and request
-- /college-images/southern-virginia-university.jpg) before the deploy that ships it.
-- ============================================================================
-- Rugby Campus post-launch audit, Wave 1 (27 Nov 2026): championship and finals history,
-- and the missing Southern Virginia photo.
-- REVIEW, THEN RUN BY HAND in Supabase -> SQL Editor. Not run by the PR that added it.
-- Mirrors the same values in src/data/colleges.ts (a test checks they match).
-- Safe to run twice: every statement sets a fixed value by slug. No inserts or deletes.
-- Not touched: tier, coach_name, coach_email, affiliation, conference, MLR numbers.
-- Wrapped in one transaction: if any line fails, nothing changes.
--
-- What changes:
--   Navy:   2023 D1A National Champions (beat Cal 28–22), 2024 and 2026 D1A finalists.
--   Army:   2022 D1A National Champions (beat Saint Mary's 20–8).
--   Brown:  2022 and 2024 NCR D1 National Champions (beat Queens 23–20 in 2024).
--   Queens: 2024 NCR D1 finalists, alongside 2025.
--   Life:   4 D1A titles (2013, 2016, 2018, 2019) and 2025 D1A finalists (lost to Cal).
--   Southern Virginia: campus photo (Carol M. Highsmith, Library of Congress, public domain).

-- PREVIEW (optional, run first): the rows this file touches, as they are now.
SELECT slug, badges, achievements, left(description, 90) AS description_start, image_url
  FROM public.colleges
 WHERE slug IN ('united-states-naval-academy','united-states-military-academy-army','brown-university',
                'queens-university-of-charlotte','life-university','southern-virginia-university')
 ORDER BY slug;

BEGIN;

UPDATE public.colleges SET description = $d$You need U.S. citizenship to attend, apart from a small number of students nominated by their own government. Navy won the 2023 D1A national title, beating Cal 28–22 in the final, and reached the final again in 2024. In 2026 Navy was back in the final, beating Army 38–10 and Life on the way before losing 36–22 to Cal. Navy went 5–0 to top Rugby East in 2025–26. Gavin Hickie has led the program since 2017.$d$,
       badges = $j$["2026 D1A Finalists","2023 D1A National Champions"]$j$::jsonb,
       achievements = $j$["2023 D1A National Champions (beat Cal 28–22 in the final)","2024 D1A Finalists","2026 D1A Finalists","2025–26 Rugby East champions (5–0)"]$j$::jsonb
 WHERE slug = 'united-states-naval-academy';

UPDATE public.colleges SET description = $d$You need U.S. citizenship to attend, apart from a small number of students nominated by their own government. Army won the 2022 D1A national title, beating Saint Mary's 20–8 in the final. In 2026 Army beat Arkansas State 42–17 in the first round of the playoffs, then lost 38–10 at Navy in the quarterfinals to finish 10–4. Matt Sherman is head coach.$d$,
       badges = $j$["2022 D1A National Champions","2 drafted into MLR · 2 played"]$j$::jsonb,
       achievements = $j$["2022 D1A National Champions (beat Saint Mary's 20–8 in the final)"]$j$::jsonb
 WHERE slug = 'united-states-military-academy-army';

UPDATE public.colleges SET description = $d$Brown won NCR Division 1 national titles in 2022 and 2024, beating Queens 23–20 in the 2024 final. In fall 2025 the team reached the NCR Division 1 quarterfinals, where it lost 51–7 to eventual champions St. Bonaventure. Brown is an Ivy League university in Providence, Rhode Island.$d$,
       badges = $j$["2024 NCR D1 National Champions","2022 NCR D1 National Champions","2 drafted into MLR · 1 played"]$j$::jsonb,
       achievements = $j$["2024 NCR D1 National Champions (beat Queens 23–20 in the final)","2022 NCR D1 National Champions"]$j$::jsonb
 WHERE slug = 'brown-university';

UPDATE public.colleges SET description = $d$Queens reached the 2025 NCR Division 1 final, beating Wheeling 45–28 and Belmont Abbey 19–15 before losing 55–19 to St. Bonaventure. That was a second straight final: Queens lost the 2024 final 23–20 to Brown. Tyree Reed was named head coach in April 2025. Queens is in Charlotte, North Carolina, and plays in the ARC.$d$,
       badges = $j$["2025 NCR D1 Finalists","2024 NCR D1 Finalists","4 drafted into MLR · none confirmed played"]$j$::jsonb,
       achievements = $j$["2025 NCR D1 Finalists (lost 55–19 to St. Bonaventure)","2024 NCR D1 Finalists (lost 23–20 to Brown)"]$j$::jsonb
 WHERE slug = 'queens-university-of-charlotte';

UPDATE public.colleges SET description = $d$Life has won four D1A national titles: 2013, 2016, 2018 and 2019. It reached the 2025 final and lost to Cal. In 2026 the Running Eagles won a 31–24 quarterfinal at Lindenwood and reached the semifinals, where they lost to Navy. Life plays in Rugby East from Marietta, Georgia, near Atlanta.$d$,
       badges = $j$["2026 D1A Semifinalists","2025 D1A Finalists","4× D1A National Champions","17 drafted into MLR · 13 played"]$j$::jsonb,
       achievements = $j$["4× D1A National Champions (2013, 2016, 2018, 2019)","2025 D1A Finalists (lost to Cal)"]$j$::jsonb
 WHERE slug = 'life-university';

UPDATE public.colleges SET image_url = '/college-images/southern-virginia-university.jpg',
       image_credit = $d$Photo: Carol M. Highsmith / Library of Congress via Wikimedia Commons (public domain)$d$,
       image_source_page = 'https://commons.wikimedia.org/wiki/File:Southern_Virginia_University.jpg'
 WHERE slug = 'southern-virginia-university';


COMMIT;

-- VERIFY (expect the values in the comments)
SELECT slug, jsonb_array_length(badges) AS badges, jsonb_array_length(achievements) AS achievements
  FROM public.colleges
 WHERE slug IN ('united-states-naval-academy','united-states-military-academy-army','brown-university',
                'queens-university-of-charlotte','life-university')
 ORDER BY slug;   -- brown 3/2, queens 3/2, life 4/2, army 2/1, navy 2/4
SELECT count(*) FROM public.colleges
 WHERE (slug = 'united-states-naval-academy' AND description LIKE '%beating Cal 28–22%')
    OR (slug = 'united-states-military-academy-army' AND description LIKE '%Saint Mary''s 20–8%')
    OR (slug = 'brown-university' AND description LIKE '%Queens 23–20%')
    OR (slug = 'queens-university-of-charlotte' AND description LIKE '%2024 final 23–20 to Brown%')
    OR (slug = 'life-university' AND description LIKE '%2013, 2016, 2018 and 2019%');   -- 5
SELECT image_url FROM public.colleges WHERE slug = 'southern-virginia-university';  -- /college-images/southern-virginia-university.jpg
SELECT tier, count(*) FROM public.colleges GROUP BY tier ORDER BY tier;            -- unchanged: championship 8, competitive 13, emerging 15, playoff 14
