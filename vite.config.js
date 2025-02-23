import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/money-moves/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  transformIndexHtml: {
    enforce: 'pre',
    transform(html) {
      return html.replace(
        '</head>',
        `<style>
          html {
            zoom: 60%;
            -ms-zoom: 60%;
            -webkit-zoom: 60%;
          }
        </style>
        </head>`
      )
    }
  }
})
