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

/**
 * Loads colleges from Supabase when configured; otherwise the bundled data.
 * Editing a row in the Supabase dashboard updates the live site instantly.
 * The database wins for the fields it stores. The bundle fills blanks and
 * covers a Supabase outage.
 */
export function useColleges(): { colleges: College[]; source: 'supabase' | 'bundled' } {
  const [data, setData] = useState<College[]>(bundled);
  const [source, setSource] = useState<'supabase' | 'bundled'>('bundled');

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let cancelled = false;
    (async () => {
      const { data: rows, error } = await sb.from('colleges').select('*').order('name');
      const live = rows ? dropRetired(rows as Record<string, unknown>[]) : [];
      if (!cancelled && !error && live.length > 0) {
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
            coachName: remoteText(r.coach_name ?? r.coachName, local?.coachName ?? ''),
            coachEmail: remoteText(r.coach_email ?? r.coachEmail, local?.coachEmail ?? ''),
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
        setData([...mapped, ...extras]);
        setSource('supabase');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { colleges: sortColleges(data), source };
}
