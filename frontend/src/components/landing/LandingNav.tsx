'use client';

import { motion, useScroll } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Docs', href: '/docs' },
];

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useEffect(() => {
    return scrollY.on('change', (y) => setScrolled(y > 20));
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || pathname !== '/'
          ? 'border-b'
          : 'bg-transparent'
      }`}
      style={
        scrolled || pathname !== '/'
          ? {
              background: 'rgba(8,10,28,0.80)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderColor: 'rgba(100,255,218,0.08)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.4), 0 1px 0 rgba(100,255,218,0.06)',
            }
          : {}
      }
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-default">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-glow-sm"
            style={{
              background: 'linear-gradient(135deg, #64FFDA 0%, #A855F7 50%, #FF4500 100%)',
              boxShadow: '0 0 14px rgba(100,255,218,0.3)',
            }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="gradient-text">FlowSphere</span>
            <span style={{ color: '#F8FAFC' }}> AI</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  color: isActive ? '#F8FAFC' : 'rgba(248,250,252,0.5)',
                  background: isActive ? 'rgba(100,255,218,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(100,255,218,0.15)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#F8FAFC';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,250,252,0.5)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: 'rgba(248,250,252,0.5)', fontFamily: 'Outfit, sans-serif' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#F8FAFC')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,250,252,0.5)')}
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="btn-glow rounded-xl px-5 py-2 text-sm font-bold text-white"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden rounded-lg p-2 transition-colors"
          style={{ color: 'rgba(248,250,252,0.5)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#64FFDA')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,250,252,0.5)')}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden px-6 pb-6 pt-4 border-t"
          style={{
            background: 'rgba(8,10,28,0.95)',
            backdropFilter: 'blur(24px)',
            borderColor: 'rgba(100,255,218,0.08)',
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium border-b last:border-0 transition-colors"
                style={{
                  color: isActive ? '#64FFDA' : 'rgba(248,250,252,0.5)',
                  borderColor: 'rgba(100,255,218,0.06)',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="text-center py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{
                color: 'rgba(248,250,252,0.5)',
                border: '1px solid rgba(100,255,218,0.12)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="btn-glow text-center py-2.5 text-sm font-bold text-white rounded-xl"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
