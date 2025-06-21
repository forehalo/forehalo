<script lang="ts" setup>
const props = defineProps<{
  completed: boolean
}>()

</script>

<template>
  <p>
    {{ props.completed ? '🎉 Completed' : '🚧 To Be Continued' }}
  </p>
</template>
