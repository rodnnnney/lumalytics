import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from '@/context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lumalytics.app'),
  title: 'Lumalytics',
  description: 'A lightweight analytics platform for Luma Hosts',
  icons: [
    {
      rel: 'icon',
      type: 'image/svg',
      sizes: '32x32',
      url: '/logo.svg',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-gray-100 min-h-screen">
        <AuthProvider>
          <Providers>
            <main>{children}</main>
            <Analytics />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
