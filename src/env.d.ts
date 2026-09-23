/// <reference path="../.astro/types.d.ts" />

interface Window {
  /** Aviso flotante del panel admin; lo define AdminLayout.astro. */
  toast: (msg: string, kind?: 'ok' | 'error') => void;
}
