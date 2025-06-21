<script lang="ts" setup>
import { onMounted, shallowRef, useTemplateRef, watchEffect } from 'vue'

import { CollaborativeDoc } from './doc'
import type { Editor } from '@/components/monaco'

const docRef = shallowRef<CollaborativeDoc>()
const monaco = useTemplateRef<{ editor: Editor }>('monaco')

onMounted(() => {
  docRef.value = new CollaborativeDoc()
})

watchEffect(async () => {
  const editor = monaco.value?.editor
  if (editor && docRef.value) {
    await docRef.value.bind(editor)
  }
})

</script>
<template>
  <Monaco ref="monaco" :width="'300px'" :height="'60px'" />
</template>
