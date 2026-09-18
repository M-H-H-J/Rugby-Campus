# Rugby Campus — agent context

Read this before making any change. It exists so agents don't re-solve settled decisions or undo deliberate work.

## What this is

Rugby Campus is a free discovery site for aspiring rugby players who want to play at a US college. It profiles the 40 best men's college rugby programs in America across CRAA D1A and NCR D1, on an interactive map, with coach contacts, conference, squad size, MLR draft picks, campus facts and monthly weather.

Built and owned by **Hugh Johnston** — Australian, recruited to Notre Dame College at 17, captained the side in Rugby East, played PR7s and club rugby in Austin TX, returned as head coach and won the **2023 NCR D1 National Championship** (33–10 over St. Bonaventure in Houston). Notre Dame College has since closed; the program transferred to Walsh University.

That credential is the site's entire competitive moat. Never write copy that dilutes it, and never invent accomplishments beyond it.

**Business model:** free for players; revenue from (1) one-to-one placement/coaching via `/work-with-me`, (2) featured program listings for colleges via `/for-coaches`. The buyer is usually a **parent**, not the student.

**Live domain:** rugbycampus.org · **Contact:** hello@rugbycampus.org

## Stack

- React 18 + TypeScript + Vite 6, `wouter` for routing, Tailwind (config-driven tokens), `lucide-react` icons
- Leaflet + OpenStreetMap for the interactive map; a hand-built SVG US map for the homepage preview
- Supabase (Postgres) for college data + email capture; bundled TS data is the fallback
- Deployed on Vercel from GitHub — push to `main` redeploys automatically

## Commands

```
npm install
npm run dev      # local dev, localhost:5173
npm run build    # tsc + vite build + prerender  ← must print BOTH success lines
```

`npm run build` must end with `prerendered 54 pages + sitemap.xml + llms-full.txt`. If it doesn't, the SEO layer is broken — treat that as a failing build.

## File map

```
src/
  config.ts                 Supabase keys, SITE_URL, CONTACT_EMAIL  ← never blank these
  data/colleges.ts          the 40 programs (bundled fallback + source of truth for prerender)
  data/articles.ts          long-form guides (markdown-ish strings)
  data/us-map.ts            baked albersUsa SVG path data — do not regenerate
  lib/supabase.ts           client, captureEmail(), submitContact()
  lib/useColleges.ts        Supabase-first with bundled fallback
  lib/usePageMeta.ts        client-side title/meta
  components/               Navigation, Footer, CollegeCard, ArticleCard,
                            LeafletMap, USMap, CoachEmailUnlock, ContactForm
  pages/                    Home, Map, Colleges, CollegeDetail, Learn,
                            ArticlePage, Training, About, WorkWithMe, ForCoaches
scripts/prerender.mjs       post-build: static HTML per route + JSON-LD + sitemap + llms-full.txt
scripts/data-entry.ts       bundles TS data for the prerender script
public/                     logo.png, logo-white.png, icon.png, favicons,
                            robots.txt (currently BLOCKING), robots.public.txt, llms.txt
vercel.json                 SPA rewrites + asset caching
supabase-setup.sql          full schema + all 40 rows + idempotent updates
```

## Do not break these

1. **`vercel.json`** — without the SPA rewrite, every route except `/` 404s on direct visit. This was a real production bug.
2. **`scripts/prerender.mjs`** — it is the entire SEO and AI-visibility layer. If you change routes or data shape, update this script in the same change.
3. **`public/robots.txt`** currently contains `Disallow: /` **on purpose** — the site is deliberately private pre-launch. Never "fix" this. Going public is a manual step by Hugh (swap in `robots.public.txt`).
4. **`src/config.ts`** — contains live Supabase values. Never commit blank strings over them. The anon key is public-by-design and protected by RLS; that is not a leak.
5. **`src/data/us-map.ts`** — pre-projected path data. Don't regenerate or "optimise".
6. **npm audit warnings** — build-tooling only, not shipped to users. Do not run `npm audit fix`; it breaks the build.
7. **Adding a college** means updating `src/data/colleges.ts` *and* `supabase-setup.sql`, with `mapX`/`mapY` projected via d3-geo `geoAlbersUsa().scale(1280).translate([480,300])`.

## Design rules — non-negotiable

The site was deliberately redesigned away from generic "AI-built site" aesthetics. These are the rules that produced that. Violating them is a regression, not a style preference.

**Typography**
- Headings: `Newsreader` (serif), via `font-heading`. Body/UI: `Libre Franklin`, via `font-body`.
- Never introduce Inter, Montserrat, Poppins, or a fourth family.
- Article body copy is serif at ~17.5px with ~1.7 leading. It should read like journalism, not a dashboard.

**Colour** — tokens only, from `tailwind.config.js`: `navy #00458c`, `navy-deep`, `gold #f2b600`, `dark #071B33`, `ink`, `line`, `muted`, `faint`.
- Never use raw Tailwind greys (`gray-400` etc.) or hex literals in components.
- Gold is semantic: at most one gold element per screen, reserved for the primary action.
- No gradients except image scrims. No dark-mode-by-default. No purple/violet.

**Layout**
- Editorial, not boxy. Content cards are **borderless** — photo, then text. No bordered/filled card containers around college or article cards.
- Stat groups are **rule-separated rows** (`border-b border-line`), never grids of filled grey boxes.
- Section labels are plain letterspaced small-caps via the `.kicker` class — **never** a coloured pill/chip/badge above a heading.
- Left-aligned headlines. No centred hero with a pill badge above it.
- Radii are small: 6–12px. Never `rounded-2xl`, never `rounded-full` on buttons.
- Active nav state is a 2px underline, not a filled pill.

**Motion** — one set only: buttons lift 1px on hover (`.btn`), card images scale 1.03 (`.card-img`). Nothing fades or slides in on scroll.

**Voice** — first person, Hugh's. Plain, direct, occasionally blunt. No hype, no "unlock your potential", no exclamation marks. Honesty is the product: the site tells players they can skip agencies entirely, and says so on the paid page.

## Data rules

- Programs are grouped into three **tiers** — `championship`, `playoff`, `competitive` — never numbered 1–40. Rankings shift weekly and Goff Rugby Report and NCR publish conflicting lists; tiers are defensible, numbers are false precision. This is a deliberate product decision and a published editorial position (`/learn/why-college-rugby-rankings-lie`).
- `SEASON_LABEL` in `colleges.ts` is the single place the season is stated.
- **Never invent** coach names, emails, records, scholarship claims or draft numbers. 12 programs have empty `coachName` — that is correct and the UI handles it ("To be confirmed"). Leave blank rather than guessing.
- Verified facts to preserve: Cal won 2025 and 2026 D1A titles (36–22 over Navy in 2026, 17-0 season); coach is **Jack Clark**; St. Bonaventure won 2025 NCR D1; Central Washington discontinued its program April 2025 (deliberately excluded); UCLA moved D1A → NCR D1 for 2026–27; MLR contracted to 6 teams for 2026 but the College Draft continues.

## SEO / AI visibility

Target queries: "best rugby colleges in America", "best universities to play rugby at in USA", "college rugby scholarships USA".

Every route is prerendered to real HTML with unique title, meta description, canonical, OG tags and JSON-LD (`CollegeOrUniversity` + `SportsTeam` per college, `Article` per guide, `FAQPage` on the pillar guide, `Organization`/`WebSite` sitewide). `llms.txt` and `llms-full.txt` exist for AI assistants. Preserve all of this in any change that touches routing or data.

## Current state

Deployed to Vercel, **private** (robots blocked), custom domain not yet attached.

Open work, roughly in priority order:
1. Fill the 12 empty coach records (Hugh is verifying; do not invent).
2. Replace 40 Unsplash stock images with correctly-attributed Wikimedia Commons campus photos, or Hugh's own photography.
3. Write the three stub guides in `articles.ts` (they currently start with "Coming soon" — that prefix is how the UI detects stubs).
4. Women's rugby: `gender` field exists on every record and in the schema; the Colleges page has a disabled "Women's — soon" toggle. Enabling means adding rows with `gender: 'womens'` and activating the toggle.
5. Season preview article for 2026–27.

## TypeSafe / Jev

When calling TypeSafe’s System One model from this repo, read `.cursor/typesafe/COMPRESSED.md` first. Do not invent API fields. The API key is in gitignored `AP.env` at the repo root — load it with `scripts/load-ap-env.mjs`, never commit it, never send it to the browser. Jev returns typed decisions, not generated copy — it must never be used to invent coach names, match results, rankings, or scholarship claims.
