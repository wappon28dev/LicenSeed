import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import paths from "vite-tsconfig-paths";
import generouted from "@generouted/react-router/plugin";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    paths(),
    generouted(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/vscode-material-icons/generated/icons/*",
          dest: "assets/material-icons",
        },
      ],
    }),
    nodePolyfills(),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
