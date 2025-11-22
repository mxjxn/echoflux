'use client'

import { useEffect, useState, useRef } from 'react'
import { MusicEngine } from '@echoflux/music-engine'
import { MusicLangRuntime } from '@echoflux/music-lang'

export function useMusicRuntime() {
  const [isReady, setIsReady] = useState(false)
  const engineRef = useRef<MusicEngine | null>(null)
  const runtimeRef = useRef<MusicLangRuntime | null>(null)

  useEffect(() => {
    // Initialize on client side only
    if (typeof window === 'undefined') return

    const initRuntime = async () => {
      try {
        // Create music engine
        const engine = new MusicEngine()
        await engine.init()

        // Create language runtime
        const runtime = new MusicLangRuntime(engine)

        engineRef.current = engine
        runtimeRef.current = runtime

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize music runtime:', error)
      }
    }

    initRuntime()

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.stop()
      }
    }
  }, [])

  return {
    runtime: runtimeRef.current,
    engine: engineRef.current,
    isReady,
  }
}
