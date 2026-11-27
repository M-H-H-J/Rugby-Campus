import { Link } from 'wouter';
import { usePageMeta } from '@/lib/usePageMeta';
import { CONTACT_EMAIL } from '@/config';
import { formatGuideDate } from '@/data/articles';

export const PRIVACY_UPDATED = '2026-11-27';
export const PRIVACY_TITLE = 'Privacy Policy';
export const PRIVACY_DESCRIPTION = 'What Rugby Campus collects (emails you type into a form, and search wording without your name), why, who handles it, and how to have it deleted. No emails are ever sold.';

const H2 = 'font-heading text-[24px] text-ink mt-10 mb-3';
const P = 'font-heading text-[17.5px] text-ink/85 leading-[1.75] mb-4';
const A = 'text-navy font-medium underline decoration-navy/30 underline-offset-2 hover:decoration-navy';

export default function Privacy() {
  usePageMeta(PRIVACY_TITLE, PRIVACY_DESCRIPTION);
  const mail = <a href={`mailto:${CONTACT_EMAIL}`} className={A}>{CONTACT_EMAIL}</a>;
  const rows: [string, string][] = [
    ['New guides by email', 'Your email address, so I can send new guides and program updates. Only when there is something worth sending.'],
    ['Unlock coach emails', 'Your email address. It opens the coach emails on every college page, and you get one short welcome email.'],
    ['Training program', 'Your email address. It opens days two to four of the strength block, and you get one email with a link to the program.'],
    ['"Notify me" on a guide', 'Your email address, so I can tell you when that guide is published.'],
    ['Email me this shortlist', 'Your email address, the colleges you ticked, and your search wording with personal details removed, so the list can be emailed to you.'],
    ['Contact and coaching forms', 'What you type in: your name, email and message. The coaching form also asks for age, where you live, position and a WhatsApp number. Used only to reply to you.'],
    ['"How did you find us?" (optional)', 'Asked once, after a sign-up has already worked. The option you tap, and, if you pick AI assistant, anything you type about which AI you used and what you asked. Saved without your email, name or IP address, and emails, phone numbers and links are removed first. Used only to learn how players find the site.'],
  ];
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <header className="mb-8">
        <p className="kicker mb-3">Privacy</p>
        <h1 className="font-heading text-[36px] md:text-[46px] text-ink leading-[1.06] mb-5">Privacy, in plain English</h1>
        <p className="font-heading text-[19px] text-muted leading-[1.6]">
          Rugby Campus is free for players. I only collect what you type into a form, and I never sell or rent your email.
        </p>
        <p className="mt-5 text-[13px] text-muted">
          By <Link href="/about" className="text-ink font-medium hover:text-navy">Hugh Johnston</Link>
          {' · '}Updated <time dateTime={PRIVACY_UPDATED}>{formatGuideDate(PRIVACY_UPDATED)}</time>
        </p>
      </header>

      <hr className="border-line mb-8" />

      <section>
        <h2 className={H2}>What I collect, and why</h2>
        <p className={P}>Nothing is collected unless you fill in a form. Each form asks for the least it needs:</p>
        <dl className="border-t border-line mb-6">
          {rows.map(([k, v]) => (
            <div key={k} className="py-4 border-b border-line">
              <dt className="text-[14px] font-semibold text-ink mb-1">{k}</dt>
              <dd className="text-[15px] text-muted leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className={H2}>The college search</h2>
        <p className={P}>
          The words you type into the search box are saved without your name or email, to make the search better. Anything that looks like an email address,
          phone number or link is removed before it is saved. To turn your sentence into filters, it is sent to an AI model (currently Google Gemini). The model
          only fills in filters. It never sees your email.
        </p>
        <p className={P}>
          To stop abuse, the search sets an anonymous random cookie for 30 days and counts searches against a scrambled (hashed) version of your IP address.
          Neither is linked to your email. Please don't type personal details into the search box.
        </p>
      </section>

      <section>
        <h2 className={H2}>High-school students</h2>
        <p className={P}>
          A lot of people using this site are still at school, and many are under 18. You never need an account, and an email address is the only thing any
          unlock asks for. If you're under 13, please ask a parent or guardian to fill in forms for you. Parents can ask me to delete their child's details at any
          time, using the email below.
        </p>
      </section>

      <section>
        <h2 className={H2}>Who handles it</h2>
        <p className={P}>
          Your email is never sold, rented or passed to colleges, coaches, agencies or advertisers. A few services run the site for me: Supabase stores the form
          entries, Resend sends the emails, and Vercel hosts the site and counts page views without cookies. Your browser also remembers, on your own device,
          whether you've unlocked coach emails or the training days, and which colleges are on your shortlist.
        </p>
      </section>

      <section>
        <h2 className={H2}>Deleting your details</h2>
        <p className={P}>
          Email {mail} from the address you used, with "Delete my details" in the subject, or just reply to any email from Rugby Campus. I'll delete your email
          address and anything you sent through a form, and reply to confirm when it's done. Search wording has no name or email attached, so it can't be traced
          back to you.
        </p>
        <p className={P}>
          Questions about any of this go to the same address. If this page changes, the date at the top changes with it.
        </p>
      </section>
    </div>
  );
}
