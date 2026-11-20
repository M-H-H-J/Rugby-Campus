import { useCallback, useRef, useState } from 'react';

export type SaveState = 'idle' | 'busy' | 'done' | 'failed';

/** Runs a save and only reports 'done' when it returned true. Ignores double clicks while busy. */
export function useSaveState() {
  const [state, setState] = useState<SaveState>('idle');
  const busy = useRef(false);
  const run = useCallback(async (save: () => Promise<boolean>) => {
    if (busy.current) return false;
    busy.current = true;
    setState('busy');
    const ok = await save().catch(() => false);
    busy.current = false;
    setState(ok ? 'done' : 'failed');
    return ok;
  }, []);
  return { state, run };
}
