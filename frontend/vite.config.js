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
    },
    server: {
      // Development proxy - only used in dev mode
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
})