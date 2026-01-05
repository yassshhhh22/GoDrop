import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // listen on all network interfaces so other devices on the LAN can reach it
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    // HMR: if the phone can't connect to HMR websocket set VITE_DEV_HOST=<PC_IP> in your env
    hmr: {
      protocol: "ws",
      host: process.env.VITE_DEV_HOST || undefined,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  // ✅ REMOVE the esbuild config - let @vitejs/plugin-react handle JSX
  // optimizeDeps: {
  //   esbuildOptions: {
  //     loader: {
  //       ".js": "jsx",
  //     },
  //   },
  // },
  // esbuild: {
  //   loader: "jsx",
  //   include: /src\/.*\.js$/,
  // },
});
