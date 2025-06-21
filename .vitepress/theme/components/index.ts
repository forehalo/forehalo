import { App } from 'vue'
import { camelCase, upperFirst } from 'lodash-es'

const VueComponents = import.meta.glob(['./*.vue'], { eager: true, import: 'default' })

export function registerComponents(app: App) {
  Object.entries(VueComponents).forEach(([key, value]) => {
    const name = key
      .split('/')
      .pop()!
      .replace(/\.vue$/, '')

    app.component(upperFirst(camelCase(name)), value)
  })
}
