import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { Providers } from '@/components/providers/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FlowSphere AI — Design. Automate. Scale.',
    template: '%s | FlowSphere AI',
  },
  description:
    'FlowSphere AI is a next-generation workflow automation platform that lets you visually design, automate, and scale your business processes with AI-powered intelligence.',
  keywords: [
    'workflow automation',
    'AI automation',
    'no-code automation',
    'workflow builder',
    'process automation',
    'FlowSphere AI',
  ],
  authors: [{ name: 'FlowSphere AI Team', url: 'https://flowsphere.ai' }],
  creator: 'FlowSphere AI',
  publisher: 'FlowSphere AI',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flowsphere.ai',
    title: 'FlowSphere AI — Design. Automate. Scale.',
    description: 'Next-generation AI-powered workflow automation platform.',
    siteName: 'FlowSphere AI',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FlowSphere AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowSphere AI — Design. Automate. Scale.',
    description: 'Next-generation AI-powered workflow automation platform.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090D16' },
    { media: '(prefers-color-scheme: light)', color: '#090D16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
