-- Rugby Campus sentence search: tables for the anonymous search log and shortlist emails.
-- HUGH ONLY, AFTER THE PR IS MERGED. Run once in the Supabase SQL Editor.
-- Before you run it: check the column names below against api/_lib/logsink.ts and api/shortlist-email.ts (they must match).
-- Nothing here touches existing tables. email_subscribers already accepts source = 'search_shortlist' (the column is plain text).

create table if not exists search_logs (
  id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  sentence text,            -- what the visitor typed, with emails/phones/URLs scrubbed. No IP, no cookie id.
  filters jsonb,
  ok boolean not null default true,
  reason text,
  model text,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,6),
  ms int
);

create table if not exists shortlist_emails (
  id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  email text not null,
  slugs jsonb not null default '[]',
  sentence text
);

-- Lock both tables: no public policy at all, so only the service-role key (used by the Vercel functions) can read or write.
alter table search_logs enable row level security;
alter table shortlist_emails enable row level security;

create index if not exists search_logs_created_idx on search_logs (created_at desc);

-- Then in Vercel set: SEARCH_LOG_SINK=supabase, SHORTLIST_SINK=supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server only, never VITE_).
