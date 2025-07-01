import { defineConfig } from "vite";

export default defineConfig({
  base: "/currency-converter/",
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
  },
});
