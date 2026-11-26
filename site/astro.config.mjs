// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// The pipeline reads data/ and research/ from the repo root. Bundling moves its code into dist/,
// so tell it where the root is.
process.env.MARKET_PULSE_ROOT = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    resolve: {
      // The data pipeline lives outside the site: the site reuses its code instead of copying it.
      alias: { '@pipeline': fileURLToPath(new URL('../scripts/lib', import.meta.url)) },
    },
    server: { fs: { allow: ['..'] } },
  },
});
