# Rugby Campus

A free resource helping aspiring rugby players find and explore college rugby programs in the USA.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173 in your browser
```

## Project Structure

```
rugby-campus/
├── index.html              # Entry HTML (with SEO meta tags)
├── package.json            # Dependencies
├── vite.config.ts          # Vite build config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── postcss.config.js       # PostCSS config
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Router + layout
    ├── index.css           # Global styles + design system
    ├── components/
    │   ├── Navigation.tsx      # Top nav (5 tabs)
    │   ├── Footer.tsx          # Site footer
    │   ├── CollegeCard.tsx     # College preview card
    │   ├── CoachEmailUnlock.tsx # Coach email with gate
    │   └── ArticleCard.tsx     # Article preview card
    ├── data/
    │   ├── colleges.ts     # College data (add more here)
    │   └── articles.ts     # Article content
    ├── lib/
    │   └── email-store.ts  # localStorage email persistence
    └── pages/
        ├── Home.tsx        # Homepage
        ├── MapPage.tsx     # Full-screen interactive map
        ├── Colleges.tsx    # College list with filters
        ├── CollegeDetail.tsx # Individual college page
        ├── Learn.tsx       # Articles list
        ├── ArticlePage.tsx # Individual article
        ├── Training.tsx    # Training programs
        └── About.tsx       # About + Work with Me
```

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, map preview, featured colleges, articles |
| `/map` | Map | Full-screen Leaflet map with filters |
| `/colleges` | Colleges | Searchable, filterable list |
| `/colleges/:slug` | College Detail | Full college profile + coach email |
| `/learn` | Learn | Articles list |
| `/learn/:slug` | Article | Individual article |
| `/training` | Training | Programs + email capture |
| `/about` | About | Story + Work with Me |

## How to Add a College

Open `src/data/colleges.ts` and add a new object to the array:

```typescript
{
  id: 4,
  name: "Your College Name",
  slug: "your-college-name",      // URL-friendly (lowercase, hyphens)
  location: "City, State",
  state: "State",
  region: "west",                  // west, midwest, southeast, northeast, southwest
  division: "D1A",                 // D1A, D1AA, D2
  rugbyRanking: undefined,         // or a number like 15
  latitude: 37.0,
  longitude: -122.0,
  description: "Your description...",
  coachName: "Coach Name",
  coachEmail: "",                  // Add when you have it
  conference: "Conference Name",
  homeField: "Field Name",
  achievements: ["Achievement 1", "Achievement 2"],
  competitionLevel: "D1A",
  mlrDraftees: 0,                  // You'll populate this
  enrollment: 10000,
  acceptanceRate: 50.0,
  tuition: 30000,
  popularMajors: ["Major 1", "Major 2"],
  campusSetting: "Urban",          // Urban, Suburban, Rural
  campusSize: "200 acres",
  climateType: "Description of climate...",
  website: "https://www.college.edu",
  imageUrl: "https://images.unsplash.com/photo-...",
  isPremium: false,
}
```

## How to Add an Article

Open `src/data/articles.ts` and add a new object. Use markdown-style formatting in the `content` field:
- `## Heading 2` and `### Heading 3` for sections
- `**bold text**` for emphasis
- `- item` for bullet lists
- `1. item` for numbered lists

## Deploying to Vercel

1. Push this project to a GitHub repository
2. Go to vercel.com and sign in with GitHub
3. Click "New Project" → Import your repo
4. Vercel auto-detects Vite — click Deploy
5. Your site is live!

Every time you push changes to GitHub, Vercel auto-deploys.

## Key Features

- **Email capture via coach email unlock** — stored in localStorage so users only enter email once
- **Interactive Leaflet map** — filterable by division, custom pins
- **SEO-optimized articles** — proper heading hierarchy, meta tags, clean URLs
- **Responsive** — works on mobile, tablet, desktop
- **No backend needed** — all data is in the frontend, email collection can be added via Vercel serverless functions or a service like Formspree

## Collecting Emails (Production)

Right now emails are only stored in localStorage. For production, you have a few options:

1. **Formspree** (easiest) — Replace form submissions with Formspree endpoint
2. **Vercel Serverless Functions** — Add an API route that saves to a database
3. **Supabase** — Free Postgres database with a dashboard to view emails

## Design System

- **Navy**: #00458c
- **Gold**: #ffb700  
- **Dark**: #0b1026
- **Headings**: Montserrat (500-800)
- **Body**: Inter (300-600)
- **Border radius**: 12px (rounded-xl in Tailwind)
- **Max width**: 1152px (max-w-6xl)
