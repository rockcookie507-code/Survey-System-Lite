
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // Explicitly bind to all interfaces
      strictPort: true,
      cors: true, // Enable CORS for easier testing
      watch: {
        usePolling: true 
      }
    }
  };
});
