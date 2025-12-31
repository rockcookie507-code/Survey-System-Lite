
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Prioritize VITE_ prefixed keys for security/standard
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    server: {
      port: 5173,
      host: true, 
      strictPort: true,
      watch: {
        usePolling: true 
      }
    }
  };
});
