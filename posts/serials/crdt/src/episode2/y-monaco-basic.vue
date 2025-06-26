<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue'
import { BasicCollaborativeDoc } from './docs'
import type { Editor } from '@/components/monaco'

const doc = new BasicCollaborativeDoc()

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

</script>
<template>
  <Monaco ref="monaco" :width="'300px'" :height="'60px'" />
</template>