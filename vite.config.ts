
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Ensure the API key is injected correctly
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    server: {
      port: 5173,
      host: true, // Allow external access on VM
      strictPort: true,
      watch: {
        usePolling: true // Useful for VM/Docker environments
      }
    }
  };
});
