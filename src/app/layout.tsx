import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono, Audiowide } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = 'https://insightsetter.manacorp.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: '/site.webmanifest',
  applicationName: 'InsightSetter',
  title: {
    default: 'InsightSetter',
    template: '%s | InsightSetter',
  },
  description: 'Deep insights on capital, strategy, and macro trends.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'InsightSetter',
    description: 'Deep insights on capital, strategy, and macro trends.',
    images: ['/logo-color.svg'],
    url: siteUrl,
    siteName: 'InsightSetter',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsightSetter',
    description: 'Deep insights on capital, strategy, and macro trends.',
    images: ['/logo-color.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

const themeScript = `
  (() => {
    try {
      const storageKey = 'insightsetter-theme';
      const classNameDark = 'dark';
      const root = document.documentElement;
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const stored = window.localStorage.getItem(storageKey);
      const theme = stored === 'light' || stored === 'dark'
        ? stored
        : 'dark';

      if (theme === 'dark') {
        root.classList.add(classNameDark);
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove(classNameDark);
        root.style.colorScheme = 'light';
      }

      root.dataset.theme = theme;
    } catch (error) {
      console.warn('Theme initialisation failed', error);
    }
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${audiowide.variable} bg-background text-foreground antialiased}`}>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}