import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // သင့် GitHub Repo နာမည်ကို အတိအကျ ထည့်ပါ
  base: '/Al-HikMah-Islamic-library-/', 
})
