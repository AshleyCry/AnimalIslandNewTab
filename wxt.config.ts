import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss(), svgr()],
  }),
  manifest: {
    name: "Animal Island New Tab",
    description: "A cozy Animal Island-inspired new tab page.",
    version: "1.0.0",
    manifest_version: 3,
    permissions: ["geolocation"],
    host_permissions: [
      "https://api.open-meteo.com/*",
      "https://geocoding-api.open-meteo.com/*",
    ],
    chrome_url_overrides: {
      newtab: "newtab.html",
    },
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      128: "icon/128.png",
    },
  },
  modules: ["@wxt-dev/module-react"],
});
