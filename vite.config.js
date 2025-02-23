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
          body {
            transform: scale(0.6);
            transform-origin: top left;
            width: 166.67%; /* 100/0.6 to compensate for scale */
            height: 166.67%;
            position: absolute;
          }
          html, body {
            overflow-x: hidden;
          }
        </style>
        </head>`
      )
    }
  }
})
