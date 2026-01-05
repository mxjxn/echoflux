import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoFlux Tracker - Music Tracker with Vim Navigation',
  description: 'Professional music tracker with vim-like navigation and SuperCollider synthesis',
  manifest: '/manifest.json',
  themeColor: '#0f0f0f',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EchoFlux Tracker',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
