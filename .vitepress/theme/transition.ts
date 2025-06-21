import { Router } from 'vitepress'
import { nextTick } from 'vue'

export function enableViewTransition(router: Router) {
  if (typeof document === 'undefined' || !document.startViewTransition) {
    return
  }

  let useTransition = false
  document.addEventListener(
    'click',
    e => {
      const link = (e.target as Element).closest('a')

      // avoid page flickering when clicking on mobile nav screen
      if (!link || link.classList.contains('VPNavScreenMenuLink')) {
        useTransition = false
      } else {
        useTransition = true
      }
    },
    {
      capture: true,
    },
  )

  router.onBeforeRouteChange = () => {
    const transition = document.startViewTransition(nextTick)
    transition.ready.then(() => {
      if (!useTransition) {
        transition.skipTransition()
      }
    })
  }
}
