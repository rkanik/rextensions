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

function injectManifestEnv(mode) {
  return {
    name: 'inject-manifest-env',
    apply: 'build',
    closeBundle() {
      const manifestPath = path.resolve(process.cwd(), 'dist/manifest.json')
      if (!fs.existsSync(manifestPath)) return

      const env = loadEnv(mode, process.cwd(), '')
      const clientId = env.VITE_CHROME_OAUTH_CLIENT_ID?.trim() ?? ''
      const webClientId = env.VITE_GOOGLE_WEB_OAUTH_CLIENT_ID?.trim() ?? ''
      const extensionName =
        mode === 'development' ? 'Rextensions (Dev)' : 'Rextensions'
      const envHint = mode === 'production' ? '.production' : ''

      if (!clientId) {
        console.warn(
          `\n[rextensions] VITE_CHROME_OAUTH_CLIENT_ID is missing (mode=${mode}). Google sign-in will fail until you set it in .env${envHint} and rebuild.\n`,
        )
      }
      if (!webClientId) {
        console.warn(
          `\n[rextensions] VITE_GOOGLE_WEB_OAUTH_CLIENT_ID is missing (mode=${mode}). Arc/Brave Google sign-in fallback will fail until you set it in .env${envHint} and rebuild.\n`,
        )
      }

      const raw = fs.readFileSync(manifestPath, 'utf8')
      const next = raw
        .replace(/__INJECT_OAUTH_CLIENT_ID__/g, clientId)
        .replace(/__INJECT_EXTENSION_NAME__/g, extensionName)
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
    injectManifestEnv(mode),
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
    ...(process.argv.includes('--watch')
      ? {
          watch: {
            include: ['src/**', 'popup.html'],
            exclude: ['node_modules/**', 'dist/**'],
          },
        }
      : {}),
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
