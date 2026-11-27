import { useState } from 'react';
import { Check } from 'lucide-react';
import { submitContact } from '@/lib/supabase';
import { useSaveState } from '@/lib/useSaveState';
import SaveError from '@/components/SaveError';
import PrivacyNote from '@/components/PrivacyNote';

interface Props {
  type: 'placement' | 'coaching' | 'featured_program' | 'general';
  submitLabel?: string;
  messagePlaceholder?: string;
  dark?: boolean;
}

export default function ContactForm({ type, submitLabel = 'Send inquiry', messagePlaceholder = 'Tell me a bit about your situation', dark }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { state, run } = useSaveState();
  const busy = state === 'busy';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await run(() => submitContact({ name, email, type, message }));
  };

  const input = dark
    ? 'w-full px-4 py-3 rounded-md bg-white/10 border border-white/15 text-white text-[14px] outline-none placeholder:text-white/40 focus:border-white/40 transition-colors'
    : 'w-full px-4 py-3 rounded-md border border-line text-[14px] outline-none focus:border-navy transition-colors';

  if (state === 'done') {
    return (
      <p className={`inline-flex items-center gap-2 text-[14px] font-medium ${dark ? 'text-white' : 'text-navy'}`}>
        <Check size={16} className={dark ? 'text-gold' : ''} /> Got it. I'll reply personally, usually within a few days.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">
      <div className="grid sm:grid-cols-2 gap-3">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} maxLength={200} placeholder="Your name" className={input} />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={input} />
      </div>
      <textarea required maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={messagePlaceholder} rows={4} className={input} />
      {state === 'failed' && <SaveError dark={dark} />}
      <button type="submit" disabled={busy}
        className={`btn px-6 py-3 rounded-md text-[13px] font-bold disabled:opacity-60 ${dark ? 'bg-gold text-dark' : 'bg-navy text-white'}`}>
        {busy ? 'Sending…' : submitLabel}
      </button>
      <PrivacyNote dark={dark}>Used only to reply to you. Never sold.</PrivacyNote>
    </form>
  );
}
