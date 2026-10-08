import { useState } from 'react';
import { CLIMATES, CONTROLS, DIVISIONS, MAJOR_FIELDS, REGIONS, RESIDENCIES, SETTINGS, SIZE_BANDS, STATE_CODES, type Filters } from '@/lib/search/filters';
import { filterLabel, stateName } from '@/lib/search/match';
import { CAMPUS_FEEL_LABEL, CLIMATE_HINT, CLIMATE_RANGE, SIZE_LABEL } from '@/lib/search/display';

type ListKey = 'regions' | 'control' | 'setting' | 'division' | 'size_band' | 'climate' | 'majors' | 'states';

const BUDGET_MIN = 20000;
const BUDGET_MAX = 100000;
const BUDGET_STEP = 5000;

function Chip({ on, children, onClick, title }: { on: boolean; children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} title={title}
      className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${on ? 'bg-white text-navy border-navy' : 'bg-white text-muted border-line hover:border-navy/40'}`}>
      {children}
    </button>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="text-[13px] font-medium text-ink mb-2">{title}{hint && <span className="font-normal text-muted"> · {hint}</span>}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function sameTiers(a: string[], b: string[]) {
  return a.length === b.length && b.every((t) => a.includes(t));
}

export default function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const presetOpen = filters.control.length > 0 || filters.division.length > 0 || (filters.religion != null && filters.religion !== 'any');
  const [more, setMore] = useState(presetOpen);
  const toggle = (key: ListKey, v: string) => {
    const cur = filters[key] as string[];
    onChange({ ...filters, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } as Filters);
  };
  const rawBudget = filters.max_cost_usd_per_year;
  const outside = rawBudget != null && (rawBudget < BUDGET_MIN || rawBudget > BUDGET_MAX);
  const sliderValue = rawBudget == null || rawBudget > BUDGET_MAX ? BUDGET_MAX : rawBudget < BUDGET_MIN ? BUDGET_MIN : rawBudget;
  const budgetLabel = rawBudget == null
    ? 'Any budget'
    : `Up to US$${rawBudget.toLocaleString('en-US')} a year, before scholarships`;
  const top = ['championship', 'playoff'];
  const solid = ['championship', 'playoff', 'competitive'];
  const level = filters.rugby_tier.length === 0 ? 'any'
    : sameTiers(filters.rugby_tier, top) ? 'top'
    : sameTiers(filters.rugby_tier, solid) ? 'solid'
    : 'custom';
  const religiousOn = filters.religion === 'religious' || filters.religion === 'catholic' || filters.religion === 'christian_other';

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted">These won't remove any colleges. They just move the best matches to the top and show how each one fits.</p>

      <div>
        <p className="text-[13px] font-medium text-ink mb-2">{budgetLabel}</p>
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={sliderValue}
          aria-label="Budget per year"
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange({ ...filters, max_cost_usd_per_year: n >= BUDGET_MAX ? null : n });
          }}
          className="w-full accent-navy"
        />
        <div className="flex justify-between text-[11px] text-faint">
          <span>US$20,000</span>
          <span>Any budget</span>
        </div>
        {outside && <p className="mt-1 text-[12px] text-muted">Parsed as US${rawBudget?.toLocaleString('en-US')}. That sits outside the slider, so it is left as is.</p>}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {RESIDENCIES.map((r) => (
            <Chip key={r} on={filters.residency === r} onClick={() => onChange({ ...filters, residency: filters.residency === r ? null : r })}>
              {({ in_state: 'US in-state', out_of_state: 'US out-of-state', international: "I'm international" } as Record<string, string>)[r]}
            </Chip>
          ))}
        </div>
        <p className="text-[12px] text-faint mt-2">No residency picked: we use the higher out-of-state price at public universities. Rugby recruits often get some aid. Ask the coach what's possible.</p>
      </div>

      <Group title="Where in the US" hint="Not sure? Leave it blank.">
        {REGIONS.map((r) => <Chip key={r} on={filters.regions.includes(r)} onClick={() => toggle('regions', r)}>{filterLabel.regions([r])}</Chip>)}
        {filters.states.map((s) => <Chip key={s} on onClick={() => toggle('states', s)}>{stateName(s)} ×</Chip>)}
        <select aria-label="Or pick states" value="" onChange={(e) => e.target.value && toggle('states', e.target.value)} className="bg-white border border-line rounded-md px-2 py-1 text-[12px] text-muted">
          <option value="">or pick states</option>
          {STATE_CODES.filter((s) => !filters.states.includes(s)).map((s) => <option key={s} value={s}>{stateName(s)}</option>)}
        </select>
      </Group>

      <Group title="What to study">
        {Object.entries(MAJOR_FIELDS).map(([k, v]) => <Chip key={k} on={filters.majors.includes(k)} onClick={() => toggle('majors', k)}>{v.label}</Chip>)}
      </Group>

      <Group title="Rugby level">
        <Chip on={level === 'top'} onClick={() => onChange({ ...filters, rugby_tier: level === 'top' ? [] : ['championship', 'playoff'] })}>Top level</Chip>
        <Chip on={level === 'solid'} onClick={() => onChange({ ...filters, rugby_tier: level === 'solid' ? [] : ['championship', 'playoff', 'competitive'] })}>Solid or better</Chip>
        <Chip on={level === 'any'} onClick={() => onChange({ ...filters, rugby_tier: [] })}>Just want to play</Chip>
        {level === 'custom' && <span className="text-[12px] text-muted self-center">Set from your sentence: {filterLabel.rugby_tier(filters.rugby_tier)}</span>}
      </Group>

      <Group title="Campus feel">
        {SETTINGS.map((c) => <Chip key={c} on={filters.setting.includes(c)} onClick={() => toggle('setting', c)}>{CAMPUS_FEEL_LABEL[c]}</Chip>)}
      </Group>

      <Group title="Size">
        {SIZE_BANDS.map((c) => <Chip key={c} on={filters.size_band.includes(c)} onClick={() => toggle('size_band', c)}>{SIZE_LABEL[c]}</Chip>)}
      </Group>

      <Group title="Winters">
        {CLIMATES.map((c) => (
          <Chip key={c} title={CLIMATE_HINT[c]} on={filters.climate.includes(c)} onClick={() => toggle('climate', c)}>
            {c === 'warm_winters' ? `Warm winters ${CLIMATE_RANGE[c]}` : c === 'cool_winters' ? `Cool ${CLIMATE_RANGE[c]}` : `Cold/snowy ${CLIMATE_RANGE[c]}`}
          </Chip>
        ))}
      </Group>
      <p className="text-[12px] text-faint -mt-2">We also flag colleges with very hot summers (95°F / 35°C or more).</p>

      <div className="border-t border-line pt-3">
        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="text-[13px] text-navy font-medium">
          {more ? 'Hide more' : 'More'}
        </button>
        {more && (
          <div className="mt-3 space-y-4">
            <Group title="Public or private">
              {CONTROLS.map((c) => <Chip key={c} on={filters.control.includes(c)} onClick={() => toggle('control', c)}>{filterLabel.control([c])}</Chip>)}
            </Group>
            <Group title="College sports division" hint="Doesn't affect rugby level">
              {DIVISIONS.map((c) => <Chip key={c} on={filters.division.includes(c)} onClick={() => toggle('division', c)}>{filterLabel.division([c])}</Chip>)}
            </Group>
            <Group title="Religion">
              <Chip on={!filters.religion || filters.religion === 'any'} onClick={() => onChange({ ...filters, religion: null })}>Doesn't matter</Chip>
              <Chip on={filters.religion === 'none_only'} onClick={() => onChange({ ...filters, religion: filters.religion === 'none_only' ? null : 'none_only' })}>Prefer a non-religious college</Chip>
              <Chip on={religiousOn} onClick={() => onChange({ ...filters, religion: religiousOn ? null : 'religious' })}>Prefer a religious college</Chip>
            </Group>
          </div>
        )}
      </div>
    </div>
  );
}
