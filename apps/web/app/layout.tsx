import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoFlux - Collaborative Music Sequencer',
  description: 'Create, share, and remix music sequences',
  manifest: '/manifest.json',
  themeColor: '#0f0f0f',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EchoFlux',
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
