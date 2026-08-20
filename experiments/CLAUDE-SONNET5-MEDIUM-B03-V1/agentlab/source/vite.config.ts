import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: o build precisa abrir a partir de qualquer diretório servido
// estaticamente, inclusive o servidor efêmero usado pela validação externa.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
});
