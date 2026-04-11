<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const show = ref(false);

const handleScroll = () => {
  show.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
  <button 
    class="back-to-top"
    :class="{ show }"
    type="button" 
    @click="scrollToTop"
  >
    ↑
  </button>
</template>
