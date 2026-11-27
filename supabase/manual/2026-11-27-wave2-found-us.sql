-- ============================================================================
-- PROPOSAL ONLY. Not run by the PR that added it. Review, then run by hand in
-- Supabase -> SQL Editor. Safe to run more than once (IF NOT EXISTS / DROP IF EXISTS
-- / CREATE OR REPLACE throughout). Run order: any time; the site works before and after.
-- ============================================================================
-- Rugby Campus, Wave 2 (27 Nov 2026): the optional "How did you find us?" answer.
--
-- What it stores: which option a visitor tapped after signing up (AI assistant,
-- Google, Reddit, Coach / teammate, Instagram / YouTube, Other), which sign-up box
-- it came from, and, for "AI assistant" only, their optional note on which AI and
-- what they asked (emails, phone numbers and links are stripped by the API first).
-- No email, name, IP or cookie id. It cannot be joined to email_subscribers.
--
-- Who can write: only the Vercel function api/found-us.ts, with the service-role key
-- (rate-limited per hashed IP, 20 an hour). The anon key gets NOTHING on this table:
-- no grant and no policy, so /rest/v1/found_us_responses answers 401/403 to the browser.
-- anon keeps exactly what it has today (INSERT on email_subscribers and contacts).
--
-- Before this runs: api/found-us.ts gets a 404 from Supabase and writes each answer
-- to the Vercel logs as "FOUND_US {...}" instead. Nothing breaks for visitors.
-- After it runs: answers land here. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
-- in Vercel (server-only, never VITE_), already used by the shortlist and search log.
--
-- To undo: see ROLLBACK at the bottom.

BEGIN;

CREATE TABLE IF NOT EXISTS public.found_us_responses (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- random id made in the browser per answer; the AI follow-up updates the same row
  rid         text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  channel     text        NOT NULL,
  context     text        NOT NULL,
  ai_detail   text
);

CREATE UNIQUE INDEX IF NOT EXISTS found_us_responses_rid_key ON public.found_us_responses (rid);
CREATE INDEX IF NOT EXISTS found_us_responses_created_idx ON public.found_us_responses (created_at DESC);

-- Shape checks (match api/found-us.ts and src/lib/foundUs.ts).
ALTER TABLE public.found_us_responses DROP CONSTRAINT IF EXISTS found_us_responses_shape;
ALTER TABLE public.found_us_responses
  ADD CONSTRAINT found_us_responses_shape CHECK (
        rid ~ '^[a-f0-9]{24}$'
    AND channel IN ('ai_assistant', 'google', 'reddit', 'coach_teammate', 'instagram_youtube', 'other')
    AND context IN ('coach_unlock', 'training_program', 'newsletter', 'article_notify')
    AND (ai_detail IS NULL OR (channel = 'ai_assistant' AND char_length(ai_detail) <= 300))
  );

-- Locked down: RLS on, no policies, no grants to the browser roles.
ALTER TABLE public.found_us_responses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.found_us_responses FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.found_us_responses TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.found_us_responses_id_seq TO service_role;

-- Brake (defence in depth; the API is already rate-limited). The server sets the
-- timestamps, and the whole table takes at most 600 new answers an hour. A table-wide
-- cap is fine here because a blocked answer only loses an optional survey reply,
-- never a sign-up. An update (the AI note) never changes rid, channel or created_at.
CREATE OR REPLACE FUNCTION public.rc_found_us_brake() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recent int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := now();
    NEW.updated_at := now();
    SELECT count(*) INTO recent FROM public.found_us_responses WHERE created_at > now() - interval '1 hour';
    IF recent >= 600 THEN
      RAISE EXCEPTION 'found_us_responses: hourly cap reached' USING ERRCODE = 'P0001';
    END IF;
  ELSE
    NEW.rid := OLD.rid;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.rc_found_us_brake() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS found_us_responses_brake ON public.found_us_responses;
CREATE TRIGGER found_us_responses_brake BEFORE INSERT OR UPDATE ON public.found_us_responses
  FOR EACH ROW EXECUTE FUNCTION public.rc_found_us_brake();

COMMIT;

-- VERIFY
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.found_us_responses'::regclass;            -- true
SELECT count(*) AS anon_policies FROM pg_policies WHERE tablename = 'found_us_responses';          -- 0
SELECT grantee, privilege_type FROM information_schema.role_table_grants
 WHERE table_name = 'found_us_responses' ORDER BY grantee, privilege_type;                         -- service_role only
SELECT tgname FROM pg_trigger WHERE tgname = 'found_us_responses_brake';

-- READ THE ANSWERS (SQL Editor)
-- SELECT channel, count(*) FROM public.found_us_responses GROUP BY channel ORDER BY 2 DESC;
-- SELECT created_at, context, ai_detail FROM public.found_us_responses
--  WHERE ai_detail IS NOT NULL ORDER BY created_at DESC LIMIT 100;

-- ROLLBACK (only if you need to undo; deletes the answers)
-- BEGIN;
-- DROP TRIGGER IF EXISTS found_us_responses_brake ON public.found_us_responses;
-- DROP FUNCTION IF EXISTS public.rc_found_us_brake();
-- DROP TABLE IF EXISTS public.found_us_responses;
-- COMMIT;
