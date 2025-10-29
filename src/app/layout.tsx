import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'InsightSetter',
    template: '%s | InsightSetter',
  },
  description:
    'InsightSetter curates sharp thinking on finance, tech, and the global economy.',
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
        : mediaQuery.matches ? 'dark' : 'light';

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
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
