-- ============================================================================
-- PROPOSAL ONLY. Not run by the PR that added it. Review, then run by hand in
-- Supabase -> SQL Editor if you want it. Run AFTER 2026-11-20-launch-fixes.sql.
-- ============================================================================
-- Why: email_subscribers and contacts accept inserts from the browser with the
-- public anon key (by design), but with no limits. Anyone can post straight to
-- /rest/v1/contacts with a 1 MB message, or fill email_subscribers with junk,
-- and none of the /api rate limits apply.
--
-- What this does (new rows only; existing rows are left alone):
--   1. One row per (email, source) in email_subscribers. A repeat sign-up returns
--      "duplicate key", which the site already treats as success.
--   2. Length and format checks on both tables.
--   3. A table-wide brake: at most 60 new rows per minute per table. Normal
--      traffic is far below this; a script dumping junk stops at 60.
-- Effect on the site: a blocked insert shows "That didn't go through. Please try
-- again, or email hello@rugbycampus.org directly." on the form.
--
-- Wrapped in one transaction: if any line fails, nothing changes.
-- To undo: see ROLLBACK at the bottom.

-- PREVIEW (optional, run first): duplicate subscribers that step 1 would merge.
SELECT lower(email) AS email, source, count(*) AS rows, min(created_at) AS first_seen
  FROM public.email_subscribers
 GROUP BY lower(email), source
HAVING count(*) > 1
 ORDER BY rows DESC;

BEGIN;

-- 1. De-duplicate, keeping the earliest row for each address + source, then enforce it.
DELETE FROM public.email_subscribers a
 USING public.email_subscribers b
 WHERE lower(a.email) = lower(b.email) AND a.source = b.source AND a.id > b.id;
CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_source_key
  ON public.email_subscribers (lower(email), source);

-- 2. Shape checks. NOT VALID = checked for new rows only, so old rows can't block this.
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_email_shape
  CHECK (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') NOT VALID;
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_source_known
  CHECK (source IN ('newsletter', 'coach_unlock', 'training_program', 'article_notify', 'search_shortlist')) NOT VALID;
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_sizes
  CHECK (char_length(email) <= 254
     AND char_length(coalesce(name, '')) <= 200
     AND char_length(coalesce(message, '')) <= 5000
     AND char_length(coalesce(type, '')) <= 40) NOT VALID;

-- 3. Table-wide brake. SECURITY DEFINER so the count can see rows the anon role can't read.
CREATE INDEX IF NOT EXISTS email_subscribers_created_at_idx ON public.email_subscribers (created_at);
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON public.contacts (created_at);

CREATE OR REPLACE FUNCTION public.rc_insert_brake() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent int;
BEGIN
  EXECUTE format('SELECT count(*) FROM %I.%I WHERE created_at > now() - interval ''1 minute''', TG_TABLE_SCHEMA, TG_TABLE_NAME) INTO recent;
  IF recent >= 60 THEN
    RAISE EXCEPTION 'Too many sign-ups right now. Please try again in a minute.' USING ERRCODE = 'P0001';
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

-- Longer term (not here): move both inserts behind the rate-limited /api functions
-- with the service-role key, then drop the two "public insert" policies.

-- ROLLBACK (only if you need to undo):
-- BEGIN;
-- DROP TRIGGER IF EXISTS email_subscribers_brake ON public.email_subscribers;
-- DROP TRIGGER IF EXISTS contacts_brake ON public.contacts;
-- DROP FUNCTION IF EXISTS public.rc_insert_brake();
-- ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_email_shape;
-- ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS email_subscribers_source_known;
-- ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_sizes;
-- DROP INDEX IF EXISTS public.email_subscribers_email_source_key;
-- COMMIT;
