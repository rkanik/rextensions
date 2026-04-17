import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

function injectChromeOAuthClientId(mode) {
  return {
    name: 'inject-chrome-oauth-client-id',
    apply: 'build',
    closeBundle() {
      const manifestPath = path.resolve(process.cwd(), 'dist/manifest.json')
      if (!fs.existsSync(manifestPath)) return

      const env = loadEnv(mode, process.cwd(), '')
      const clientId = env.VITE_CHROME_OAUTH_CLIENT_ID?.trim() ?? ''

      if (!clientId) {
        console.warn(
          '\n[rextensions] VITE_CHROME_OAUTH_CLIENT_ID is missing. Google sign-in will fail until you set it in .env and rebuild.\n',
        )
      }

      const raw = fs.readFileSync(manifestPath, 'utf8')
      const next = raw.replace(/__INJECT_OAUTH_CLIENT_ID__/g, clientId)
      fs.writeFileSync(manifestPath, next)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'pinia', 'vue-router'],
      dirs: ['./src/composables/**', './src/stores/**', './src/utils/**'],
      dts: './src/auto-imports.d.ts',
      dtsMode: 'overwrite',
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components'],
      dts: './src/components.d.ts',
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
    injectChromeOAuthClientId(mode),
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: fileURLToPath(new URL('popup.html', import.meta.url)),
        background: fileURLToPath(new URL('src/background.ts', import.meta.url)),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    watch: {
      include: ['src/**', 'popup.html'],
      exclude: ['node_modules/**', 'dist/**'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
}))
