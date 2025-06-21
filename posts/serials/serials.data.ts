import { createContentLoader } from 'vitepress'

export default createContentLoader('./serials/**/*.md', {
  transform(rawData) {
    const serials: Record<string, any> = {}

    rawData.forEach(doc => {
      if ('/serials/'.startsWith(doc.url)) {
        return
      }

      const matches = doc.url.match(/^\/serials\/(.+)\/(.*)/)
      if (!matches) {
        return
      }

      const [, serial, name] = matches

      if (!name) {
        serials[serial] = {
          url: `/serials/${serial}/`,
          ...serials[serial],
          ...doc.frontmatter,
        }
      } else {
        serials[serial] = {
          ...serials[serial],
          posts: [
            ...(serials[serial]?.posts || []),
            {
              url: doc.url,
              ...doc.frontmatter,
            },
          ],
        }
      }
    })

    return serials
  },
})
