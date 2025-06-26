<script setup lang="ts">
const props = defineProps<{
  loading: boolean
}>()
</script>
<template>
  <Transition name="spinner">
    <div v-if="props.loading" class="wrapper">
      <div class="loader"></div>
    </div>
  </Transition>
</template>
<style>
:root {
  --spinner-base: transparent;
  --spinner-25: #00000025;
  --spinner-50: #00000050;
  --spinner-75: #00000075;
  --spinner-100: #000000;
}

.dark {
  --spinner-base: transparent;
  --spinner-25: #ffffff25;
  --spinner-50: #ffffff50;
  --spinner-75: #ffffff75;
  --spinner-100: #ffffff;
}
</style>
<style scoped>
.spinner-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.spinner-leave-from {
  opacity: 1;
}

.spinner-leave-to {
  opacity: 0;
}

.wrapper {
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
    linear-gradient(0deg, var(--spinner-50) 30%, var(--spinner-base) 0 70%, var(--spinner-100) 0) 50%/8% 100%,
    linear-gradient(90deg, var(--spinner-25) 30%, var(--spinner-base) 0 70%, var(--spinner-75) 0) 50%/100% 8%;
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
</style>