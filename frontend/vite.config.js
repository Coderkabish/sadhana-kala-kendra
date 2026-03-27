import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react' 
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; 
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const vitePrerender = require('vite-plugin-prerender')
const PuppeteerRenderer = vitePrerender.PuppeteerRenderer

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // Pre-render static SEO pages for crawlers - receives full HTML in page source
      // Detail pages (/courses/:slug, /events/:slug, etc) are rendered client-side
      // and discovered by Google through sitemap.xml (backend generated dynamically)
      vitePrerender({
        staticDir: path.join(process.cwd(), 'dist'),
        routes: [
          '/',              // Home page
          '/about',         // About page
          '/activities',    // Activities page
          '/teachers',      // Teachers page
          '/register',      // Visitor registration
          '/courses',       // Courses listing
          '/events',        // Events listing
          '/offers',        // Offers listing
          '/artists',       // Artists listing
          '/gallery',       // Gallery
        ],
        renderer: new PuppeteerRenderer({
          navigationOptions: {
            waitUntil: 'networkidle0',
          },
          renderAfterElementExists: '#root > *',
          renderAfterTime: 8000,
          consoleHandler(route, message) {
            console.log(`[prerender:${route}] ${message.text()}`)
          },
          headless: true,
        }),
      }),
    ],
    // Base URL for deployment - use '/' for root deployment
    base: env.VITE_BASE_URL || '/',
    build: {
      // Keep transpilation compatible with old Chromium used by vite-plugin-prerender's Puppeteer.
      target: 'chrome70',
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
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})