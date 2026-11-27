export interface Article {
  id: number;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  publishedDate: string;
  /** Last real edit (ISO date). Drives the visible "Updated" line, JSON-LD dateModified and the sitemap lastmod. */
  updatedDate: string;
  readTime: string;
  content: string;
}

export const articles: Article[] = [
  {
    id: 1,
    slug: "best-rugby-colleges-usa",
    title: "Best Rugby Colleges in America for 2026–27",
    metaTitle: "Best Rugby Colleges in America (2026–27) | Rugby Campus",
    metaDescription: "The strongest US men's college rugby programs for 2026–27 across CRAA D1A and NCR D1: how the system works, how to choose, and what to ask.",
    excerpt: "The top programs in US men's college rugby for 2026–27: who's strong right now, how CRAA and NCR differ, what each costs, and how to pick a fit.",
    category: "College Guide",
    publishedDate: "2026-09-03",
    updatedDate: "2026-11-27",
    readTime: "10 min read",
    content: `
## The best men's college rugby programs in America, 2026–27

This guide is about **men's 15s**, not 7s, and not the women's game (women's programs aren't on Rugby Campus yet). NCR runs a lot of sevens; it's not uncommon to see a side struggle in 15s and be elite at 7s. If you want to play high-level 7s, ask coaches directly about their 7s program and schedule.

I went through the US college rugby pathway as a recruit from Australia, then later as a coach. This guide is opinionated where it needs to be.

**Short version:** the strongest programs right now include **Cal, Navy, Life, Saint Mary's, and Lindenwood**. At the top of NCR D1 are **St. Bonaventure and Brown**. Below that is a deep Tier 2 group (Queens, Walsh, Dartmouth, Wheeling and Kutztown in NCR D1), and a long tail of solid rugby environments where you can still get a proper season.

On Rugby Campus we group programs into Tier 1 to Tier 4 rather than ranking them 1 to 50, because rankings shift and no single list agrees. Goff Rugby Report, NCR, and CRAA all publish their own. Browse programs, with coach contacts, on the [colleges page](/colleges).

**Method note:** We label a program **Varsity** or **Club** from university athletics pages or a published varsity designation where possible. If the current designation is unclear, verify it with the school or coach rather than treating an old label as permanent.

### Every program at a glance

All 50 programs on Rugby Campus, by tier. Inside each tier the list is alphabetical: a tier is a group, not a ranking. Titles and results come from each program's profile.

| School | Body | Tier | Varsity or club | Titles and recent results | Cost per year, before aid |
| --- | --- | --- | --- | --- | --- |
| [Brown University](/colleges/brown-university) | NCR D1 | 1 | Club | 2024 NCR D1 National Champions; 2022 NCR D1 National Champions | ~$100k |
| [Life University](/colleges/life-university) | CRAA D1A | 1 | Varsity | 4× D1A National Champions; 2026 D1A Semifinalists | ~$28k |
| [Lindenwood University](/colleges/lindenwood-university) | CRAA D1A | 1 | Varsity | None listed | ~$45k |
| [Saint Mary's College of California](/colleges/saint-mary-s-college-of-california) | CRAA D1A | 1 | Club | 2024 D1A National Champions; 2026 D1A Semifinalists | ~$88k |
| [St. Bonaventure University](/colleges/st-bonaventure-university) | NCR D1 | 1 | Varsity | 2025 NCR D1 National Champions | ~$62k |
| [United States Military Academy (Army)](/colleges/united-states-military-academy-army) | CRAA D1A | 1 | Varsity | 2022 D1A National Champions | No tuition (service commitment) |
| [United States Naval Academy](/colleges/united-states-naval-academy) | CRAA D1A | 1 | Varsity | 2023 D1A National Champions; 2026 D1A Finalists | No tuition (service commitment) |
| [University of California, Berkeley](/colleges/university-of-california-berkeley) | CRAA D1A | 1 | Varsity | 2026 D1A National Champions; Back-to-Back Champions (2025 & 2026) | ~$55k in-state / ~$94k out-of-state |
| [Arkansas State University](/colleges/arkansas-state-university) | CRAA D1A | 2 | Club | None listed | ~$31k in-state / ~$39k out-of-state |
| [Brigham Young University](/colleges/brigham-young-university) | CRAA D1A | 2 | Club | None listed | ~$14k (tuition only) |
| [Dartmouth College](/colleges/dartmouth-college) | NCR D1 | 2 | Club | None listed | ~$98k |
| [Davenport University](/colleges/davenport-university) | CRAA D1A | 2 | Varsity | None listed | ~$52k |
| [Grand Canyon University](/colleges/grand-canyon-university) | CRAA D1A | 2 | Club | None listed | ~$34k |
| [Kutztown University](/colleges/kutztown-university) | NCR D1 | 2 | Club | None listed | ~$26k in-state / ~$31k out-of-state |
| [Mount St. Mary's University](/colleges/mount-st-mary-s-university) | CRAA D1A | 2 | Varsity | None listed | ~$68k |
| [Pennsylvania State University](/colleges/pennsylvania-state-university) | CRAA D1A | 2 | Varsity | None listed | ~$21k in-state / ~$45k out-of-state (tuition only) |
| [Queens University of Charlotte](/colleges/queens-university-of-charlotte) | NCR D1 | 2 | Varsity | 2025 NCR D1 Finalists; 2024 NCR D1 Finalists | ~$75k |
| [United States Air Force Academy](/colleges/united-states-air-force-academy) | CRAA D1A | 2 | Club | None listed | No tuition (service commitment) |
| [University of Arizona](/colleges/university-of-arizona) | CRAA D1A | 2 | Club | None listed | ~$37k in-state / ~$68k out-of-state |
| [University of Mary Washington](/colleges/university-of-mary-washington) | CRAA D1A | 2 | Varsity | None listed | ~$30k in-state / ~$44k out-of-state |
| [Walsh University](/colleges/walsh-university) | NCR D1 | 2 | Varsity | 2023 NCR D1 Champions (as Notre Dame College) | ~$56k |
| [Wheeling University](/colleges/wheeling-university) | NCR D1 | 2 | Varsity | None listed | ~$45k |
| [Belmont Abbey College](/colleges/belmont-abbey-college) | NCR D1 | 3 | Varsity | None listed | ~$36k |
| [California Polytechnic State University](/colleges/california-polytechnic-state-university) | CRAA D1A | 3 | Club | None listed | ~$41k in-state / ~$64k out-of-state |
| [California State University, Long Beach](/colleges/california-state-university-long-beach) | CRAA D1A | 3 | Club | None listed | ~$34k in-state / ~$47k out-of-state |
| [Colorado State University](/colleges/colorado-state-university) | CRAA D1A | 3 | Club | None listed | ~$37k in-state / ~$61k out-of-state |
| [Fairfield University](/colleges/fairfield-university) | NCR D1 | 3 | Club | None listed | ~$83k |
| [Indiana Institute of Technology](/colleges/indiana-institute-of-technology) | NCR D1 | 3 | Varsity | None listed | ~$55k |
| [Indiana University](/colleges/indiana-university) | NCR D1 / CRAA dual | 3 | Club | None listed | ~$31k in-state / ~$63k out-of-state |
| [Marian University](/colleges/marian-university) | NCR D1 | 3 | Varsity | None listed | ~$58k |
| [Southern Nazarene University](/colleges/southern-nazarene-university) | NCR D1 | 3 | Varsity | None listed | ~$44k |
| [The Ohio State University](/colleges/the-ohio-state-university) | CRAA D1A | 3 | Club | 2024 Big Ten Universities champions | ~$34k in-state / ~$65k out-of-state |
| [University of California, Los Angeles (UCLA)](/colleges/university-of-california-los-angeles-ucla) | NCR D1 / CRAA dual | 3 | Club | None listed | ~$46k in-state / ~$85k out-of-state |
| [University of California, Santa Cruz](/colleges/university-of-california-santa-cruz) | CRAA D1A | 3 | Club | None listed | ~$44k in-state / ~$81k out-of-state |
| [University of Notre Dame](/colleges/university-of-notre-dame) | NCR D1 | 3 | Club | None listed | ~$92k |
| [Aquinas College](/colleges/aquinas-college) | NCR D1 | 4 | Varsity | None listed | ~$62k |
| [Fordham University](/colleges/fordham-university) | NCR D1 | 4 | Club | None listed | ~$102k |
| [McKendree University](/colleges/mckendree-university) | CRAA D1A | 4 | Varsity | None listed | ~$53k |
| [Santa Clara University](/colleges/santa-clara-university) | CRAA D1A | 4 | Club | None listed | ~$93k |
| [Siena College](/colleges/siena-college) | NCR D1 | 4 | Varsity | None listed | ~$73k |
| [Southern Virginia University](/colleges/southern-virginia-university) | CRAA D1A | 4 | Varsity | None listed | ~$36k |
| [St. Thomas University (Florida)](/colleges/st-thomas-university-florida) | CRAA D1A | 4 | Varsity | 2025 CRAA D1AA National Champions | ~$55k |
| [Thomas More University](/colleges/thomas-more-university) | NCR D1 | 4 | Varsity | None listed | ~$60k |
| [University of Colorado Boulder](/colleges/university-of-colorado-boulder) | CRAA D1A | 4 | Club | None listed | ~$35k in-state / ~$67k out-of-state |
| [University of Michigan](/colleges/university-of-michigan) | NCR D1 | 4 | Club | None listed | ~$40k in-state / ~$88k out-of-state |
| [University of Rio Grande](/colleges/university-of-rio-grande) | NCR D1 | 4 | Varsity | None listed | ~$13k in-state tuition only; ask the coach |
| [University of San Diego](/colleges/university-of-san-diego) | CRAA D1A | 4 | Club | None listed | ~$89k |
| [University of Utah](/colleges/university-of-utah) | CRAA D1A | 4 | Club | None listed | ~$46k in-state / ~$68k out-of-state |
| [Western Washington University](/colleges/western-washington-university) | CRAA D1A | 4 | Club | New to D1A for 2026–27 | ~$33k in-state / ~$52k out-of-state |
| [Wingate University](/colleges/wingate-university) | NCR D1 | 4 | Varsity | None listed | ~$66k |

Costs are the latest published yearly cost of attendance (tuition, fees, room, board and extras), rounded to the nearest $1,000, unless marked tuition only. Public universities show the in-state and out-of-state rate. Before scholarships. Ask the coach what's available.

## How college rugby is structured in the USA

American college rugby has two main governing bodies at the top level. Learning about both may influence your decision.

| Body | Main 15s championship | Latest champion | Programs on Rugby Campus |
| --- | --- | --- | --- |
| CRAA D1A | Spring | Cal (2026, beat Navy 36–22) | 28 |
| NCR D1 | Fall | St. Bonaventure (2025, beat Queens 55–19) | 20 |
| Listed under both | Fall and spring | See the two rows above | 2 |

**CRAA D1A** (College Rugby Association of America) runs a **spring** 15s championship playoff. In 2026, Cal beat Navy in the final in Indianapolis and went back-to-back. Western Washington won the 2025–26 D1AA title and moved up to D1A for 2026–27, and St. Thomas University (Florida), the 2025 D1AA champions, is in its second D1A season.

**NCR D1** (National Collegiate Rugby) runs a **fall** 15s championship. St. Bonaventure won the 2025 title over Queens. Walsh University inherited the Notre Dame College program that won the 2023 title; on this site it sits in Tier 2. For **2026–27, UCLA plays both NCR D1 and CRAA D1A**.

My view on strength: the very top of D1A is generally stronger than the top of NCR D1. The middle of both divisions is closer than people think. Which division develops players faster depends on the program and the coach, not the badge.

### Competition levels (15s)

**D1A**: highest CRAA level. Our Tier 1 here is Cal, Navy, Life, Lindenwood, Saint Mary's and Army. The championship is played in the spring.

**D1AA**: next tier down in the CRAA structure (people confuse this with NCR's naming). Rugby is still competitive: St. Thomas (2025) and Western Washington (2026) both won the CRAA D1AA title and then moved up to D1A. NCR runs its own D1AA as well, where Tennessee and Bowling Green have made deep playoff runs.

**NCR** also has its own Division 1 and lower divisions. Do not mix NCR D1 with CRAA D1A when you compare results.

**D2** covers a broad range of club-level programs. Rugby may be less intense; many sit at strong academic schools and offer a good balance of rugby and study.

Some schools compete under one body, some under both, and the landscape keeps evolving. UCLA playing both NCR D1 and CRAA D1A in 2026–27 is the clearest current example.

## Top CRAA D1A and NCR D1 programs

### UC Berkeley (Cal)

Cal is the most successful college rugby program in US history on 15s titles, including back-to-back CRAA D1A championships in 2025 and 2026. Berkeley admits about 11% of applicants (federal IPEDS data). You have to be admitted on academics, and the coach's interest opens the athlete track. It does not replace admission. Purpose-built venue at Witter Rugby Field; plays CRAA D1A as an independent.

### Life University

Life (Marietta, Georgia) runs rugby as a varsity sport and has won four D1A national titles (2013, 2016, 2018, 2019). Smaller, specialized campus (chiropractic / health sciences). Different feel from a big state school. If your priority is high-level development with a clear rugby focus, Life belongs on the shortlist.

### Saint Mary's and Lindenwood

After Cal and Life, **Saint Mary's College of California** and **Lindenwood** are the next names most people should study. Both compete at the top end of D1A year after year. Lindenwood runs rugby as a varsity sport; Saint Mary's has won four D1A national titles (2014, 2015, 2017, 2024).

### St. Bonaventure and Brown (NCR D1)

On the NCR side, **[St. Bonaventure](/colleges/st-bonaventure-university)** won the 2025 NCR D1 title, beating Queens 55–19 in the final, and runs rugby as a varsity sport. **[Brown](/colleges/brown-university)** won NCR D1 titles in 2022 and 2024, beating Queens 23–20 in the 2024 final. Brown is an Ivy League school where rugby is a club, and it admits about 5% of applicants, so academics come first.

### Military academies (Army / Navy): international caveat

Navy and Army are both in Tier 1 on the field. **You need U.S. citizenship to attend, apart from a small number of students nominated by their own government.** For almost every international player, that closes the door. Factor that in before you romanticize the jersey.

### Other strong D1A names worth exploring

Tier 2 on this site is deep. A few D1A programs worth a proper look:

- **[BYU](/colleges/brigham-young-university)** lists five national titles and won the Rocky Mountain Conference in 2025–26.
- **[Arizona](/colleges/university-of-arizona)** beat Grand Canyon in the 2026 playoffs before losing a quarterfinal at Saint Mary's.
- **[Davenport](/colleges/davenport-university)** won the 2026 D1A Challenger Cup and runs rugby as a varsity sport.
- **[Mount St. Mary's](/colleges/mount-st-mary-s-university)**, **[Penn State](/colleges/pennsylvania-state-university)** and **[Mary Washington](/colleges/university-of-mary-washington)** all reached the 2026 D1A playoffs from Rugby East.

Browse the [colleges list](/colleges) for the full set. Programs move in cycles (see [why rankings lie](/learn/why-college-rugby-rankings-lie)), so don't treat any short list as gospel.

## Best fit by what you want

| If you want | Start with | Why |
| --- | --- | --- |
| A national title shot | [Brown University](/colleges/brown-university), [Life University](/colleges/life-university), [Lindenwood University](/colleges/lindenwood-university), [Saint Mary's College of California](/colleges/saint-mary-s-college-of-california), [St. Bonaventure University](/colleges/st-bonaventure-university), [United States Military Academy (Army)](/colleges/united-states-military-academy-army), [United States Naval Academy](/colleges/united-states-naval-academy), [University of California, Berkeley](/colleges/university-of-california-berkeley) | Tier 1: the programs winning or contending for CRAA D1A and NCR D1 titles now. |
| Club rugby at a public university | [Arkansas State University](/colleges/arkansas-state-university), [California Polytechnic State University](/colleges/california-polytechnic-state-university), [California State University, Long Beach](/colleges/california-state-university-long-beach), [Colorado State University](/colleges/colorado-state-university), [Indiana University](/colleges/indiana-university), [Kutztown University](/colleges/kutztown-university), [The Ohio State University](/colleges/the-ohio-state-university), [University of Arizona](/colleges/university-of-arizona), [University of California, Los Angeles (UCLA)](/colleges/university-of-california-los-angeles-ucla), [University of California, Santa Cruz](/colleges/university-of-california-santa-cruz), [University of Colorado Boulder](/colleges/university-of-colorado-boulder), [University of Michigan](/colleges/university-of-michigan), [University of Utah](/colleges/university-of-utah), [Western Washington University](/colleges/western-washington-university) | Public universities where rugby is a club. Out-of-state and international students pay the higher rate. |
| US service academy | [United States Air Force Academy](/colleges/united-states-air-force-academy), [United States Military Academy (Army)](/colleges/united-states-military-academy-army), [United States Naval Academy](/colleges/united-states-naval-academy) | No tuition in return for military service. US citizens only, apart from a few students nominated by their own government. |

## Rugby scholarships: which programs are varsity

Common question from international players. Short answer: **it depends on the school**. Rugby Campus doesn't publish who pays what, because amounts change every year and only the coach can tell you. What we can tell you is where rugby sits.

Men's rugby isn't an NCAA sport anywhere (the NCAA lists varsity women's rugby as an Emerging Sport for Women), so the big NCAA athletic scholarships don't apply. Where rugby money exists, it's almost always at a **varsity** program, where rugby sits under the athletics department. Being varsity doesn't mean there's money for you; it means it's worth asking.

**Varsity programs on Rugby Campus (25):**

- **CRAA D1A:** [Davenport University](/colleges/davenport-university), [Life University](/colleges/life-university), [Lindenwood University](/colleges/lindenwood-university), [McKendree University](/colleges/mckendree-university), [Mount St. Mary's University](/colleges/mount-st-mary-s-university), [Pennsylvania State University](/colleges/pennsylvania-state-university), [Southern Virginia University](/colleges/southern-virginia-university), [St. Thomas University (Florida)](/colleges/st-thomas-university-florida), [United States Military Academy (Army)](/colleges/united-states-military-academy-army), [United States Naval Academy](/colleges/united-states-naval-academy), [University of California, Berkeley](/colleges/university-of-california-berkeley), [University of Mary Washington](/colleges/university-of-mary-washington)
- **NCR D1:** [Aquinas College](/colleges/aquinas-college), [Belmont Abbey College](/colleges/belmont-abbey-college), [Indiana Institute of Technology](/colleges/indiana-institute-of-technology), [Marian University](/colleges/marian-university), [Queens University of Charlotte](/colleges/queens-university-of-charlotte), [Siena College](/colleges/siena-college), [Southern Nazarene University](/colleges/southern-nazarene-university), [St. Bonaventure University](/colleges/st-bonaventure-university), [Thomas More University](/colleges/thomas-more-university), [University of Rio Grande](/colleges/university-of-rio-grande), [Walsh University](/colleges/walsh-university), [Wheeling University](/colleges/wheeling-university), [Wingate University](/colleges/wingate-university)

The service academies (Army and Navy above) charge no tuition in return for military service, so a rugby scholarship isn't how they work.

**Club programs (25)** run rugby as a student club, sometimes with paid coaches. Rugby money is unlikely, but academic aid still applies. Labels can change, so check the current one with the coach.

Most players who get help get it through academic aid. More in [Rugby scholarships explained](/learn/rugby-scholarships-explained).

## How hard is it to get in? Academic selectivity

A coach's interest helps, but at a selective school it doesn't replace admission. You still have to get in on your grades. Two signals are on every profile:

- **Admitted:** the share of applicants the university admitted (federal IPEDS data). Under about 20% means your grades carry the application, whatever the coach thinks.
- **SAT / ACT:** whether the school requires, accepts (optional) or ignores test scores. If it's optional, a good score can still help, including for academic aid.

The most selective schools on the site (under 35% admitted):

| School | Admitted | SAT / ACT | Tier |
| --- | --- | --- | --- |
| [Brown University](/colleges/brown-university) | 5% | Optional | 1 |
| [Dartmouth College](/colleges/dartmouth-college) | 5% | Optional | 2 |
| [University of California, Los Angeles (UCLA)](/colleges/university-of-california-los-angeles-ucla) | 9% | Not considered | 3 |
| [United States Naval Academy](/colleges/united-states-naval-academy) | 9% | Required | 1 |
| [University of California, Berkeley](/colleges/university-of-california-berkeley) | 11% | Not considered | 1 |
| [University of Notre Dame](/colleges/university-of-notre-dame) | 11% | Optional | 3 |
| [United States Military Academy (Army)](/colleges/united-states-military-academy-army) | 13% | Required | 1 |
| [United States Air Force Academy](/colleges/united-states-air-force-academy) | 14% | Check with the school | 2 |
| [University of Michigan](/colleges/university-of-michigan) | 16% | Optional | 4 |
| [California Polytechnic State University](/colleges/california-polytechnic-state-university) | 31% | Not considered | 3 |
| [Fairfield University](/colleges/fairfield-university) | 33% | Optional | 3 |

Most programs on the site admit more than half of applicants. That doesn't make the course easy; check that your major is offered and what the workload looks like.

## What it costs an international student

The table above shows US prices. If you're coming from overseas, read it this way:

- **Public universities:** you pay the **out-of-state** rate. In-state prices are only for residents of that state. At Cal, for example, that's about $94k a year, not $55k.
- **Private universities:** usually one price for everyone, international students included.
- **On top of that:** flights home, health insurance (most colleges require a plan), visa fees, and summers when you may stay in the US. Budget for them.
- **Proof of funds:** before a school issues the form you need for a student visa (the I-20), it will ask you to show you can pay for the first year, after any aid.
- **Service academies:** closed to almost every international player (see above).

This isn't visa advice. Confirm the numbers with each school's international admissions office, and ask the coach what aid is realistic.

## What should you consider when choosing a program?

**Willingness and fit.** Are you willing to put in the work for D1A, or would a less competitive D1AA / D2 environment suit you better for game time and balance?

**Academics.** You're going to college for a degree. Check majors and workload alongside rugby.

**Location and climate.** Playing in Southern California is a very different four years from Wisconsin. Think about the weather you'll live in.

**Cost and aid.** US tuition ranges widely (see the table above). Ask early about academic aid and any rugby-related support, without assuming either exists.

**Coach and culture.** Email the coach. Visit if you can. Visits are costly, and not everyone can; I didn't. The relationship with your coach and the team culture still matters more than the brochure.

## How to get started

1. **Explore programs.** Use the [interactive map](/map) and [college pages](/colleges).
2. **Contact coaches directly.** Short email: who you are, position, size, highlights, why them.
3. **Understand the application process.** US applications differ by country. Start early.
4. **Visit if possible.** Nothing replaces campus and team in person; cost is real.

Ready to look? Start with the [map](/map).

## Frequently asked questions

**What is the best rugby college in America?**
Best always changes. Teams rotate. Right now, **Cal** is the best men's 15s college rugby program in America: back-to-back CRAA D1A titles in 2025 and 2026. Navy, Life, Saint Mary's, and Lindenwood sit with them in the top conversation. In NCR D1, St. Bonaventure and Brown are the names at the top.

**Which US universities offer rugby scholarships?**
Athletic aid for rugby is rare and mostly at varsity programs, and amounts change every year, so Rugby Campus doesn't publish who pays what. 25 of the 50 programs on the site are varsity; they're listed above. Ask each coach what's available.

**How much does US college rugby cost for an international student?**
Use the out-of-state price at public universities; private universities usually charge everyone the same. Full yearly costs on Rugby Campus run from about $28k to over $100k before aid, plus flights, health insurance and visa fees. Ask the coach and the international office what aid is realistic.

**What is the difference between D1A and NCR D1?**
CRAA D1A runs a spring 15s national playoff; NCR D1 runs a fall 15s championship under a separate governing body. Top of D1A is generally stronger; the middle overlaps. Programs can compete under one or both. UCLA is doing both in 2026–27.

**Can international students play college rugby in the USA?**
Yes. Programs recruit from Australia, New Zealand, the UK, Ireland, South Africa, and other nations. You can email coaches directly. Most profiles list a head coach contact; where we couldn't confirm one, we say so. An agency is an option. I used one. If that's your path, use an agency **and** this site.

**How many college rugby programs are there in the USA?**
A commonly cited estimate is **roughly 900** college rugby programs, with **a few dozen** at the top level across CRAA D1A and NCR D1. Treat that as an estimate, **not a hard census**, drawn from figures often cited across college rugby media and governing-body coverage. The total shifts with how schools and teams are counted.

**How do I get recruited?**
Highlight reel, short profile (position, size, history), a short email to coaches. Not every coach will reply. Start with the [map](/map).
`.trim(),
  },
  {
    id: 2,
    slug: "why-college-rugby-rankings-lie",
    title: "Why College Rugby Rankings Lie (And What Actually Matters)",
    metaTitle: "Why College Rugby Rankings Lie | Rugby Campus",
    metaDescription: "College rugby rankings change constantly and lists disagree. Program cycles, retention, sevens, and what to ask instead of chasing a number.",
    excerpt: "Same school: strong side, then 1-7, then missed playoffs, then national champions. Rankings photograph last season. You're choosing the next four years.",
    category: "Straight Talk",
    publishedDate: "2026-06-20",
    updatedDate: "2026-06-20",
    readTime: "4 min read",
    content: `
## The same school, four completely different teams

Let me tell you about one college rugby program over a few seasons. In year one it fielded a genuinely strong side in a tough competition, going toe-to-toe with Army, Navy, and Penn State. Two years later that same program went 1-7 (and the one win probably should have been a loss). The year after that it improved but still missed the playoffs. The season after that it won a national championship.

**Key idea up front: programs move in cycles.** That is the piece most rankings miss.

That program was Notre Dame College. I went through the full cycle there. As a freshman I was under a very good senior group. I was injured (shoulder surgery), then COVID hit. By the time I was properly back I captained, but that senior group had gone and we were poor. My senior year was better, however, we still missed the playoffs. After I graduated I moved into the head coaching role. In 2023 we won the **NCR D1 National Championship**. We only lost one game that year, to Navy. A lot of that roster had been freshmen in the year we went 1–7. They stuck around, and by the time they were juniors they were all much better players.

If you had ranked that program from any single season, you would have drawn the wrong conclusion about the next twelve months. That is the problem with rankings.

## Nobody actually agrees on the rankings

There is no single authority. **Goff Rugby Report** publishes rankings. Read Goff; it is one of the best regular sources of college rugby news. **NCR** publishes power rankings. **CRAA** publishes rankings for its side of the sport too. They regularly disagree.

None of them is being dishonest. In a sport with limited crossover games between conferences, rankings are partly opinion. When a team in one conference and a team in another have played zero common opponents, ordering them is an educated guess.

So when you see #12 vs #15, hear "roughly similar, someone made a call," not "clearly better."

## Programs move in cycles: here's why

College rugby is not a professional club. The playing squad turns over on a roughly four-year rhythm (some players take longer to graduate, so study hard). That creates cycles coaching cannot fully erase.

**Retention is everything.** Freshmen who stay become valuable as juniors and seniors. Our championship group was built by people who suffered through the bad year and stayed. Some who left after a hard year thought they were upgrading, and as seniors elsewhere they lost a similar number of games.

**Recruiting classes are lumpy.** One strong intake can lift a program for years. One weak one hollows it out. When a senior class graduates, the ranking can fall off a cliff while coaching, culture, and facilities barely changed.

**Coaching changes reset the board, in either direction.** A new coach is not an automatic negative. I was a first-year head coach when we won. Ask what the new staff is building, not only who left.

Practical upshot: last season's ranking tells you little about *your* four years. You get their next cycle, not their last one.

**On calls, ask:** What was last year's freshman class like, and how happy are those players now as sophomores?

## The exceptions, and what they tell you

Some programs are often strong: Cal, Navy, Life, Saint Mary's, Lindenwood. Even dynasties have gaps. Cal went years between titles before the recent run.

**Strong names beyond the usual posters:** St. Bonaventure, Brown and Kutztown are consistently in the conversation in their competitions.

## Don't sleep on sevens

Rankings (and many recruit conversations) obsess over 15s. Sevens is huge in American college rugby: own windows, own nationals, Olympic pathway.

Ask the coach: **does this program do sevens?** Sevens calendars differ between NCR, CRAA and individual conferences, so ask how many sevens tournaments the team plays and when. A rough 15s year can still mean a serious 7s environment. If you are a quick back or a loose forward with an engine, sevens culture may matter more to your development than last fall's 15s rank.

## What to actually look at instead of rankings

**Trajectory, not snapshot.** A young 4-4 side can be a better bet than a 7-1 side graduating fifteen seniors.

**Retention.** Ask how many of last year's freshmen are still there, and whether they are happy.

**Sophomore / prior freshman quality.** Who came in last year; are they sticking and improving?

**Squad depth / B-sides.** Some colleges field more than one team. Ask. Game time on a B side still matters.

**Coach tenure.** Stability helps; a brand-new coach is not automatically a red flag. Ask what they are building.

**Your realistic playing time.** Be straight with yourself about where you are.

Rankings are a photograph of last season. You are choosing the next four years.
`.trim(),
  },
  {
    id: 3,
    slug: "when-college-rugby-programs-die",
    title: "When College Rugby Programs Die: What Recruits Should Learn",
    metaTitle: "When College Rugby Programs Die | Rugby Campus",
    metaDescription: "Notre Dame College closed, Central Washington cut varsity rugby, Quinnipiac women's went club. What that means for recruits, and how to protect yourself.",
    excerpt: "Three programs every rugby person knew closed, lost varsity status or moved to club in a short window. One of them was mine. Here's what happened, and how to protect yourself as a recruit.",
    category: "Straight Talk",
    publishedDate: "2026-06-25",
    updatedDate: "2026-11-27",
    readTime: "3 min read",
    content: `
## A program that reached the top, then the college closed

In late 2023 Notre Dame College's rugby program was at the sharp end of NCR D1. Within a year, Notre Dame College, a small college in South Euclid, Ohio, closed for financial reasons. Not a rugby cut. The whole institution.

The program that had climbed hard over a decade, shaped a lot of lives including mine, did not lose because of results on the field. The ground disappeared under it.

**Silver lining:** the program transferred to **Walsh University** in **North Canton, Ohio**. Many players and a lot of the culture carried across. Walsh is a legitimate NCR D1 side now. Find them on the [map](/map). If you had committed to NDC in late 2023 or early 2024, you learned the hard version of a real American higher-ed risk: small colleges can close, and rugby goes with them.

## Central Washington: varsity discontinued; club restart

Notre Dame College was not a one-off. Central Washington University discontinued its men's rugby as a funded/varsity pathway. In October 2025, CWU reported that returning players were helping clubs get off the ground again: [Returning CWU rugby players help clubs get off the ground this fall](https://www.cwu.edu/about/media-resources/news/2025/10/returning-cwu-rugby-players-help-clubs-get-off-the-ground-this-fall).

**Important clarity:** CWU is returning as a **club**, not as a varsity recruit target. The varsity path was discontinued; a historic rugby record or professional pipeline is not a reason to assume a varsity roster is available. Ask the club or university about current funding, competition, and eligibility before treating it as an option.

## Quinnipiac: varsity to club for 2026–27

Rugby Campus covers men's programs. Quinnipiac's was a **women's varsity** program, and it's here because the lesson applies to every recruit.

Quinnipiac women's rugby is moving from **varsity to club for 2026–27**. That is the primary status to plan around: a club restart or continuation is not the same recruiting pathway as a varsity program. Title IX litigation may still be active. Verify current university status before committing.

The broader lesson still holds: varsity status is not a forever guarantee, so ask where rugby sits structurally before committing.

## Why programs actually die

Almost never because of rugby results. Killers tend to be:

**The college itself is fragile.** Small private colleges in the US have been under heavy financial pressure: enrollment declines, post-COVID strain on small liberal arts and private campuses. If the institution is struggling, rugby success will not save you. See NDC.

**Rugby is usually not a revenue sport.** The gray area between athletics and clubs gets cut first when budgets tighten.

**Leadership changes.** A new AD or president who does not value rugby can end what the last one championed.

## How to protect yourself as a recruit

You cannot eliminate risk. You can manage it, especially at small private colleges:

**Check the institution's health, not just the rugby.** Enrollment growing or shrinking? News about budget cuts or "restructuring"? Ten minutes of searching helps. A brilliant rugby offer at a fragile college is a fragile offer.

**Ask where rugby sits structurally.** Varsity under athletics, funded club, or student organization? Varsity is not bulletproof, but it signals deeper commitment. We label Varsity / Club on profiles for that reason. Our labels come from university athletics pages or published varsity designations where possible; when the current status is unclear, verify it with the school or coach.

**Ask the coach the hard question.** "How secure is this program's funding for the next four years?" Honesty is useful. Defensiveness is information.

**Know that transfer is easier once you are inside the US college system.** If the worst happens, players often land on their feet. NDC's group largely moved to Walsh. You already know more about what you like. Disruptive, not fatal.

## The bigger picture

None of this should scare you off American college rugby. Programs get born as well as closed. New varsity and serious club projects launch; the women's game is expanding. The landscape moves in both directions: programs appear and disappear.

If you want to go to the US to play rugby, go to play rugby. You can transfer. Go in with your eyes open, ask uncomfortable questions, and use the map to see what still exists.
`.trim(),
  },
  {
    id: 4,
    slug: "how-to-play-rugby-college-usa",
    title: "How to Play Rugby in College in the USA",
    metaTitle: "How to Play Rugby in College in the USA | Rugby Campus",
    metaDescription: "Where to play rugby in America: CRAA, NCR, varsity vs club, and a clear path for domestic and international recruits. A pathway map, not a ranking.",
    excerpt: "A pathway map for playing college rugby in the USA: where the programs sit, how internationals and US high school players get in, and what to do first.",
    category: "Getting Started",
    publishedDate: "2026-09-30",
    updatedDate: "2026-11-27",
    readTime: "4 min read",
    content: `
## This is a pathway map, not a ranking

If you want to play rugby in college in the USA, you need a map of how the system works, not a list pretending one school is #1 forever. Written mainly for **17-year-olds overseas**, with a short section for US high school players too.

I went through the pathway as a recruit from Australia, then later as a coach. Use this with [Best rugby colleges](/learn/best-rugby-colleges-usa), [Why rankings lie](/learn/why-college-rugby-rankings-lie), and [How recruitment works](/learn/how-college-rugby-recruitment-works). Tools to shortlist and email coaches, not placement guarantees.

## Where to play rugby in America: the map

A commonly cited estimate is **roughly 900** college rugby programs. Treat that as an estimate, **not a hard census**. A few dozen sit at the top of the main national competitions. Rugby Campus curates about **50** of the stronger / more relevant ones so you can actually browse them.

Two main governing bodies at the top:

- **CRAA D1A**: spring 15s championship path.
- **NCR D1**: fall 15s championship path.
- Some schools sit lower or under both. For **2026–27, UCLA is doing both** (NCR D1 and CRAA D1A).

We do **not** publish a numbered ranking. Lists disagree: Goff, NCR, CRAA. See [why rankings lie](/learn/why-college-rugby-rankings-lie). “Where should I play” = fit (level, academics, cost, climate, coach, game time), not last week’s poll. Start on the [map](/map) and [colleges](/colleges); dig into [Best rugby colleges](/learn/best-rugby-colleges-usa) for who is strong right now.

**Military academy caveat:** Army and Navy are excellent on the field. **You need U.S. citizenship to attend, apart from a small number of students nominated by their own government.** Factor that in early.

## Domestic high school path (short)

If you are already in the US system:

- Shortlist programs that match your level and what you want academically.
- Email coaches with position, size, film, and why them. Do not wait to be “found.”
- Visit if you can. Apply to the university on its own timeline; rugby interest and admission are related but not the same process.
- Cold recruiting happens, but it is rare unless a coach has seen you at competition. Reach out anyway.

More on timing and emails: [How college rugby recruitment works](/learn/how-college-rugby-recruitment-works).

## International path: what to do in order

You will not get found sitting at home. Camps help some players; an agency can too (I used one). Direct email still works. Use an agency **and** this site if that is your path. Rugby Campus isn't against agencies.

1. **Know your level.** Top environment vs more game time; starter vs depth. That drives the shortlist.
2. **Shortlist 5–8** from the [map](/map) and [colleges](/colleges): level, location, majors, varsity/club.
3. **Academics is a separate track.** Rules differ by country and school. Start early. This is not visa/immigration advice. Confirm with each admissions / international office.
4. **Film + one-pager.** Position, size, recent level, highlights. Keep it short.
5. **Email coaches.** Off-season is better. Follow up once; don’t spam. See [recruitment](/learn/how-college-rugby-recruitment-works).
6. **Visit if you can.** Costly; not everyone can. I didn’t. Video calls still help.
7. **Institutional health check before you commit.** Small colleges can close; varsity is not forever. Read [When programs die](/learn/when-college-rugby-programs-die); ask the coach how secure the next four years look.

## Varsity vs club, CRAA vs NCR

Men’s college rugby is **not** an NCAA sport anywhere. Some programs are **varsity** under athletics; others are **club**. That matters for facilities, staff, funding, and often aid conversations, but varsity is not forever. See [When programs die](/learn/when-college-rugby-programs-die).

Top of **D1A** is generally stronger than top of **NCR D1**; the middle overlaps. Structure and current strong names: [Best rugby colleges](/learn/best-rugby-colleges-usa). This guide won’t duplicate that essay.

We label Varsity / Club from university athletics pages or published designation where possible. If a label looks stale, verify with the school or coach.

## Cost and aid (pointer only)

US college costs vary widely. Athletic aid for rugby is rare and mostly at varsity programs. Most players who get help get it through academic aid. We won't say who offers what until coaches confirm it. What to ask: [Rugby scholarships explained](/learn/rugby-scholarships-explained). Don't shortlist on money alone.

## Using Rugby Campus end-to-end

1. Browse the [map](/map) and filter on [colleges](/colleges).
2. Open profiles: competition body, varsity/club, location, any aid note if present.
3. Unlock / use the coach contact on the profile.
4. Send a short email (position, size, highlights, why them).
5. Read [How recruitment works](/learn/how-college-rugby-recruitment-works) before you spray-and-pray.

That is the self-serve path. Agencies are fine if you use one; this site still helps you check the rugby side of any recommendation.

## Frequently asked questions

**Where should I play rugby in America?**
Wherever the fit is real: competition level, academics, cost, climate, coach, and game time. Use the [map](/map) and [Best colleges](/learn/best-rugby-colleges-usa); ignore the idea that one poll decides your four years. See also [Why rankings lie](/learn/why-college-rugby-rankings-lie).

**Can international students play US college rugby?**
Yes. Programs recruit from Australia, New Zealand, the UK, Ireland, South Africa, and other nations. Email coaches directly. Army/Navy are generally closed to internationals. Agencies can help; I used one. Use an agency **and** this site if you want both.

**How many college rugby programs are there?**
Roughly **900** is a commonly cited estimate, not a hard census. A few dozen sit at the top across CRAA D1A and NCR D1. Rugby Campus focuses on about **50** curated programs.

**Do I need to be scouted?**
No. Cold recruiting is uncommon unless a coach has seen you. Take it into your own hands. Film + short email is enough to get a look.

**What should the first email say?**
Who you are, position, size, a highlights link, and why that program. Research the college. Off-season timing helps. Details: [How college rugby recruitment works](/learn/how-college-rugby-recruitment-works).
`,
  },
  {
    id: 5,
    slug: "rugby-scholarships-explained",
    title: "Rugby Scholarships in the USA: What's Actually Available",
    metaTitle: "Rugby Scholarships in the USA Explained | Rugby Campus",
    metaDescription: "Can you get a rugby scholarship in the USA? Athletic aid is rare and depends on the school. Here's how it works and what to ask the coach.",
    excerpt: "Athletic rugby aid is rare and different at every school. Most players lean on academic aid. Here's how it works and what to ask.",
    category: "Scholarships",
    publishedDate: "2026-09-30",
    updatedDate: "2026-11-27",
    readTime: "3 min read",
    content: `
## The short answer

Rugby scholarships in the US exist, but they're rare and every school does it differently.

Men's rugby isn't an NCAA sport anywhere (the NCAA lists varsity women's rugby as an Emerging Sport for Women), so the big NCAA athletic scholarships you hear about in football and basketball don't apply. A few varsity programs put some athletic money toward rugby. Many players who get help get it through academic aid instead.

There's no list that tells you who pays what. The only person who can answer that for a school is the coach. So ask.

## Varsity vs club

This is the biggest factor.

- **Varsity:** rugby sits under the athletics department. These are the schools most likely to have any rugby money.
- **Club:** run as a student club, sometimes with paid coaches. Rugby money is unlikely, but academic aid still applies.

Profiles say Varsity or Club when that's confirmed. Where it isn't, the page says not confirmed. Varsity status can change, so check it's current. See [When college rugby programs die](/learn/when-college-rugby-programs-die).

## Athletic aid vs academic aid

- **Athletic aid** comes from the rugby program. The coach decides who gets it and how much.
- **Academic aid** comes from the university, based on grades and test scores. For a lot of players this is the bigger number.
- **Other help:** campus jobs, housing deals, payment plans. Worth asking about.

| Aid type | Who decides | Where it's most likely | What to ask |
|---|---|---|---|
| Athletic (rugby) aid | The rugby coach | Varsity programs | Is there rugby aid here, how much, and for how many years? |
| Academic aid | The university's admissions or financial aid office | Any school, varsity or club | What academic aid could my grades and scores earn? |
| Other help | The university | Varies | Campus jobs, housing, payment plans? |

A good package is often a mix. Look at the total cost to attend, not just the rugby line.

## How to ask the coach

Don't open with money. Lead with who you are, your position, size and film. Once there's interest, ask straight:

- Is there athletic aid for rugby here, and how does it work?
- What academic aid could I qualify for?
- What's the full cost to attend after aid?
- Can you put any offer in writing?

If an offer is verbal only, it isn't an offer yet.

More on reaching out: [How college rugby recruitment works](/learn/how-college-rugby-recruitment-works).

## Internationals

Aid rules can be different for international students. Check with the coach and the school's international office. This isn't visa advice.

Army, Navy and Air Force are generally closed to international players.

## Agencies

Agencies can help you compare packages. I used one. You can also email coaches yourself. Doing both is fine.

## Don't pick on money alone

Money matters, but a good offer at the wrong level or a shaky school can go badly. Shortlist on fit first: level, academics, location, coach. Start on the [map](/map) or read [How to play rugby in college in the USA](/learn/how-to-play-rugby-college-usa).

## FAQ

**Can you get a rugby scholarship in the USA?**
Sometimes. It's rare and depends on the school. Ask the coach.

**Which schools offer rugby scholarships?**
Rugby Campus doesn't publish who pays what, because it changes every year. Rugby aid is most likely at varsity programs, and the [best rugby colleges guide](/learn/best-rugby-colleges-usa) lists every program that is varsity. Ask each coach directly.

**Do big state schools give rugby scholarships?**
Usually not for rugby, since most run it as a club. Academic aid is still on the table.

**Do I need an agency to get aid?**
No. An email with film is enough to start. An agency is fine if you want one.
`,
  },
  {
    id: 6,
    slug: "how-college-rugby-recruitment-works",
    title: "How College Rugby Recruitment Works",
    metaTitle: "How College Rugby Recruitment Works | Rugby Campus",
    metaDescription: "How colleges fill rugby rosters, a year-by-year timeline for when to email coaches (US and international), what to send, and why film gets you a look.",
    excerpt: "Colleges fill rosters through agencies, direct outreach, recruiting, and walk-ons. Here's when to reach out, year by year, and what to send. An email with film is enough to get a look.",
    category: "Recruitment",
    publishedDate: "2026-03-25",
    updatedDate: "2026-11-27",
    readTime: "6 min read",
    content: `
Colleges can fill their rugby rosters in a multitude of ways:
1. Through agencies that send them players who are interested.
2. From direct outreach from prospective rugby players who want to join the program.
3. By directly recruiting a player.
4. Walk-ons.

Direct outreach works. An email with film is enough to get a look. Agencies are optional; if you use one, use this site as well.

In season, coaches are flat out, so it's better to reach out during the offseason.

## US College Rugby

Men's rugby isn't an NCAA sport anywhere. Some universities/colleges are considered club teams while others are varsity sports. That matters hugely as it influences your scholarship, the facilities, the staff and the money going into the program. Additionally there are two competing College Rugby governing bodies: CRAA and NCR.

## When to contact college rugby coaches (timeline by year)

There's no NCAA recruiting calendar for men's rugby, so there's no date before which you're not allowed to email a coach. What matters is that the coach can plan for you, and that your university application is in on time. Eighteen months to two years before you'd start is a good time for the first email. Earlier is fine if you have film.

US players: junior year is the US 11th grade. International players: read "junior" as your second-last year of school and "senior" as your last. US college starts in August.

| When | What to do | What to send |
|---|---|---|
| Two years out (US sophomore) | Play as much as you can, 15s and 7s. Keep your grades up: they decide admission and academic aid. Film your games. | Nothing yet. Start a list of programs that fit. |
| Junior fall | Cut the list to 5–8. Check each profile for a recruitment form. Send your first emails. | Short email, highlight reel, position, height and weight, grades. |
| Junior spring | Follow up once with new film. Ask about admission and aid. Book the SAT or ACT if your schools want it (check each admissions page). Visit if you can. | Updated reel, a recent full match, your school transcript if asked. |
| Summer before senior year | Tournaments, camps and visits. International players: check whether your schools need an English test, and what they want from your school. | Results and new film to the coaches who replied. |
| Senior fall | Apply. Many US deadlines fall between November and January; check each one. Ask the coach whether they'll support your application. | Your application, plus a note to the coach once it's in. |
| Senior spring | Decisions arrive. Get any aid offer in writing and compare the full cost. International players: once you commit, the school issues your I-20 for the student visa. | Your decision, to every coach you spoke to. |

**Coaches' busy seasons differ.** NCR D1 plays its 15s championship in the fall and CRAA D1A its playoffs in the spring. Don't expect a long reply in the weeks around a coach's playoffs. Ask each coach when their quiet months are.

**Finishing school in November or December?** Common in Australia, New Zealand and South Africa. Most players start in the August after they finish, so run the timeline against that August, not against the US school year. I finished school in Australia and started at Notre Dame College that fall, at 17.

**Running late?** Not every roster is full by spring. Some coaches still have room in the summer, and walk-ons make teams every year. Email anyway.

## What to put in your first email to a rugby coach

Keep it short enough to read on a phone:

- **Subject line:** your name, position and country, and the college's name.
- **Who you are:** age, where you're from, your club or school, height and weight.
- **Why them:** one real reason. The level, the course, the coach. Not "your great program."
- **Film:** a highlight reel link, and say you can send full matches.
- **One question:** what they look for in your position, and whether they expect space on the roster in your year.

There's a copy-paste version on each college page that lists a coach email, once you've unlocked coach emails. Follow up once, then leave it.

## Highlight reel basics coaches actually watch

- **Best clips first.** A coach may only watch the first minute.
- **Show which player you are.** Say your jersey number at the start, or mark yourself in each clip.
- **Short.** A few minutes is plenty. Have full matches ready to send when asked.
- **Your position's work.** Carries and tackles for everyone, plus set piece for forwards and kicking and passing for backs.
- **Recent.** This season's film beats a great clip from two years ago.

## What to do

1. Shortlist the colleges that fit you.
2. Draft an email. Do your research about the college.
3. Email the head coach (and assistant coaches) if you have access to their emails.

Yes, you can apply to the university at the same time, but that won't move the needle. You typically want the coach vouching for you and they typically allocate resources to help you through the process.

If you're international it's unlikely you'll be found unless you attend a "recruiting camp". In the USA, you may get lucky and be recruited. However, don't base your college future on luck. Take it into your own hands.

## Frequently asked questions

**When should I email college rugby coaches?**
Eighteen months to two years before you'd start, which for US players is the fall of junior year. Earlier is fine if you have film. Avoid the weeks around a coach's playoffs, and follow up once.

**Do I need an agency to get recruited for college rugby?**
No. An email with film is enough to get a look. An agency is fine if you want one; I used one. Using an agency and this site together is fine too.

**How long should a rugby highlight video be?**
A few minutes, with your best clips first and your jersey number shown. Have full match film ready for coaches who ask.

**Can international players get recruited without visiting campus?**
Yes. I never visited before I committed. Video calls with the coach, and talking to current players, do most of what a visit does.

**Is it too late to get recruited in senior year?**
Not always. Some programs still have room in the spring and summer, and walk-ons make teams every year. Email anyway, and apply to the university on time.
`,
  },
];

/** "27 November 2026" from an ISO date, without time-zone drift. */
export function formatGuideDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}
