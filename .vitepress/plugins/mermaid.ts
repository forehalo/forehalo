import type MarkdownIt from 'markdown-it'

export default function mermaidPlugin(md: MarkdownIt): void {
  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const language = token.info.trim()

    if (language.startsWith('mermaid')) {
      return `<Mermaid code="${encodeURIComponent(token.content)}"></Mermaid>`
    }

    return fence.call(md.renderer.rules, tokens, idx, options, env, self)
  }
}
