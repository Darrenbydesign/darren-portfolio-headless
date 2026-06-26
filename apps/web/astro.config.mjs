import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://darrensorrelsdesign.com',
  devToolbar: {
    enabled: false
  },
  server: {
    host: true
  }
});
