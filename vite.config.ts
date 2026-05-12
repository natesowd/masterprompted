import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  // Expose HF_* env vars to the client alongside the default VITE_* prefix so
  // a single Netlify env var per model is read both by the browser and by the
  // Deno edge functions (via Deno.env.get). See src/lib/modelConfig.ts.
  envPrefix: ["VITE_", "HF_"],
}));
