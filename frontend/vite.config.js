import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react' 
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; 

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
    ],
    // Base URL for deployment - use '/' for root deployment
    base: env.VITE_BASE_URL || '/',
    build: {
      // Disable source map generation for production builds
      sourcemap: false,
      // Output directory
      outDir: 'dist',
      // Optimize chunks for production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // Run frontend on the expected local dev URL.
      host: 'localhost',
      port: Number(env.VITE_PORT) || 5173,
      strictPort: true,
      // Development proxy - only used in dev mode
      proxy: {
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})