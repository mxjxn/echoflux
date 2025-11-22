'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    SuperSonic: any;
  }
}

export interface SuperSonicInstance {
  init: () => Promise<void>;
  loadSynthDefs: (names: string[]) => Promise<void>;
  send: (address: string, ...args: any[]) => void;
  close: () => void;
}

export function useSuperSonic() {
  const [sonic, setSonic] = useState<SuperSonicInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSuperSonic() {
      try {
        // Load the SuperSonic script
        if (!scriptRef.current) {
          const script = document.createElement('script');
          script.src = '/supersonic/supersonic.js';
          script.async = true;

          script.onload = async () => {
            if (!mounted) return;

            try {
              // Create SuperSonic instance
              const sonicInstance = new window.SuperSonic({
                workerBaseURL: '/supersonic/workers/',
                wasmBaseURL: '/supersonic/wasm/',
                synthdefBaseURL: '/supersonic/synthdefs/',
              });

              // Initialize
              await sonicInstance.init();

              // Load common synthdefs
              await sonicInstance.loadSynthDefs([
                'sonic-pi-beep',
                'sonic-pi-saw',
                'sonic-pi-sine',
                'sonic-pi-square',
                'sonic-pi-tri',
                'sonic-pi-pulse',
                'sonic-pi-tb303',
                'sonic-pi-prophet',
                'sonic-pi-pretty_bell',
                'sonic-pi-dull_bell',
                'sonic-pi-dark_ambience',
              ]);

              if (mounted) {
                setSonic(sonicInstance);
                setLoading(false);
              }
            } catch (err) {
              console.error('Failed to initialize SuperSonic:', err);
              if (mounted) {
                setError(err instanceof Error ? err.message : 'Failed to initialize');
                setLoading(false);
              }
            }
          };

          script.onerror = () => {
            if (mounted) {
              setError('Failed to load SuperSonic script');
              setLoading(false);
            }
          };

          document.head.appendChild(script);
          scriptRef.current = script;
        }
      } catch (err) {
        console.error('Error loading SuperSonic:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }

    loadSuperSonic();

    return () => {
      mounted = false;
      if (sonic) {
        try {
          sonic.close();
        } catch (err) {
          console.error('Error closing SuperSonic:', err);
        }
      }
    };
  }, []);

  return { sonic, loading, error };
}
