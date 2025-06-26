<script lang="ts" setup>
import { uniqueId } from 'lodash-es';
import { useData } from 'vitepress';
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

const loader = import('mermaid').then(m => m.default)

const id = uniqueId('mermaid-')
const props = defineProps<{ code: string }>()
const svg = ref('')
const container = useTemplateRef<HTMLDivElement>('container')
const { isDark } = useData()

let height = ref('auto')

async function render() {
  svg.value = ''
  const mermaid = await loader
  mermaid.initialize({ startOnLoad: false, theme: isDark.value ? 'dark' : 'default', look: 'handDrawn', darkMode: isDark.value })
  if (container.value) {
    const result = await mermaid.render(id, decodeURIComponent(props.code))
    svg.value = result.svg
    result.bindFunctions?.(container.value)
    nextTick(() => {
      height.value = `${container.value?.parentElement?.clientHeight}px`
    })
  }
}

onMounted(async () => {
  await render()
})

watch(isDark, async () => {
  await render()
})
</script>
<template>
  <ClientOnly>
    <div class="container language-mermaid" :style="{ height }">
      <div class="mermaid" ref="container" v-html="svg"></div>
      <Spinner :loading="!svg" />
    </div>
  </ClientOnly>
</template>
<style scoped>
.container {
  width: 100%;
  min-height: 320px;
  background-color: var(--vp-code-block-bg);
  border-radius: 8px;
  padding: 20px 24px;
  position: relative;
  transition: height 0.3s ease-in-out;
}

.mermaid {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>