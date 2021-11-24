import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/excel-sheet-react-table/' : '/',
  build: {
    outDir: 'build',
  },
  plugins: [reactRefresh()],
});
