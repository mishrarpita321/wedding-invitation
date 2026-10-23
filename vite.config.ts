import { execFileSync } from 'node:child_process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const branch = process.env.VITE_RSVP_BRANCH || env.VITE_RSVP_BRANCH || process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.CF_PAGES_BRANCH || execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  return {
    plugins: [react()],
    define: { 'import.meta.env.VITE_RSVP_BRANCH': JSON.stringify(branch) },
    build: { rollupOptions: { output: { manualChunks: { motion: ['framer-motion'], ui: ['@mui/material', '@emotion/react', '@emotion/styled'] } } } },
  };
});
