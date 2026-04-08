import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        embed: "src/embed.tsx",
      },
      output: {
        entryFileNames: `cdn/[name].js`,
        chunkFileNames: `cdn/[name].js`,
        assetFileNames: `cdn/[name].[ext]`,
      },
    },
    assetsDir: "cdn",
  },
});
