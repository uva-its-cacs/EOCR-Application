import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

// ----------------------------------------------------------------------

// Aspire injects PORT and services__api__http__0; the fallbacks keep standalone `npm run dev` working.
const PORT = Number(process.env.PORT) || 5173;
// Prefer https: the API redirects http to https when an https endpoint exists.
const API_TARGET =
  process.env.services__api__https__0 ??
  process.env.services__api__http__0 ??
  'https://localhost:7000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false, // local ASP.NET dev certificate
      },
    },
  },
  build: {
    // The API serves the build from server/wwwroot (single deployable, same origin).
    outDir: '../server/wwwroot',
    emptyOutDir: true,
  },
  preview: { port: PORT },
});
