-- ============================================================================
-- PROPOSAL ONLY. Not run by the PR that added it. Review, then run by hand in
-- Supabase -> SQL Editor if you want it. Run AFTER 2026-11-20-launch-fixes.sql.
-- Safe to run more than once: every step drops or skips what an earlier run made.
-- ============================================================================
-- Why: email_subscribers and contacts accept inserts from the browser with the
-- public anon key (by design), but with no limits. Anyone can post straight to
-- /rest/v1/contacts with a 1 MB message, or fill email_subscribers with junk,
-- and none of the /api rate limits apply.
--
-- What this does (new rows only; existing rows are left alone, apart from step 1):
--   1. One row per (email, source) in email_subscribers. Older duplicates are
--      copied to a backup table first, so step 1 can be undone. A repeat sign-up
--      then returns "duplicate key", which the site already treats as success.
--   2. Length and format checks on both tables.
--   3. A per-address brake: at most 5 new rows per address per hour in each table.
--      The server sets created_at itself, so a client can't backdate rows to
--      dodge the count. This is per address on purpose: a script can't use it
--      to block everyone else's sign-ups (a table-wide brake would let it).
-- What it does NOT stop: a script inventing a new address for every row. Only
-- moving the inserts behind the rate-limited /api functions fixes that (see the end).
--
-- Effect on the site: a blocked insert shows "That didn't go through. Please try
-- again, or email hello@rugbycampus.org directly." on newsletter-style boxes.
-- The For-coaches form also emails Hugh, so it still succeeds if only the save fails.
--
-- To undo: see ROLLBACK at the bottom.

-- PREVIEW (optional, run first): duplicate subscribers that step 1 would merge.
SELECT lower(email) AS email, source, count(*) AS rows, min(created_at) AS first_seen
  FROM public.email_subscribers
 GROUP BY lower(email), source
HAVING count(*) > 1
 ORDER BY rows DESC;

-- 0. Backup of the whole table before anything is removed. IF NOT EXISTS keeps the
--    first run's copy if this file is run again. Delete it once you're happy:
--    DROP TABLE public.email_subscribers_backup_20261120;
CREATE TABLE IF NOT EXISTS public.email_subscribers_backup_20261120 AS TABLE public.email_subscribers;
ALTER TABLE public.email_subscribers_backup_20261120 ENABLE ROW LEVEL SECURITY; -- no policies: hidden from the anon key

BEGIN;

-- 1. De-duplicate, keeping the earliest row for each address + source, then enforce it.
DELETE FROM public.email_subscribers a
 USING public.email_subscribers b
 WHERE lower(a.email) = lower(b.email) AND a.source = b.source AND a.id > b.id;
CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_source_key
  ON public.email_subscribers (lower(email), source);

-- 2. Shape checks. NOT VALID = checked for new rows only, so old rows can't block this.
ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_email_shape;
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_email_shape
  CHECK (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') NOT VALID;
ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_source_known;
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_source_known
  CHECK (source IN ('newsletter', 'coach_unlock', 'training_program', 'article_notify', 'search_shortlist')) NOT VALID;
-- The For-coaches textarea is capped at 5000 characters to match (ContactForm.tsx).
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_sizes;
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_sizes
  CHECK (char_length(email) <= 254
     AND char_length(coalesce(name, '')) <= 200
     AND char_length(coalesce(message, '')) <= 5000
     AND char_length(coalesce(type, '')) <= 40) NOT VALID;

-- 3. Per-address brake. SECURITY DEFINER so the count can see rows the anon role can't read.
CREATE INDEX IF NOT EXISTS email_subscribers_email_created_idx ON public.email_subscribers (lower(email), created_at);
CREATE INDEX IF NOT EXISTS contacts_email_created_idx ON public.contacts (lower(email), created_at);

CREATE OR REPLACE FUNCTION public.rc_insert_brake() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent int;
BEGIN
  -- Never trust a created_at sent by the client.
  NEW.created_at := now();
  EXECUTE format('SELECT count(*) FROM %I.%I WHERE lower(email) = lower($1) AND created_at > now() - interval ''1 hour''',
                 TG_TABLE_SCHEMA, TG_TABLE_NAME)
     INTO recent USING NEW.email;
  IF recent >= 5 THEN
    RAISE EXCEPTION 'Too many requests for this address. Please try again later.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.rc_insert_brake() FROM PUBLIC;

DROP TRIGGER IF EXISTS email_subscribers_brake ON public.email_subscribers;
CREATE TRIGGER email_subscribers_brake BEFORE INSERT ON public.email_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.rc_insert_brake();
DROP TRIGGER IF EXISTS contacts_brake ON public.contacts;
CREATE TRIGGER contacts_brake BEFORE INSERT ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.rc_insert_brake();

COMMIT;

-- VERIFY
SELECT indexname FROM pg_indexes WHERE tablename = 'email_subscribers';           -- includes email_subscribers_email_source_key
SELECT conname FROM pg_constraint WHERE conrelid = 'public.contacts'::regclass;   -- includes contacts_sizes
SELECT tgname FROM pg_trigger WHERE tgname IN ('email_subscribers_brake', 'contacts_brake');
SELECT (SELECT count(*) FROM public.email_subscribers_backup_20261120) AS backed_up,
       (SELECT count(*) FROM public.email_subscribers) AS now_in_table;         -- the difference is the duplicates removed

-- Longer term (not here): move both inserts behind the rate-limited /api functions
-- with the service-role key, then drop the two "public insert" policies.

-- ROLLBACK (only if you need to undo). Restores the removed duplicates from the backup.
-- BEGIN;
-- DROP TRIGGER IF EXISTS email_subscribers_brake ON public.email_subscribers;
-- DROP TRIGGER IF EXISTS contacts_brake ON public.contacts;
-- DROP FUNCTION IF EXISTS public.rc_insert_brake();
-- ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_email_shape;
-- ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_source_known;
-- ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_sizes;
-- DROP INDEX IF EXISTS public.email_subscribers_email_source_key;
-- DROP INDEX IF EXISTS public.email_subscribers_email_created_idx;
-- DROP INDEX IF EXISTS public.contacts_email_created_idx;
-- INSERT INTO public.email_subscribers (id, email, source, created_at) OVERRIDING SYSTEM VALUE
--   SELECT b.id, b.email, b.source, b.created_at FROM public.email_subscribers_backup_20261120 b
--    WHERE NOT EXISTS (SELECT 1 FROM public.email_subscribers s WHERE s.id = b.id);
-- COMMIT;
