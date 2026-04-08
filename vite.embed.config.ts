import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: "src/embed.tsx",
      name: "DocumentIntelUI", // 🔥 attaches to window
      fileName: "docintel",
      formats: ["umd"], // 🔥 IMPORTANT (not "es")
    },
    rollupOptions: {
      external: ["react", "react-dom"], // keep React external
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    assetsDir: "", // 🔥 keeps files clean (no /assets/)
  },
});