import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';

const root = resolve(__dirname, 'src');

export default defineConfig({
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp', '**/*.avif'],
  server: {
    strictPort: true,
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    commonjs(),
  ],
  resolve: {
    alias: {
      '@assets': resolve(root, 'assets'),
      '@components': resolve(root, 'components'),
      '@lib': resolve(root, 'lib'),
      '@styles': resolve(root, 'styles'),
      '@types': resolve(root, 'types/index.ts'),
    },
  },
});