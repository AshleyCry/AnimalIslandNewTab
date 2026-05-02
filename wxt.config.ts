import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: ['geolocation'],
    host_permissions: [
      'https://api.open-meteo.com/*',
      'https://geocoding-api.open-meteo.com/*',
    ],
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
  },
  modules: ['@wxt-dev/module-react'],
});
