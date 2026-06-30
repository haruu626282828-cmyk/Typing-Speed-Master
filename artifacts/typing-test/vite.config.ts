import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const isReplit = process.env.REPL_ID !== undefined;

// PORT and BASE_PATH are required at runtime in Replit but not needed for
// production static builds (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
const port = Number(process.env.PORT ?? 5173);
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    // optimize: false required for Tailwind v4 + @clerk/themes in production.
    // Without it, lightningcss reorders @layer declarations from the themes
    // package, causing Clerk UI to render broken in prod but fine in dev.
    tailwindcss({ optimize: false }),
    // Replit dev-only plugins — never loaded in production or outside Replit
    ...(!isProduction && isReplit
      ? await Promise.all([
          import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default()
          ),
          import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            })
          ),
          import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ])
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets"
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
