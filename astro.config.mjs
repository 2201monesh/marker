// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],

  // The new landing site moved from /new to the root; keep old links working.
  redirects: {
    '/new': '/',
    '/new/terms': '/terms',
    '/new/privacy': '/privacy',
    '/new/cookies': '/cookies',
  },
});