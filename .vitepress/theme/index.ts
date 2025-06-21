// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import { registerComponents } from './components'
import { enableViewTransition } from './transition'
import Layout from './layout.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    registerComponents(app)
    enableViewTransition(router)
  },
} satisfies Theme
