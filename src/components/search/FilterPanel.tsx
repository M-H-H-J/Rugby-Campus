import { CLIMATES, CONTROLS, DIVISIONS, FOOTBALL_LEVELS, MAJOR_FIELDS, REGIONS, RELIGIONS, RESIDENCIES, RUGBY_TIERS, SETTINGS, SIZE_BANDS, STATE_CODES, type Filters } from '@/lib/search/filters';
import { filterLabel, stateName } from '@/lib/search/match';

type ListKey = 'regions' | 'control' | 'setting' | 'division' | 'size_band' | 'football_level' | 'climate' | 'rugby_tier' | 'majors' | 'states';

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`px-2.5 py-1 rounded-full text-[12px] border transition-colors ${on ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-line hover:border-navy/40'}`}>
      {children}
    </button>
  );
}
function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-caps text-faint mb-1.5">{title}{hint && <span className="normal-case tracking-normal font-normal"> · {hint}</span>}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export default function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const toggle = (key: ListKey, v: string) => {
    const cur = filters[key] as string[];
    onChange({ ...filters, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } as Filters);
  };
  const L = filterLabel;
  return (
    <div className="space-y-4 border border-line bg-white rounded-md p-4">
      <p className="text-[12px] text-muted"><span className="font-semibold text-ink">Must-haves</span> can remove colleges. <span className="font-semibold text-ink">Nice-to-haves</span> only re-order them. Anything we can't verify is kept and marked.</p>
      <p className="kicker">Must-haves</p>
      <Group title="Region">{REGIONS.map((r) => <Chip key={r} on={filters.regions.includes(r)} onClick={() => toggle('regions', r)}>{L.regions([r])}</Chip>)}</Group>
      <Group title="State">
        {filters.states.map((s) => <Chip key={s} on onClick={() => toggle('states', s)}>{stateName(s)} ×</Chip>)}
        <select aria-label="Add a state" value="" onChange={(e) => e.target.value && toggle('states', e.target.value)} className="bg-white border border-line rounded-md px-2 py-1 text-[12px] text-muted">
          <option value="">Add a state…</option>
          {STATE_CODES.filter((s) => !filters.states.includes(s)).map((s) => <option key={s} value={s}>{stateName(s)}</option>)}
        </select>
      </Group>
      <Group title="Public or private">{CONTROLS.map((c) => <Chip key={c} on={filters.control.includes(c)} onClick={() => toggle('control', c)}>{L.control([c])}</Chip>)}</Group>
      <Group title="Setting">{SETTINGS.map((c) => <Chip key={c} on={filters.setting.includes(c)} onClick={() => toggle('setting', c)}>{L.setting([c])}</Chip>)}</Group>
      <Group title="Division">{DIVISIONS.map((c) => <Chip key={c} on={filters.division.includes(c)} onClick={() => toggle('division', c)}>{L.division([c])}</Chip>)}</Group>
      <Group title="Size" hint="undergraduates">{SIZE_BANDS.map((c) => <Chip key={c} on={filters.size_band.includes(c)} onClick={() => toggle('size_band', c)}>{L.size_band([c])}</Chip>)}</Group>

      <p className="kicker pt-2">Nice-to-haves</p>
      <Group title="Climate" hint="winters from NOAA 1991-2020 averages">{CLIMATES.map((c) => <Chip key={c} on={filters.climate.includes(c)} onClick={() => toggle('climate', c)}>{L.climate([c])}</Chip>)}</Group>
      <Group title="Study" hint="broad fields">{Object.entries(MAJOR_FIELDS).map(([k, v]) => <Chip key={k} on={filters.majors.includes(k)} onClick={() => toggle('majors', k)}>{v.label}</Chip>)}</Group>
      <Group title="Rugby level">{RUGBY_TIERS.map((c) => <Chip key={c} on={filters.rugby_tier.includes(c)} onClick={() => toggle('rugby_tier', c)}>{L.rugby_tier([c])}</Chip>)}</Group>
      <Group title="Football">{FOOTBALL_LEVELS.map((c) => <Chip key={c} on={filters.football_level.includes(c)} onClick={() => toggle('football_level', c)}>{L.football_level([c])}</Chip>)}</Group>
      <Group title="Religion">
        {RELIGIONS.filter((r) => r !== 'any').map((r) => <Chip key={r} on={filters.religion === r} onClick={() => onChange({ ...filters, religion: filters.religion === r ? null : r })}>{({ none_only: 'Not religious', catholic: 'Catholic', christian_other: 'Other Christian' } as Record<string, string>)[r]}</Chip>)}
      </Group>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-caps text-faint mb-1.5">Budget per year <span className="normal-case tracking-normal font-normal">· before scholarships</span></p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">Up to $</span>
          <input inputMode="numeric" aria-label="Maximum cost per year in US dollars" value={filters.max_cost_usd_per_year ?? ''} placeholder="e.g. 60000"
            onChange={(e) => { const n = Number(e.target.value.replace(/[^0-9]/g, '')); onChange({ ...filters, max_cost_usd_per_year: n > 0 ? n : null }); }}
            className="w-28 bg-white border border-line rounded-md px-2 py-1 text-[13px] outline-none focus:border-navy" />
          {RESIDENCIES.map((r) => <Chip key={r} on={filters.residency === r} onClick={() => onChange({ ...filters, residency: filters.residency === r ? null : r })}>{({ in_state: 'US, in-state', out_of_state: 'US, out-of-state', international: "I'm international" } as Record<string, string>)[r]}</Chip>)}
        </div>
        <p className="text-[11px] text-faint mt-1">No residency picked: we use the higher out-of-state price at public universities. Rugby recruits usually get aid, so ask the coach what's available.</p>
      </div>
    </div>
  );
}
