/** One line beside every form that takes an email. Opens /privacy in a new tab so a half-filled form isn't lost. */
export default function PrivacyNote({ dark = false, className = '', children = 'Used only for this. Never sold.' }: { dark?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <p className={`text-[12px] leading-relaxed ${dark ? 'text-white/70' : 'text-muted'} ${className}`.trim()}>
      {children}{' '}
      <a href="/privacy" target="_blank" rel="noopener" className={`underline underline-offset-2 ${dark ? 'hover:text-white' : 'hover:text-navy'}`}>
        Privacy
      </a>
    </p>
  );
}
