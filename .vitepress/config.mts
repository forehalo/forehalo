import { defineConfig } from 'vitepress'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Yii',
  description: 'Personal blog of Yii',
  base: '/',
  outDir: './dist',
  srcDir: './posts',
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],
  // appearance: false,
  cleanUrls: true,
  metaChunk: true,
  vite: {
    resolve: {
      alias: {
        '@': join(root, '.vitepress/theme'),
      },
    },
    ssr: {
      noExternal: ['monaco-editor', 'yjs', 'y-protocols', 'y-monaco', 'lib0'],
    },
    experimental: {
      enableNativePlugin: true,
    },
    build: {
      rollupOptions: {
        output: {
          advancedChunks: {
            groups: [
              {
                name: 'monaco',
                test: /node_modules[/\\]monaco-editor/,
              },
              {
                name: 'yjs',
                test: /node_modules[/\\](yjs|y-protocols|lib0)/,
              },
            ],
          },
        },
      },
    },
  },
  themeConfig: {
    outline: false,
    aside: false,

    search: {
      provider: 'local',
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Posts', link: '/posts' },
      { text: 'Serials', link: '/serials/' },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/forehalo' }],

    footer: {
      message:
        'This work is licensed under <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-SA 4.0</a>',
      copyright: 'Copyright © 2025-PRESENT Liu Yi',
    },
  },
})
