/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Defence in depth: anything prefixed VITE_ is bundled into public JavaScript.
  // Refuse to build if a privileged secret has been exposed that way by mistake.
  const leaked = Object.keys(env).filter(
    (key) => key.startsWith('VITE_') && /SERVICE_ROLE|SECRET|PRIVATE|RESEND|PASSWORD/i.test(key),
  );
  if (leaked.length > 0) {
    throw new Error(
      `Refusing to build: ${leaked.join(', ')} would be exposed to the browser. ` +
        'Server-side secrets must never use the VITE_ prefix.',
    );
  }

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: { port: 5173, host: true },
    preview: { port: 4173, host: true },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
