import { createContentLoader } from 'vitepress'

export default createContentLoader('**/*.md', {
  globOptions: {
    ignore: ['**/index.md', '*/posts.md'],
  },
  transform(raw) {
    return raw
      .sort((a, b) => b.frontmatter.date - a.frontmatter.date)
      .map(file => {
        return {
          url: file.url,
          ...file.frontmatter,
        }
      })
  },
})
