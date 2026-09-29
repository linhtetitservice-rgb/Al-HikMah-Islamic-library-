import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Al-HikMah-Islamic-library-/', // ဒီစာကြောင်းလေးကို မဖြစ်မနေ ထည့်ပေးရပါမယ်
})
