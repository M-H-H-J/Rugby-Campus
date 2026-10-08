import { useState, useEffect } from 'react';
import { colleges as bundled, College } from '@/data/colleges';
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

/** Bundle wins for MLR facts, the description, league labels, badges and honours (the repo is the source of truth for all of them). */
export function preferBundledMlr(
  remote: { badges?: unknown; description?: unknown; draft_picks?: unknown; draftPicks?: unknown; affiliation?: unknown; conference?: unknown; achievements?: unknown },
  local: College | undefined,
) {
  const remoteBadges = Array.isArray(remote.badges)
    ? remote.badges.filter((b): b is string => typeof b === 'string' && !/MLR/i.test(b))
    : null;
  // Badges and honours were fact-checked in the repo (Oct 2026): the bundle wins whenever it has the program.
  const badges = local ? local.badges : (remoteBadges ?? []);
  const achievements = local
    ? local.achievements
    : (Array.isArray(remote.achievements) ? remote.achievements.filter((a): a is string => typeof a === 'string') : []);
  const affiliation = local?.affiliation ?? (typeof remote.affiliation === 'string' ? remote.affiliation : '');
  const conference = local?.conference ?? (typeof remote.conference === 'string' ? remote.conference : '');
  // Descriptions were rewritten in the repo (Oct 2026, facts only). The repo wins whenever it has the program;
  // Supabase is only used for programs that aren't in the bundle.
  const remoteDesc = typeof remote.description === 'string' ? remote.description : '';
  const description = local?.description || remoteDesc || '';
  const remoteDraft = typeof remote.draft_picks === 'number' ? remote.draft_picks
    : typeof remote.draftPicks === 'number' ? remote.draftPicks : 0;
  return {
    draftPicks: local?.draftPicks ?? remoteDraft,
    mlrPlayed: local?.mlrPlayed ?? null,
    mlrUnconfirmed: local?.mlrUnconfirmed ?? 0,
    mlrNoAppearance: local?.mlrNoAppearance ?? 0,
    mlrNotYet: local?.mlrNotYet ?? 0,
    ...(local?.mlrNote ? { mlrNote: local.mlrNote } : {}),
    badges,
    achievements,
    affiliation,
    conference,
    description,
  };
}

/**
 * Loads colleges from Supabase when configured; otherwise the bundled data.
 * Editing a row in the Supabase dashboard updates the live site instantly.
 * 
 * Image fields (imageUrl, imageCredit, imageSourcePage) prefer bundled values
 * when bundled has local campus photos (/college-images/...) to avoid flicker
 * if Supabase still has stale Unsplash URLs.
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
          
          // Prefer bundled image fields when bundled has local campus photo
          const bundledHasLocalImage = local?.imageUrl?.startsWith('/college-images/') ?? false;
          const imageUrl = bundledHasLocalImage && local
            ? local.imageUrl
            : (r.image_url ?? r.imageUrl ?? local?.imageUrl ?? '');
          const imageCredit = bundledHasLocalImage && local
            ? (local.imageCredit ?? '')
            : (r.image_credit ?? r.imageCredit ?? local?.imageCredit ?? '');
          const imageSourcePage = bundledHasLocalImage && local
            ? (local.imageSourcePage ?? '')
            : (r.image_source_page ?? r.imageSourcePage ?? local?.imageSourcePage ?? '');

          return {
            ...r,
            id: local?.id ?? r.id,
            popularMajors: r.popular_majors ?? r.popularMajors ?? [],
            // Weather tables come from NOAA in the repo (Oct 2026). The repo wins when it has a full table.
            monthlyTemps: local?.monthlyTemps?.length === 12 ? local.monthlyTemps : (r.monthly_temps ?? r.monthlyTemps ?? []),
            weatherSummary: local?.monthlyTemps?.length === 12 ? local.weatherSummary : (r.weather_summary ?? r.weatherSummary ?? ''),
            coachName: r.coach_name ?? r.coachName ?? '',
            coachEmail: r.coach_email ?? r.coachEmail ?? '',
            ...preferBundledMlr(r, local),
            playerCount: r.player_count ?? r.playerCount ?? 0,
            tier: local?.tier ?? r.tier,
            programType: local?.programType ?? r.program_type ?? r.programType ?? 'Club',
            rugbyProgramUrl: r.rugby_program_url ?? r.rugbyProgramUrl ?? '',
            recruitmentFormUrl: local?.recruitmentFormUrl ?? '',
            assistantCoaches: r.assistant_coaches ?? r.assistantCoaches ?? [],
            imageUrl,
            imageCredit,
            imageSourcePage,
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

  return { colleges: data, source };
}
