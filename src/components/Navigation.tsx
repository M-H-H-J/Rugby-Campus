import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map' },
  { href: '/colleges', label: 'Colleges' },
  { href: '/learn', label: 'Learn' },
  { href: '/training', label: 'Training' },
  { href: '/about', label: 'About' },
];

export default function Navigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center" aria-label="Rugby Campus home">
            <img src="/logo.png" alt="Rugby Campus" className="h-9 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-[13px] font-medium transition-colors py-1 ${
                  isActive(item.href) ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-navy" />
                )}
              </Link>
            ))}
          </div>

          <button type="button" className="md:hidden text-ink w-11 h-11 -mr-2.5 flex items-center justify-center" onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <>
        <div className="md:hidden fixed inset-0 top-14 bg-ink/20" onClick={() => setOpen(false)} aria-hidden />
        <div id="mobile-menu" className="md:hidden relative bg-white border-t border-line">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-5 py-3 text-[14px] font-medium border-b border-line ${
                isActive(item.href) ? 'text-navy' : 'text-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        </>
      )}
    </nav>
  );
}
