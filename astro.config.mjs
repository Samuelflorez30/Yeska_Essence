import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// SSR (no estático): así los cambios que la dueña haga en el panel
// se ven en el sitio público al instante, sin tener que "reconstruir" el sitio.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // Dominio real de producción: lo necesitan las URLs canónicas, Open Graph
  // y el sitemap para no generar enlaces rotos o apuntando a localhost.
  site: 'https://TU-DOMINIO-AQUI',
});
