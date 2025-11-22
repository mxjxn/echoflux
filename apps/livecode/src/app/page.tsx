'use client'

import { LiveCodeIDE } from '@/components/LiveCodeIDE'

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <LiveCodeIDE />
    </main>
  )
}
