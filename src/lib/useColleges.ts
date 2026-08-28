import { useState, useEffect } from 'react';
import { colleges as bundled, College } from '@/data/colleges';
import { getSupabase } from '@/lib/supabase';

/**
 * Loads colleges from Supabase when configured; otherwise the bundled data.
 * Editing a row in the Supabase dashboard updates the live site instantly.
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
      if (!cancelled && !error && rows && rows.length > 0) {
        setData(rows.map((r: Record<string, unknown>) => ({
          ...r,
          popularMajors: r.popular_majors ?? r.popularMajors ?? [],
          monthlyTemps: r.monthly_temps ?? r.monthlyTemps ?? [],
          weatherSummary: r.weather_summary ?? r.weatherSummary ?? '',
          coachName: r.coach_name ?? r.coachName ?? '',
          coachEmail: r.coach_email ?? r.coachEmail ?? '',
          draftPicks: r.draft_picks ?? r.draftPicks ?? 0,
          playerCount: r.player_count ?? r.playerCount ?? 0,
          programType: r.program_type ?? r.programType ?? 'Club',
          imageUrl: r.image_url ?? r.imageUrl ?? '',
          mapX: r.map_x ?? r.mapX, mapY: r.map_y ?? r.mapY,
        }) as College));
        setSource('supabase');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { colleges: data, source };
}
