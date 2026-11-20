import { CONTACT_EMAIL } from '@/config';

export default function SaveError({ dark, className = '' }: { dark?: boolean; className?: string }) {
  return (
    <p role="alert" className={`text-[13px] ${dark ? 'text-white' : 'text-terra'} ${className}`}>
      That didn't go through. Please try again, or email{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">{CONTACT_EMAIL}</a> directly.
    </p>
  );
}
