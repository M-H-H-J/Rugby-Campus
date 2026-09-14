import { useState } from 'react';
import { Check } from 'lucide-react';
import { submitContact } from '@/lib/supabase';

interface Props {
  type: 'placement' | 'coaching' | 'featured_program' | 'general';
  submitLabel?: string;
  messagePlaceholder?: string;
  dark?: boolean;
}

export default function ContactForm({ type, submitLabel = 'Send enquiry', messagePlaceholder = 'Tell me a bit about your situation', dark }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await submitContact({ name, email, type, message });
    setBusy(false);
    setDone(true);
  };

  const input = dark
    ? 'w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 text-white text-[14px] outline-none placeholder:text-white/40 focus:border-white/40 transition-colors'
    : 'w-full px-4 py-3 rounded-md border border-line text-[14px] outline-none focus:border-navy transition-colors';

  if (done) {
    return (
      <p className={`inline-flex items-center gap-2 text-[14px] font-medium ${dark ? 'text-white' : 'text-navy'}`}>
        <Check size={16} className={dark ? 'text-gold' : ''} /> Got it — I'll reply personally within two days.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">
      <div className="grid sm:grid-cols-2 gap-3">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={input} />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={input} />
      </div>
      <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder={messagePlaceholder} rows={4} className={input} />
      <button type="submit" disabled={busy}
        className={`btn px-6 py-3 rounded-md text-[13px] font-bold disabled:opacity-60 ${dark ? 'bg-gold text-dark' : 'bg-navy text-white'}`}>
        {busy ? 'Sending…' : submitLabel}
      </button>
    </form>
  );
}
