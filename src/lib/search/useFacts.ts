import { useEffect, useState } from 'react';
import { loadFacts, getFactsSync, type CollegeFacts } from './facts';

export function useFacts(): Record<string, CollegeFacts> | null {
  const [facts, setFacts] = useState<Record<string, CollegeFacts> | null>(() => getFactsSync()?.colleges ?? null);
  useEffect(() => {
    let off = false;
    if (!facts) loadFacts().then((f) => { if (!off) setFacts(f.colleges); }).catch(() => undefined);
    return () => { off = true; };
  }, [facts]);
  return facts;
}
