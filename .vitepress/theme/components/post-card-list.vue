<script setup lang="ts">
import type { Post } from '../types'

defineProps<{
  posts: Post[]
}>()

</script>

<template>
  <div class="post-card-list">
    <PostCard v-for="post in posts" :key="post.url" :post="post" />
  </div>
</template>

<style scoped>
.post-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
  margin: 0 -0.5rem;
}
</style>