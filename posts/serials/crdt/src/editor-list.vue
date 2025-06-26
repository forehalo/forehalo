<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
  defaultCount?: number
  editor: any
}>()

const count = ref(props.defaultCount ?? 2)

</script>
<template>
  <div class="editors">
    <component :is="props.editor" v-for="i in count" :key="i" />
    <button class="new" @click="count++">Add Mocked Peer</button>
  </div>
</template>
<style scoped>
.editors {
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: auto;
  gap: 16px;
}

.new {
  font-size: 14px;
  background-color: var(--vp-code-block-bg);
  border-radius: 8px;
  height: 100px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border-color: var(--vp-c-brand-1);
  }
}
</style>