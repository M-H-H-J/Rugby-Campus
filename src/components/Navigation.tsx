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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const isActive = (href: string) => href === '/' ? location === '/' : location.startsWith(href);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-navy to-[#003b75] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xs">RC</span>
            </div>
            <span className="font-heading font-bold text-navy text-base tracking-tight">Rugby Campus</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'text-navy bg-navy/5' : 'text-gray-500 hover:text-navy hover:bg-gray-50'}`}>
                {item.label}
              </Link>
            ))}
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 pt-1 border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-2">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${isActive(item.href) ? 'text-navy bg-navy/5' : 'text-gray-500 hover:text-navy hover:bg-gray-50'}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
