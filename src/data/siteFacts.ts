import { TIER_LABELS, TIER_ORDER, TIER_SUBLINE } from '@/data/colleges';

export interface GuideTakeaway {
  topic: string;
  text: string;
  /** The guide to cite for this point. */
  path: string;
}

/** Key takeaways from the guides, written into public/llms.txt (a test checks it matches) and llms-full.txt.
 *  Each line restates what the linked guide says; never add a claim the guide doesn't make. */
export const GUIDE_TAKEAWAYS: readonly GuideTakeaway[] = [
  {
    topic: 'Tiers',
    text: `Programs are grouped into Tier 1 (strongest) to Tier 4, never ranked 1 to 50, because rankings change weekly and published lists disagree. ${TIER_ORDER.map((t) => `${TIER_LABELS[t]}: ${TIER_SUBLINE[t].replace(/\.$/, '').toLowerCase()}`).join('. ')}.`,
    path: '/learn/best-rugby-colleges-usa',
  },
  {
    topic: 'CRAA D1A vs NCR D1',
    text: "Two separate governing bodies run the top of men's college rugby. CRAA D1A plays its 15s national championship in the spring; NCR D1 plays its 15s championship in the fall. The very top of D1A is generally stronger than the top of NCR D1; the middle of both overlaps. A program can compete under one or both (UCLA plays both in 2026–27).",
    path: '/learn/how-to-play-rugby-college-usa',
  },
  {
    topic: 'Varsity vs club',
    text: "Men's rugby is not an NCAA sport anywhere. Some programs are varsity (under the athletics department), others are clubs. Varsity status affects facilities, staff, funding and aid, and it can change, so check it is current.",
    path: '/learn/when-college-rugby-programs-die',
  },
  {
    topic: 'Recruitment timeline',
    text: "There is no NCAA recruiting calendar for men's rugby. Send the first email to coaches eighteen months to two years before starting (the fall of junior year for US players), with a short note, a highlight reel, position, height and weight. Follow up once. Many US application deadlines fall between November and January; US college starts in August. Avoid the weeks around a coach's playoffs.",
    path: '/learn/how-college-rugby-recruitment-works',
  },
  {
    topic: 'Scholarships',
    text: "Rugby scholarships exist but are rare, and every school does it differently. Athletic aid, where it exists, is most likely at varsity programs; many players get help through academic aid instead. Rugby Campus does not publish who pays what: ask the coach, compare the full cost to attend, and get any offer in writing.",
    path: '/learn/rugby-scholarships-explained',
  },
  {
    topic: 'Getting seen',
    text: 'Players do not need to be scouted. A short email with film is enough to get a look. Agencies are optional; using one alongside this site is fine.',
    path: '/learn/how-college-rugby-recruitment-works',
  },
];

/** Verified facts stated on /ai-info and in llms-full.txt (one list, so the two never disagree). See AGENTS.md "Data rules". */
export const KEY_FACTS: readonly string[] = [
  "Men's rugby is not an NCAA sport anywhere. The NCAA lists varsity women's rugby as an Emerging Sport for Women.",
  'Cal won the 2026 CRAA D1A National Championship (back-to-back, 2025 and 2026), beating Navy 36–22.',
  'St. Bonaventure won the 2025 NCR D1 National Championship over Queens.',
  "Central Washington ended varsity men's and women's rugby in April 2025 (effective at the end of 2024–25); a student-run men's club restarted in fall 2025.",
  'Notre Dame College closed; its program (2023 NCR D1 champions) transferred to Walsh University.',
  'UCLA plays both CRAA D1A and NCR D1 for 2026–27.',
  'Major League Rugby contracted to 6 teams for 2026; the MLR College Draft continues.',
];
