# Rugby Campus — Setup Guide

Everything you need to go from this folder to a live website with a working database. Written for a non-developer. Total time: ~45 minutes.

---

## Part 1 — Run it on your Mac (5 min)

1. Extract `rugby-campus.tar.gz` (double-click it)
2. Open Cursor → File → Open Folder → select the `rugby-campus` folder
3. Open the terminal in Cursor (`Ctrl + backtick`)
4. Run:
   ```
   npm install
   npm run dev
   ```
5. Open the `http://localhost:5173` link it prints. Done.

The site works fully right now using bundled data. Email signups are logged to the browser console until you connect the database (Part 2).

---

## Part 2 — The database (Supabase, free, ~15 min)

Supabase gives you a spreadsheet-style dashboard to edit colleges and view every captured email. Free tier is plenty.

### 2.1 Create the project
1. Go to **supabase.com** → Sign up (GitHub or email)
2. Click **New Project**
   - Name: `rugby-campus`
   - Database password: generate one, save it somewhere (you rarely need it)
   - Region: pick **US East** (closest to your users)
3. Wait ~2 minutes while it provisions

### 2.2 Create the tables and load all 40 colleges
1. In the left sidebar, click **SQL Editor**
2. Open the file `supabase-setup.sql` from this folder in any text editor
3. Copy ALL of it, paste into the SQL Editor, click **Run**
4. You should see "Success". That one click created 3 tables and loaded all 40 colleges.

### 2.3 Connect the website
1. In Supabase: **Project Settings (gear icon) → API**
2. Copy two values:
   - **Project URL** (looks like `https://abcdxyz.supabase.co`)
   - **anon public** key (the long one under "Project API keys")
3. In Cursor, open `src/config.ts` and paste them:
   ```ts
   export const SUPABASE_URL = 'https://abcdxyz.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
   ```
4. Save. Refresh your local site. It's now reading from your database.

### 2.4 Using your database (day-to-day)
- **Edit a college:** Supabase → Table Editor → `colleges` → click any cell, type, Enter. The live site updates on next page load. This is how you'll fix coach names/emails as you verify them.
- **See your email list:** Table Editor → `email_subscribers`. The `source` column tells you where each signup came from (coach_unlock / training_program / newsletter / article_notify).
- **Export emails:** open the table → click the download icon → CSV. Import into any email tool (Mailchimp, Beehiiv, etc.) whenever you're ready to send.
- **Work-with-me enquiries:** Table Editor → `contacts`.

---

## Part 3 — Put it on the internet (Vercel, free, ~15 min)

### 3.1 Get the code onto GitHub
1. Create a free account at **github.com**
2. In Cursor's terminal, run these one at a time:
   ```
   git init
   git add .
   git commit -m "Rugby Campus launch"
   ```
3. Go to github.com → New repository → name it `rugby-campus` → Create (don't tick any boxes)
4. GitHub shows you commands under "push an existing repository". Copy the three lines that look like this and run them:
   ```
   git remote add origin https://github.com/YOURNAME/rugby-campus.git
   git branch -M main
   git push -u origin main
   ```

### 3.2 Deploy on Vercel
1. Go to **vercel.com** → Sign up with GitHub
2. Click **Add New → Project** → Import `rugby-campus`
3. Framework preset: it auto-detects **Vite**. Don't change anything.
4. Click **Deploy**. Two minutes later you have a live URL like `rugby-campus.vercel.app`.

From now on, any change you push to GitHub redeploys automatically.

### 3.3 Connect your domain (once you've bought it)
1. Buy the domain (Cloudflare Registrar or Namecheap, ~US$10–15/yr). Check **rugbycampus.com** first.
2. Vercel → your project → Settings → Domains → Add → type your domain
3. Vercel shows you 1–2 DNS records to add at your registrar. Add them. Wait ~10 min.
4. Free email address: if you used Cloudflare, turn on **Email Routing** and forward `hello@yourdomain.com` to your personal inbox. Then update `CONTACT_EMAIL` in `src/config.ts` and push.

---

## Part 4 — Your launch checklist

- [ ] Buy domain
- [ ] Supabase project created, SQL run, keys pasted into `src/config.ts`
- [ ] Deployed to Vercel
- [ ] Domain connected + `CONTACT_EMAIL` updated
- [ ] Spot-check coach emails in the Supabase `colleges` table (they're from your 2024 sheet)
- [ ] Send the site to 5 rugby people you trust for feedback

## What's already built in (nothing to do)

- 40 colleges, tiered by final 2025–26 results, CRAA D1A + NCR D1
- Interactive OpenStreetMap with street-level zoom
- Email capture on 4 touchpoints, all writing to your database
- 3 full articles + 3 "notify me" stubs (each stub also captures emails)
- Women's rugby framework: every college has a `gender` field and the UI has a disabled "Women's — Soon" toggle. When you're ready, we add women's programs as new rows with `gender = 'womens'` and flip the toggle on.
- SEO titles + descriptions on every page

## When something breaks

Ask Cursor's AI chat (Cmd+L): *"this project won't start, here's the error: [paste]"*. It will fix most things. For anything bigger, come back to Claude with the error text.
