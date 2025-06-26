<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watchEffect } from 'vue'
import { Doc } from 'yjs'

import type { Editor } from '@/components/monaco'

class CollaborativeDoc {
  #doc: Doc

  get content() {
    return this.#doc.getText('content')
  }

  constructor() {
    this.#doc = new Doc()
  }

  async bind(editor: Editor) {
    const { MonacoBinding } = await import('y-monaco')
    const content = this.#doc.getText('content')
    content.insert(0, 'Hello world!')

    const binding = new MonacoBinding(
      content,
      editor.getModel(),
      new Set([editor]),
    )

    return { editor, binding }
  }
}

const doc = new CollaborativeDoc()
const monaco = useTemplateRef<{ editor: Editor }>('monaco')

watchEffect(async (cleanUp) => {
  const editor = monaco.value?.editor
  if (editor) {
    const { binding } = await doc.bind(editor)
    cleanUp(() => {
      binding.destroy()
    })
  }
})

const content = ref('')
onMounted(() => {
  content.value = doc.content.toString()
  doc.content.observe(() => {
    content.value = doc.content.toString()
  })
})

</script>

<template>
  <span>Try typing some words in below: <code>{{ content }}</code></span>
  <Monaco ref="monaco" :width="'100%'" :height="'60px'" />
</template>
<style scoped>
.monaco-wrapper {
  margin: 16px 0;
}
</style>
