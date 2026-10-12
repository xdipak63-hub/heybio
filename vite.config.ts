
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr"
      }
    }),
    reactRouter()
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true
  },
  build: {
    sourcemap: true
  }
});