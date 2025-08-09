import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",
  integrations: [tailwind(), sitemap()],
  image: {
    // allow optimization for remote images (Unsplash example)
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
});
