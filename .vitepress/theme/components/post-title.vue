<script lang="ts" setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<template>
  <div class="wrapper">
    <h1 class="title">{{ page.title }}</h1>
    <p v-if="page.description" class="description">{{ page.description }}</p>
  </div>
</template>

<style scoped>
.wrapper {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.description {
  font-weight: 400;
  color: var(--vp-c-text-2);
  font-style: italic;

  &::before {
    content: '🤯 ';
    font-style: normal;
  }

  &::after {
    display: inline-block;
    position: relative;
    top: 4px;
    left: 4px;
    content: ' ';
    width: 2px;
    height: 1.2rem;
    /* add flash effect like cursor and animate it 3 times */
    animation: flash 1s 3 ease-in-out;
  }
}

@keyframes flash {
  0% {
    background-color: transparent;
  }

  50% {
    background-color: var(--vp-c-text-2);
  }

  100% {
    background-color: transparent;
  }
}
</style>