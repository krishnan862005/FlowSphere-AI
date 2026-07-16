'use client';

import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin, Youtube } from 'lucide-react';

const LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Status'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Developers: ['Documentation', 'API Reference', 'SDK', 'GitHub', 'Community'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
};

export function LandingFooter() {
  return (
    <footer
      style={{
        background: 'rgba(8,10,28,0.95)',
        borderTop: '1px solid rgba(100,255,218,0.06)',
      }}
    >
      {/* Tri-color top divider */}
      <div
        className="h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(100,255,218,0.4), rgba(168,85,247,0.4), rgba(255,69,0,0.35), transparent)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4 cursor-default">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #64FFDA 0%, #A855F7 50%, #FF4500 100%)',
                  boxShadow: '0 0 14px rgba(100,255,218,0.25)',
                }}
              >
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="gradient-text">FlowSphere</span>
                <span style={{ color: '#F8FAFC' }}> AI</span>
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: 'rgba(248,250,252,0.4)', fontFamily: 'Outfit, sans-serif' }}
            >
              The next-generation AI-powered workflow automation platform. Design, automate, and scale — without limits.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: 'https://twitter.com/flowsphereai', color: '#38BDF8' },
                { icon: Github, href: 'https://github.com/flowsphere-ai', color: '#64FFDA' },
                { icon: Linkedin, href: 'https://linkedin.com/company/flowsphere-ai', color: '#A855F7' },
                { icon: Youtube, href: 'https://youtube.com/@flowsphereai', color: '#FF6B35' },
              ].map(({ icon: Icon, href, color }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(248,250,252,0.4)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = color;
                    (e.currentTarget as HTMLAnchorElement).style.background = `${color}12`;
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}30`;
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 14px ${color}20`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,250,252,0.4)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-sm font-bold mb-4"
                style={{ color: '#F8FAFC', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em' }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'rgba(248,250,252,0.4)', fontFamily: 'Outfit, sans-serif' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#64FFDA')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(248,250,252,0.4)')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(100,255,218,0.06)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.3)', fontFamily: 'Outfit, sans-serif' }}>
            © {new Date().getFullYear()} FlowSphere AI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: '#22C55E',
                  boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <span className="text-xs" style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                All systems operational
              </span>
            </div>
            <span style={{ color: 'rgba(100,255,218,0.2)' }}>·</span>
            <span className="text-xs" style={{ color: 'rgba(248,250,252,0.35)', fontFamily: 'Outfit, sans-serif' }}>
              Made with ❤️ by the FlowSphere team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
