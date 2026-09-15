# Rugby Campus — open tasks

Priority order. Each task states its own definition of done.
Read AGENTS.md first.

## 1. Pre-launch verification (blocking go-live)
- [ ] Run `npm run build`; confirm it prints "✓ built" AND "prerendered 55 pages + sitemap.xml + llms-full.txt".
- [ ] Confirm `vercel.json` exists and contains the SPA rewrite.
- [ ] Confirm `public/robots.txt` still contains `Disallow: /`.
- [ ] Open every route in dev and confirm no console errors:
      / /map /colleges /learn /training /about /work-with-me /for-coaches
      plus one college page and one article page.
- [ ] Confirm the Leaflet map renders, zooms, and that clicking a pin opens a
      popup whose "View full profile" button navigates correctly.
- [ ] Confirm a coach-email unlock writes a row to Supabase `email_subscribers`,
      and the `/work-with-me` form writes to `contacts`.
Done when: all boxes pass and the build is clean.

## 2. Accessibility + mobile pass
- [ ] Check colour contrast meets WCAG AA for `muted` and `faint` text on white.
      If any fails, darken the token in tailwind.config.js (do not change the
      navy or gold brand colours).
- [ ] Every interactive element reachable by keyboard with a visible focus ring.
- [ ] Test at 375px wide: nav, filter bar on /colleges, the weather table on a
      college page, and the map. Fix overflow without changing the design language.
Done when: no horizontal scroll at 375px, all focus states visible, contrast passes.

## 3. Replace stock imagery (needs Hugh's input on sourcing)
Current: all 40 `imageUrl` values are generic Unsplash photos labelled as
specific campuses — legal, but inaccurate and a credibility risk.
- [ ] Source correctly-licensed campus photos (Wikimedia Commons preferred) for
      each of the 40, update `imageUrl` in BOTH src/data/colleges.ts and
      supabase-setup.sql, and add an attribution field if the licence requires it.
Done when: every image is genuinely of that campus, with attribution where required.

## 4. Write the three stub guides
In src/data/articles.ts, articles whose `content` starts with "Coming soon".
Write in Hugh's voice per AGENTS.md. Each needs metaTitle, metaDescription,
excerpt, readTime, and markdown-ish content matching the existing articles' style.
- [x] "How to Play Rugby in College in the USA"
- [x] "Rugby Scholarships in the USA — What's Actually Available"
- [x] "How College Rugby Recruitment Works in the USA"
- [x] "How to get recruited yourself (without an agency)" — highest-value lead magnet for /work-with-me.
Done when: no article content begins with "Coming soon" and the build prerenders them.

## 5. 2026–27 season preview article
New article covering: Cal chasing a third straight D1A title, Navy's rematch
arc, new D1A entrants (St. Thomas, Santa Clara, San Diego, Utah, Western
Washington), UCLA's move to NCR D1, and the NCR race after St. Bonaventure's
2025 title. Verify every claim against goffrugbyreport.com before writing.
Done when: published, prerendered, and linked from /learn and the homepage.

## 6. Women's rugby (do not start without Hugh's go-ahead)
Framework already exists: `gender` field on every record and in the Supabase
schema, plus a disabled toggle on /colleges.
Done when: women's programs added as rows with gender='womens', the toggle is
enabled and filters correctly, and prerender covers both.
