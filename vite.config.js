import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // rutas relativas: funciona en su dirección propia y bajo /bandas/ del Hub
  plugins: [react()],
  server: {
    host: true, // expone en la red local (192.168.x.x) para poder probar desde el celular
  },
})
