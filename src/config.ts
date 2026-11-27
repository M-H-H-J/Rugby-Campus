// ── Rugby Campus configuration ─────────────────────────────
// After creating your free Supabase project (see SETUP-GUIDE.md),
// paste your two values here. Until then, the site runs fully
// on bundled data and email capture is logged to the console.

export const SUPABASE_URL = 'https://exkimqifoxjqdbuehffz.supabase.co';       // e.g. 'https://abcdefgh.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2ltcWlmb3hqcWRidWVoZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTkxMDYsImV4cCI6MjEwMzM3NTEwNn0.eJPf9dA2NB-pfhIAn0Q1MgIrrE5yhjHTmEoMaL8BiME';  // the long 'anon public' key

export const CONTACT_EMAIL = 'hello@rugbycampus.org';
export const SITE_URL = 'https://www.rugbycampus.org';
export const SITE_NAME = 'Rugby Campus';
/** Shown in the footer on every page. Keep it true: only mention paid listings once they exist, and always label them. */
export const MONEY_LINE = 'How the site makes money: free for players. Revenue comes from paid one-on-one coaching, and colleges may pay for a featured listing, which is always labelled Featured.';
/** The homepage H1. scripts/prerender.mjs prints the same string, so crawlers and visitors see one headline. */
export const HOME_HEADLINE = 'Every top college rugby program in America. Mapped.';
/** Homepage meta description (React, prerender and index.html). Coach emails need a free email signup, so say so. */
export const homeDescription = (n: number) => `${n} US men's college rugby programs across CRAA D1A and NCR D1, mapped and tiered, with coach emails (free with an email signup) and plain-English recruitment guides.`;
export const SITE_TAGLINE = 'Find Your Rugby College in the USA';
