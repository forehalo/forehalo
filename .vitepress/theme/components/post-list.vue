<script setup lang="ts">
import type { Post } from '../types'

defineProps<{
  posts: Post[]
}>()

</script>
<template>
  <div class="post-list">
    <PostListItem v-for="post in posts" :key="post.url" :post="post" />
  </div>
</template>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:has(.post-list-item-link:hover) {
    .post-list-item-link:not(:hover) {
      color: var(--vp-c-text-3);
    }
  }
}
</style>