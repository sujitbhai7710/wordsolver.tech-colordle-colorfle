import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://colordleanswer.me',
  output: 'static',
  integrations: [svelte(), sitemap()],
  build: {
    assets: 'assets',
  },
  vite: {
    ssr: {
      noExternal: ['color-name-list', 'color-space', 'delta-e', 'seedrandom'],
    },
  },
});
