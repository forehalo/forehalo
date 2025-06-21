<script setup lang="ts">
import { onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useData } from 'vitepress'

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

onMounted(() => {
  if (elRef.value) {
    import('./monaco')
      .then(({ renderMonacoEditor }) => {
        editorRef.value = renderMonacoEditor(elRef.value!, {
          language: props.lang ?? 'plaintext',
        })
        updateTheme(isDark.value)
        loading.value = false
      })
  }
})

watch(isDark, updateTheme)

</script>

<template>
  <div class="monaco-wrapper">
    <div ref="el" class="monaco-in-doc" :class="color" :style="{ width: props.width, height: props.height }"></div>
    <Transition name="editor-loading">
      <div v-show="loading" class="loader-wrapper">
        <div class="loader"></div>
      </div>
    </Transition>
  </div>
</template>

<style>
.editor-loading-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.editor-loading-leave-from {
  opacity: 1;
}

.editor-loading-leave-to {
  opacity: 0;
}

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

  .loader-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--vp-code-block-bg);
    border-radius: 8px;
  }

  .loader {
    width: 24px;
    height: 24px;
    aspect-ratio: 1;
    display: grid;
    border-radius: 50%;
    background:
      linear-gradient(0deg, rgb(0 0 0/50%) 30%, #0000 0 70%, rgb(0 0 0/100%) 0) 50%/8% 100%,
      linear-gradient(90deg, rgb(0 0 0/25%) 30%, #0000 0 70%, rgb(0 0 0/75%) 0) 50%/100% 8%;
    background-repeat: no-repeat;
    animation: spin 1s infinite steps(12);
  }

  .loader::before,
  .loader::after {
    content: "";
    grid-area: 1/1;
    border-radius: 50%;
    background: inherit;
    opacity: 0.915;
    transform: rotate(30deg);
  }

  .loader::after {
    opacity: 0.83;
    transform: rotate(60deg);
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