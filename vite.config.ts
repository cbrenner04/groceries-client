import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Minimize Dart Sass deprecation warnings from Bootstrap dependencies
        // Bootstrap 5.3.x uses @import and deprecated color functions that trigger warnings
        // in Dart Sass >= 1.40.0 (which reports upcoming removal in Dart Sass 3.0.0).
        // These warnings are harmless—Bootstrap will update before Dart Sass 3.0.0 releases.
        // Setting quietDeps=true reduces the number of warnings printed to the console.
        // See: https://sass-lang.com/d/import and https://sass-lang.com/d/color-functions
        quietDeps: true,
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router/")
          ) {
            return "vendor";
          }

          return undefined;
        },
      },
    },
  },
  define: {
    "process.env": {},
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        statements: 98.21,
        branches: 92.88,
        functions: 96.51,
        lines: 98.43,
        autoUpdate: true,
      },
    },
  },
});
