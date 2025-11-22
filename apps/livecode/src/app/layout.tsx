import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EchoFlux LiveCode',
  description: 'Live coding music environment inspired by Overtone and SuperCollider',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
