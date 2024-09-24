import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, 'src');

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      commonjs({
        include: ['node_modules/highcharts-multicolor-series/**']
      })
    ],
    resolve: {
      alias: {
        '@assets': resolve(root, 'assets'),
        '@components': resolve(root, 'components'),
        '@lib': resolve(root, 'lib'),
        '@styles': resolve(root, 'styles'),
      },
    },
  };
});