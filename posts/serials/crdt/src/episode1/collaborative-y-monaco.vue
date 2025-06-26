<script lang="ts" setup>
import { onMounted, shallowRef, useTemplateRef, watchEffect } from 'vue'
import { CollaborativeDoc } from './doc'
import type { Editor } from '@/components/monaco'

const docRef = shallowRef<CollaborativeDoc>()
const monaco = useTemplateRef<{ editor: Editor }>('monaco')

onMounted(() => {
  docRef.value = new CollaborativeDoc()
})

watchEffect(async (cleanUp) => {
  const editor = monaco.value?.editor
  if (editor && docRef.value) {
    const { binding } = await docRef.value.bind(editor)
    cleanUp(() => {
      binding.destroy()
    })
  }
})

</script>
<template>
  <Monaco ref="monaco" :width="'300px'" :height="'60px'" />
</template>
