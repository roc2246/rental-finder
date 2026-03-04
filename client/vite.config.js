import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv";

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api":
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "backend url", // your backend URL
    },
  },
})
