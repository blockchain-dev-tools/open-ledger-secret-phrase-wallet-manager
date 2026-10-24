import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 相对路径，使产物同时适用于本地预览与 GitHub Pages 项目路径。
  base: './',
  plugins: [react()],
});
