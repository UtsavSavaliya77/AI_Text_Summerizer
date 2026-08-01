import { defineConfig } from 'vitest/config';

// Attempt to load @vitejs/plugin-react if available. If not, fall back to a no-op
// plugin so the config can still be parsed without the dependency installed.
let react: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  react = require('@vitejs/plugin-react');
} catch {
  react = () => null;
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Simulates a browser environment
    setupFiles: './src/test/setup.ts',
  },
});