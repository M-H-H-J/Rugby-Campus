/**
 * Markdown tables for guide content, shared by ArticlePage (React) and scripts/prerender.mjs (static HTML),
 * so visitors and crawlers get the same table. Format:
 *   | School | Tier |
 *   |---|---|
 *   | [Cal](/colleges/…) | 1 |
 * Cells use the same inline marks as paragraphs (links, **bold**, *italic*). A literal "|" can't go inside a cell.
 */
export interface MdTable { header: string[]; rows: string[][] }

const isRow = (l: string) => l.length > 2 && l.startsWith('|') && l.endsWith('|');
const isDivider = (l: string) => /^\|(\s*:?-{3,}:?\s*\|)+$/.test(l);
const cells = (l: string) => l.slice(1, -1).split('|').map((c) => c.trim());

export const startsTable = (lines: string[], i: number) =>
  isRow(lines[i]?.trim() ?? '') && isDivider(lines[i + 1]?.trim() ?? '');

/** Reads the table starting at lines[i]. `next` is the first line after it. Rows are padded or cut to the header's width. */
export function readTable(lines: string[], i: number): { table: MdTable; next: number } {
  const header = cells(lines[i].trim());
  const rows: string[][] = [];
  let j = i + 2;
  while (j < lines.length && isRow(lines[j].trim())) {
    const r = cells(lines[j].trim());
    rows.push(header.map((_, k) => r[k] ?? ''));
    j++;
  }
  return { table: { header, rows }, next: j };
}

/** Every table in a guide, for tests and the llms-full summary. */
export function tablesIn(content: string): MdTable[] {
  const lines = content.split('\n');
  const out: MdTable[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!startsTable(lines, i)) continue;
    const { table, next } = readTable(lines, i);
    out.push(table);
    i = next - 1;
  }
  return out;
}
