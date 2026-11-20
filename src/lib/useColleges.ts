import { useState, useEffect } from 'react';
import { colleges as bundled, College } from '@/data/colleges';
import { sortColleges } from '@/lib/collegeOrder';
import { getSupabase } from '@/lib/supabase';

// Lookup bundled data by slug for merging with Supabase
const bundledBySlug = new Map(bundled.map((c) => [c.slug, c]));

/** Programs that left the list. Their old Supabase rows are hidden until Hugh deletes them with the SQL block. */
export const RETIRED_SLUGS: ReadonlySet<string> = new Set([
  'university-of-st-thomas-minnesota',
  'iona-university',
]);

export function dropRetired<T extends { slug?: unknown }>(rows: T[]): T[] {
  return rows.filter((r) => !RETIRED_SLUGS.has(String(r.slug)));
}

type RemoteCollege = {
  badges?: unknown; description?: unknown; draft_picks?: unknown; draftPicks?: unknown;
  affiliation?: unknown; conference?: unknown; achievements?: unknown;
  mlr_played?: unknown; mlrPlayed?: unknown; mlr_unconfirmed?: unknown; mlrUnconfirmed?: unknown;
  mlr_no_appearance?: unknown; mlrNoAppearance?: unknown; mlr_not_yet?: unknown; mlrNotYet?: unknown;
  mlr_note?: unknown; mlrNote?: unknown;
};

function remoteText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value !== '' ? value : fallback;
}

/**
 * Coach name and email: when the row has the column, the table is the answer, even blank or null.
 * Clearing a departed coach in Supabase must not bring the bundled copy back.
 */
export function remoteCoachField(row: Record<string, unknown>, snake: string, camel: string, fallback: string): string {
  const key = snake in row ? snake : camel in row ? camel : null;
  if (key === null) return fallback;
  const value = row[key];
  return typeof value === 'string' ? value.trim() : '';
}

function remoteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function remoteNullableNumber(value: unknown, fallback: number | null): number | null {
  return typeof value === 'number' ? value : fallback;
}

function remoteStrings(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback;
}

/** Supabase wins when it has a value. The bundle fills anything the row leaves blank. */
export function preferBundledMlr(remote: RemoteCollege, local: College | undefined) {
  const draftFallback = typeof remote.draftPicks === 'number' ? remote.draftPicks : (local?.draftPicks ?? 0);
  const mlrNote = remoteText(remote.mlr_note ?? remote.mlrNote, local?.mlrNote ?? '');
  return {
    draftPicks: remoteNumber(remote.draft_picks, draftFallback),
    mlrPlayed: remoteNullableNumber(remote.mlr_played ?? remote.mlrPlayed, local?.mlrPlayed ?? null),
    mlrUnconfirmed: remoteNumber(remote.mlr_unconfirmed ?? remote.mlrUnconfirmed, local?.mlrUnconfirmed ?? 0),
    mlrNoAppearance: remoteNumber(remote.mlr_no_appearance ?? remote.mlrNoAppearance, local?.mlrNoAppearance ?? 0),
    mlrNotYet: remoteNumber(remote.mlr_not_yet ?? remote.mlrNotYet, local?.mlrNotYet ?? 0),
    ...(mlrNote ? { mlrNote } : {}),
    badges: remoteStrings(remote.badges, local?.badges ?? []),
    achievements: remoteStrings(remote.achievements, local?.achievements ?? []),
    affiliation: remoteText(remote.affiliation, local?.affiliation ?? ''),
    conference: remoteText(remote.conference, local?.conference ?? ''),
    description: remoteText(remote.description, local?.description ?? ''),
  };
}

/** Merges live rows over the bundle. Bundled programs missing from the table are kept at the end. */
export function mergeRemote(live: Record<string, unknown>[]): College[] {
  const seen = new Set<string>();
  const mapped = live.map((r: Record<string, unknown>) => {
    const slug = r.slug as string;
    seen.add(slug);
    const local = bundledBySlug.get(slug);
    const remoteTemps = r.monthly_temps ?? r.monthlyTemps;
    const temps = Array.isArray(remoteTemps) && remoteTemps.length === 12
      ? remoteTemps
      : (local?.monthlyTemps ?? []);
    const remoteId = typeof r.id === 'number' ? r.id : Number(r.id);

    return {
      ...r,
      id: Number.isFinite(remoteId) ? remoteId : local?.id,
      popularMajors: r.popular_majors ?? r.popularMajors ?? local?.popularMajors ?? [],
      monthlyTemps: temps,
      weatherSummary: temps.length === 12
        ? remoteText(r.weather_summary ?? r.weatherSummary, local?.weatherSummary ?? '')
        : (local?.weatherSummary ?? ''),
      coachName: remoteCoachField(r, 'coach_name', 'coachName', local?.coachName ?? ''),
      coachEmail: remoteCoachField(r, 'coach_email', 'coachEmail', local?.coachEmail ?? ''),
      ...preferBundledMlr(r, local),
      playerCount: local ? local.playerCount : (r.player_count ?? r.playerCount ?? 0),
      playerCountNote: local?.playerCountNote,
      season: local?.season,
      clubContactName: local?.clubContactName,
      clubContactEmail: local?.clubContactEmail,
      contactNote: local?.contactNote,
      tier: remoteText(r.tier, local?.tier ?? 'emerging'),
      programType: typeof (r.program_type ?? r.programType) === 'string'
        ? (r.program_type ?? r.programType)
        : (local?.programType ?? 'Club'),
      rugbyProgramUrl: local ? local.rugbyProgramUrl : remoteText(r.rugby_program_url ?? r.rugbyProgramUrl, ''),
      recruitmentFormUrl: remoteText(r.recruitment_form_url ?? r.recruitmentFormUrl, local?.recruitmentFormUrl ?? ''),
      assistantCoaches: r.assistant_coaches ?? r.assistantCoaches ?? local?.assistantCoaches ?? [],
      imageUrl: remoteText(r.image_url ?? r.imageUrl, local?.imageUrl ?? ''),
      imageCredit: remoteText(r.image_credit ?? r.imageCredit, local?.imageCredit ?? ''),
      imageSourcePage: remoteText(r.image_source_page ?? r.imageSourcePage, local?.imageSourcePage ?? ''),
      mapX: r.map_x ?? r.mapX,
      mapY: r.map_y ?? r.mapY,
    } as College;
  });
  const extras = bundled.filter((c) => !seen.has(c.slug));
  return [...mapped, ...extras];
}

/** One Supabase read per page load, shared by every page that asks. A failed read is retried on the next mount. */
let remote: Promise<College[] | null> | null = null;
let remoteResult: College[] | null = null;

export function loadRemoteColleges(): Promise<College[] | null> {
  const sb = getSupabase();
  if (!sb) return Promise.resolve(null);
  if (!remote) {
    remote = Promise.resolve(sb.from('colleges').select('*').order('name')).then(({ data: rows, error }) => {
      const live = rows ? dropRetired(rows as Record<string, unknown>[]) : [];
      if (error || live.length === 0) { remote = null; return null; }
      remoteResult = mergeRemote(live);
      return remoteResult;
    }, () => { remote = null; return null; });
  }
  return remote;
}

/** Test hook: forget the cached read. */
export function resetRemoteColleges() { remote = null; remoteResult = null; }

/**
 * Loads colleges from Supabase when configured; otherwise the bundled data.
 * Editing a row in the Supabase dashboard updates the live site on the next page load.
 * The database wins for the fields it stores. The bundle fills blanks and
 * covers a Supabase outage, except coach name and email: those are owned by the
 * table, so a blank there stays blank (see remoteCoachField).
 */
export function useColleges(): { colleges: College[]; source: 'supabase' | 'bundled' } {
  const [data, setData] = useState<College[]>(() => remoteResult ?? bundled);
  const [source, setSource] = useState<'supabase' | 'bundled'>(() => (remoteResult ? 'supabase' : 'bundled'));

  useEffect(() => {
    if (remoteResult) return;
    let cancelled = false;
    loadRemoteColleges().then((merged) => {
      if (cancelled || !merged) return;
      setData(merged);
      setSource('supabase');
    });
    return () => { cancelled = true; };
  }, []);

  return { colleges: sortColleges(data), source };
}
