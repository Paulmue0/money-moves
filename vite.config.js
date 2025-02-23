import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/money-moves/',
  transformIndexHtml: {
    enforce: 'pre',
    transform(html) {
      return html.replace(
        '</head>',
        `<style>
          html {
            zoom: 65%;
            -ms-zoom: 65%;
            -webkit-zoom: 65%;
          }
        </style>
        </head>`
      )
    }
  }
})
