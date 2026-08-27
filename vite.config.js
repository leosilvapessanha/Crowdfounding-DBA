import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  publicDir: 'public',
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // testes: fileURLToPath(new URL('./index_testes.html', import.meta.url)),
      },
    },
  },
});
