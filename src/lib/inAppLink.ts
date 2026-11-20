/** The site path to route to in-app, or null to let the browser handle the click (external, new tab, modifier keys). */
export function inAppPath(href: string | null, opts: { target?: string; button?: number; modifier?: boolean } = {}): string | null {
  if (!href || opts.target || opts.modifier || (opts.button ?? 0) !== 0) return null;
  if (!href.startsWith('/') || href.startsWith('//')) return null;
  return href;
}

/** Click handler for HTML we inject (guide text): same-site links navigate in-app instead of reloading the page. */
export function routeInAppClicks(navigate: (to: string) => void) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented) return;
    const a = (e.target as HTMLElement).closest?.('a');
    const path = inAppPath(a?.getAttribute('href') ?? null, { target: a?.getAttribute('target') ?? undefined, button: e.button, modifier: e.metaKey || e.ctrlKey || e.shiftKey || e.altKey });
    if (!path) return;
    e.preventDefault();
    navigate(path);
  };
}
