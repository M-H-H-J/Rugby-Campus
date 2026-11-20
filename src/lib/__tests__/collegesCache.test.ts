import { describe, it, expect, vi, beforeEach } from 'vitest';

let reads = 0;
let reply: { data: Record<string, unknown>[] | null; error: { message: string } | null } = { data: [], error: null };
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ order: () => { reads++; return Promise.resolve(reply); } }) }),
  }),
}));

import { loadRemoteColleges, resetRemoteColleges } from '@/lib/useColleges';
import { colleges } from '@/data/colleges';

beforeEach(() => { reads = 0; resetRemoteColleges(); });

describe('bug hunt N3: the colleges table is read once per page load', () => {
  it('many pages asking share one read', async () => {
    reply = { data: [{ slug: 'brown-university', name: 'Brown University', coach_name: '', coach_email: null }], error: null };
    const [a, b] = await Promise.all([loadRemoteColleges(), loadRemoteColleges()]);
    await loadRemoteColleges();
    expect(reads).toBe(1);
    expect(a).toBe(b);
    const brown = a!.find((c) => c.slug === 'brown-university')!;
    expect(brown.coachName).toBe('');
    expect(brown.coachEmail).toBe('');
    expect(a!.length).toBe(colleges.length);
  });

  it('a failed read is retried next time instead of being cached', async () => {
    reply = { data: null, error: { message: 'down' } };
    expect(await loadRemoteColleges()).toBeNull();
    reply = { data: [{ slug: 'brown-university', name: 'Brown University' }], error: null };
    expect(await loadRemoteColleges()).not.toBeNull();
    expect(reads).toBe(2);
  });
});
