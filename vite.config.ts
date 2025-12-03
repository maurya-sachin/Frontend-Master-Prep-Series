import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs'

// Plugin to copy markdown folders to dist
function copyMarkdownPlugin() {
  return {
    name: 'copy-markdown',
    closeBundle() {
      const folders = [
        '01-javascript', '02-typescript', '03-react', '04-nextjs', '05-html-css',
        '06-testing', '07-performance', '08-accessibility', '09-security',
        '10-system-design', '11-browser', '12-networking', '13-pwa',
        '14-tooling', '15-i18n', '16-architecture', '17-seo',
        '18-coding-challenges', '19-flashcards', 'resources'
      ]

      folders.forEach(folder => {
        const src = path.resolve(__dirname, folder)
        const dest = path.resolve(__dirname, 'dist', folder)

        if (existsSync(src)) {
          copyDirectory(src, dest)
        }
      })
    }
  }
}

function copyDirectory(src: string, dest: string) {
  mkdirSync(dest, { recursive: true })
  const files = readdirSync(src)

  files.forEach(file => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)
    const stat = statSync(srcPath)

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else if (file.endsWith('.md') || file === 'README.md') {
      copyFileSync(srcPath, destPath)
    }
  })
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyMarkdownPlugin()],
  base: '/Frontend-Master-Prep-Series/', // GitHub Pages subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  publicDir: 'public',
})
