<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useData } from 'vitepress'

import { Disposable } from '../utils'

import type { Editor } from './monaco'

const props = defineProps<{
  width: string
  height: string
  lang?: string
}>()

const { isDark } = useData()
const loading = ref(true)
const elRef = useTemplateRef('el')
const editorRef = shallowRef<Editor>()

defineExpose({
  editor: editorRef
})

function updateTheme(isDark: boolean) {
  editorRef.value?.updateOptions({
    theme: isDark ? 'vs-dark' : 'vs',
  })
}

const colors = [
  'green',
  'yellow',
  'red',
  'purple',
  'indigo'
]

const color = colors.at(Math.floor(Math.random() * colors.length))!

const disposable = new Disposable()

onMounted(() => {
  if (elRef.value) {
    import('./monaco')
      .then(({ renderMonacoEditor }) => {
        editorRef.value = renderMonacoEditor(elRef.value!, {
          language: props.lang ?? 'plaintext',
        })
        disposable.add(() => {
          editorRef.value?.dispose()
        })
        updateTheme(isDark.value)
        loading.value = false
      })
  }
})

onUnmounted(() => {
  disposable.dispose()
})

watch(isDark, updateTheme)

</script>

<template>
  <div class="monaco-wrapper">
    <div ref="el" class="monaco-in-doc" :class="color" :style="{ width: props.width, height: props.height }"></div>
    <Spinner :loading="loading" />
  </div>
</template>
<style>
.monaco-wrapper {
  border-radius: 8px;
  padding: 20px 24px;
  background-color: var(--vp-code-block-bg);
  border: 1px solid transparent;
  transition: border-color 0.2s ease-in-out;
  position: relative;

  &:hover {
    border-color: var(--vp-c-brand-1);
  }

  .monaco-editor {
    outline: none;
    --vscode-editor-background: var(--vp-code-block-bg);
  }

  .monaco-in-doc {
    &.green {
      --y-remote-selection-color: var(--vp-c-green-3);
    }

    &.yellow {
      --y-remote-selection-color: var(--vp-c-yellow-3);
    }

    &.red {
      --y-remote-selection-color: var(--vp-c-red-3);
    }

    &.purple {
      --y-remote-selection-color: var(--vp-c-purple-3);
    }

    &.indigo {
      --y-remote-selection-color: var(--vp-c-indigo-3);
    }

    .yRemoteSelection {
      background-color: var(--y-remote-selection-color);
    }

    .yRemoteSelectionHead {
      position: absolute;
      border-left: var(--y-remote-selection-color) solid 2px;
      border-top: var(--y-remote-selection-color) solid 2px;
      border-bottom: var(--y-remote-selection-color) solid 2px;
      height: 100%;
      box-sizing: border-box;
    }

    .yRemoteSelectionHead::after {
      position: absolute;
      content: ' ';
      border: var(--y-remote-selection-color) 3px solid;
      border-radius: 4px;
      left: -4px;
      top: -5px;
    }

    /* line indicator, selection, etc. */
    .view-overlays {
      .current-line {
        border: 0;
      }

    }

    /* overlay widgets */
    .overlayWidgets {
      .iPadShowKeyboard {
        display: none;
      }
    }

    /* content */
    /* .view-lines {} */
  }
}
</style>