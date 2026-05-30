import { defineConfig } from "vite";
import path from 'path'; // Thay đổi cách import
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        menu: path.resolve(__dirname, "menu.html"),
        album: path.resolve(__dirname, "album.html"),
        cake: path.resolve(__dirname, "cake.html"),
        universe: path.resolve(__dirname, "universe.html"),
      },
    },
  },
});