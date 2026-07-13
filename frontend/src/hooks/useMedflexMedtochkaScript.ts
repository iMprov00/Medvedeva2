import { useEffect } from 'react';
import { MEDFLEX_MEDTOCHKA_SCRIPT } from '../content/medflex';

let scriptPromise: Promise<void> | null = null;

function loadMedflexMedtochkaScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-medflex-medtochka]');
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Medflex script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = MEDFLEX_MEDTOCHKA_SCRIPT;
    script.defer = true;
    script.charset = 'utf-8';
    script.dataset.medflexMedtochka = 'true';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('Medflex script failed'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function useMedflexMedtochkaScript() {
  useEffect(() => {
    loadMedflexMedtochkaScript().catch(() => {
      // Виджет не критичен для работы сайта.
    });
  }, []);
}
