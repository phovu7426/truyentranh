<template>
  <div></div>
</template>

<script setup lang="ts">
// Redirect /home/products to /home/comics
// (This project is about comics, not products)
await navigateTo('/home/comics', { replace: true })
</script>

