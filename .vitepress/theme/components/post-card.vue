<script setup lang="ts">
import type { Post } from '../types'

defineProps<{
  post: Post
}>()
</script>

<template>
  <a :href="post.url" class="post-card-link">
    <div class="post-card">
      <p class="post-card-title">{{ post.title }}</p>
      <p class="post-card-description">{{ post.description }}</p>
    </div>
  </a>
</template>

<style scoped>
.post-card-link {
  p {
    margin: 0;
  }

  text-decoration: none !important;
}

.post-card {
  box-shadow: var(--vp-shadow-1);
  padding: 0.5rem;
  border-radius: 8px;
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: var(--vp-shadow-2);

    .post-card-title {
      color: var(--vp-c-text-1);
    }

    .post-card-description {
      color: var(--vp-c-text-2);
    }
  }
}

.post-card-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  transition: color 0.2s ease;
}

.post-card-description {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  transition: color 0.2s ease;
}
</style>