<script setup lang="ts">
import type { Post } from '../types'

defineProps<{
  post: Post
}>()
</script>

<template>
  <a :href="post.url" class="post-list-item-link">
    <p class="post-list-item-title">{{ post.title }}</p>
  </a>
</template>

<style scoped>
.post-list-item-link {
  text-decoration: none;
}

.post-list-item-title {
  margin: 0;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.2s ease;

  &:hover {
    color: var(--vp-c-text-1);
  }
}
</style>