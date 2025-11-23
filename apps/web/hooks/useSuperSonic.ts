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
  send: (address: string, ...args: any[]) => Promise<void>;
  close: () => void;
  audioContext?: AudioContext;
}

export function useSuperSonic() {
  const [sonic, setSonic] = useState<SuperSonicInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sonicRef = useRef<SuperSonicInstance | null>(null);

  useEffect(() => {
    let mounted = true;


    async function initializeInstance() {
      if (!mounted || !window.SuperSonic) return;

      try {
        // Create and initialize the instance
        const sonicInstance = new window.SuperSonic({
          workerBaseURL: '/supersonic/workers/',
          wasmBaseURL: '/supersonic/wasm/',
          synthdefBaseURL: '/supersonic/synthdefs/',
        });

        console.log('[useSuperSonic] Initializing SuperSonic...');
        await sonicInstance.init();
        console.log('[useSuperSonic] SuperSonic initialized, loading synthdefs...');

        // Load common synthdefs
        await sonicInstance.loadSynthDefs([
          'sonic-pi-beep',
          'sonic-pi-saw',
          'sonic-pi-mod_sine', // Note: sine is mod_sine in SuperSonic
          'sonic-pi-square',
          'sonic-pi-tri',
          'sonic-pi-pulse',
          'sonic-pi-tb303',
          'sonic-pi-prophet',
          'sonic-pi-pretty_bell',
          'sonic-pi-dull_bell',
          'sonic-pi-dark_ambience',
        ]);
        console.log('[useSuperSonic] Synthdefs loaded successfully');

        if (mounted) {
          sonicRef.current = sonicInstance;
          setSonic(sonicInstance);
          setLoading(false);
        }
      } catch (initErr) {
        throw initErr;
      }
    }

    async function loadSuperSonic() {
      try {
        // Check if SuperSonic is already available on window (for backwards compatibility)
        if (window.SuperSonic) {
          console.log('[useSuperSonic] SuperSonic already available, creating instance...');
          await initializeInstance();
          return;
        }

        // Load the wrapper script that exposes SuperSonic to window
        console.log('[useSuperSonic] Loading SuperSonic wrapper script...');
        
        await new Promise<void>((resolve, reject) => {
          // Check if script is already loading/loaded
          const existingScript = document.querySelector('script[src="/supersonic/load-supersonic.js"]') as HTMLScriptElement;
          if (existingScript) {
            // Script already exists, wait for SuperSonic to be available
            const checkInterval = setInterval(() => {
              if (window.SuperSonic) {
                clearInterval(checkInterval);
                console.log('[useSuperSonic] SuperSonic available from existing script');
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              if (!window.SuperSonic) {
                reject(new Error('Timeout waiting for SuperSonic to load'));
              }
            }, 10000);
            return;
          }

          // Create and load the wrapper script
          const script = document.createElement('script');
          script.src = '/supersonic/load-supersonic.js';
          script.type = 'module';
          script.async = true;

          script.onload = () => {
            console.log('[useSuperSonic] Wrapper script loaded, waiting for SuperSonic...');
            // Wait for SuperSonic to be exposed to window
            const checkInterval = setInterval(() => {
              if (window.SuperSonic) {
                clearInterval(checkInterval);
                console.log('[useSuperSonic] SuperSonic available');
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkInterval);
              if (!window.SuperSonic) {
                reject(new Error('SuperSonic not exposed to window after script load'));
              }
            }, 10000);
          };

          script.onerror = (err) => {
            console.error('[useSuperSonic] Failed to load wrapper script:', err);
            reject(new Error('Failed to load SuperSonic wrapper script'));
          };

          document.head.appendChild(script);
        });

        // Now that SuperSonic is available, initialize it
        await initializeInstance();
      } catch (err) {
        console.error('[useSuperSonic] Error loading SuperSonic:', err);
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load SuperSonic';
          console.error('[useSuperSonic] Error details:', {
            message: errorMessage,
            error: err,
            stack: err instanceof Error ? err.stack : undefined,
          });
          setError(errorMessage);
          setLoading(false);
        }
      }
    }

    loadSuperSonic();

    return () => {
      mounted = false;
      if (sonicRef.current) {
        try {
          sonicRef.current.close();
          sonicRef.current = null;
        } catch (err) {
          console.error('Error closing SuperSonic:', err);
        }
      }
    };
  }, []);

  return { sonic, loading, error };
}
