import { useState } from 'react';
import { AFFORDABLE_MAX_USD, CLIMATES, CONTROLS, DIVISIONS, MAJOR_FIELDS, REGIONS, RESIDENCIES, SELECTIVE_MAX_ADMIT_RATE, SETTINGS, SIZE_BANDS, STATE_CODES, type Filters } from '@/lib/search/filters';
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
  const affordable = rawBudget == null && filters.budget === 'affordable';
  const outside = rawBudget != null && (rawBudget < BUDGET_MIN || rawBudget > BUDGET_MAX);
  const sliderValue = affordable ? AFFORDABLE_MAX_USD : rawBudget == null || rawBudget > BUDGET_MAX ? BUDGET_MAX : rawBudget < BUDGET_MIN ? BUDGET_MIN : rawBudget;
  const budgetLabel = affordable
    ? `Affordable: up to US$${AFFORDABLE_MAX_USD.toLocaleString('en-US')} a year, before scholarships`
    : rawBudget == null
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
            onChange({ ...filters, budget: null, max_cost_usd_per_year: n >= BUDGET_MAX ? null : n });
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
            <Chip key={r} on={filters.residency === r} onClick={() => {
              const next = filters.residency === r ? null : r;
              onChange({ ...filters, residency: next, home_state: next === 'in_state' ? filters.home_state : null });
            }}>
              {({ in_state: 'US in-state', out_of_state: 'US out-of-state', international: "I'm international" } as Record<string, string>)[r]}
            </Chip>
          ))}
          {filters.residency === 'in_state' && (
            <select aria-label="Your home state" value={filters.home_state ?? ''} onChange={(e) => onChange({ ...filters, home_state: (e.target.value || null) as Filters['home_state'] })}
              className="bg-white border border-line rounded-md px-2 py-1.5 text-[16px] sm:text-[12px] text-muted">
              <option value="">Which state do you live in?</option>
              {STATE_CODES.map((s) => <option key={s} value={s}>{stateName(s)}</option>)}
            </select>
          )}
        </div>
        {filters.residency === 'in_state' && !filters.home_state && (
          <p className="text-[12px] text-muted mt-2">Pick your state. The in-state price only applies to public universities in that state; everywhere else we show out-of-state.</p>
        )}
        <p className="text-[12px] text-faint mt-2">{filters.residency == null && 'No residency picked: we use the higher out-of-state price at public universities. '}Rugby aid varies by school and is often limited or none, so ask the coach what's available.</p>
      </div>

      <Group title="Where in the US" hint="Not sure? Leave it blank.">
        {REGIONS.map((r) => <Chip key={r} on={filters.regions.includes(r)} onClick={() => toggle('regions', r)}>{filterLabel.regions([r])}</Chip>)}
        {filters.states.map((s) => <Chip key={s} on onClick={() => toggle('states', s)}>{stateName(s)} ×</Chip>)}
        <select aria-label="Or pick states" value="" onChange={(e) => e.target.value && toggle('states', e.target.value)} className="bg-white border border-line rounded-md px-2 py-1.5 text-[16px] sm:text-[12px] text-muted">
          <option value="">or pick states</option>
          {STATE_CODES.filter((s) => !filters.states.includes(s)).map((s) => <option key={s} value={s}>{stateName(s)}</option>)}
        </select>
      </Group>

      <Group title="What to study">
        {Object.entries(MAJOR_FIELDS).map(([k, v]) => <Chip key={k} on={filters.majors.includes(k)} onClick={() => toggle('majors', k)}>{v.label}</Chip>)}
      </Group>

      <Group title="Academics" hint="Based on the share of applicants admitted">
        <Chip on={filters.academics === 'strong'} onClick={() => onChange({ ...filters, academics: filters.academics === 'strong' ? null : 'strong' })}>
          Strong academics (admits {SELECTIVE_MAX_ADMIT_RATE}% or fewer)
        </Chip>
      </Group>

      <Group title="Rugby level" hint="Tier 1 is the strongest">
        <Chip on={level === 'top'} onClick={() => onChange({ ...filters, rugby_tier: level === 'top' ? [] : ['championship', 'playoff'] })}>Tier 1–2</Chip>
        <Chip on={level === 'solid'} onClick={() => onChange({ ...filters, rugby_tier: level === 'solid' ? [] : ['championship', 'playoff', 'competitive'] })}>Tier 1–3</Chip>
        <Chip on={level === 'any'} onClick={() => onChange({ ...filters, rugby_tier: [] })}>Any tier</Chip>
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
            {c === 'warm_winters' ? `Mild winters ${CLIMATE_RANGE[c]}` : c === 'cool_winters' ? `Cool ${CLIMATE_RANGE[c]}` : `Cold/snowy ${CLIMATE_RANGE[c]}`}
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
