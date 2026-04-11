<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSiteState } from '../composables/useSiteState';
import { computed } from 'vue';

const { texts } = useSiteState();
const route = useRoute();
const isHome = computed(() => route.path === '/');
</script>

<template>
  <footer>
    <div class="container footer-row">
      <p>{{ texts.footerText }}</p>
      <router-link v-if="isHome" to="/contacts">{{ texts.footerContacts }}</router-link>
      <router-link v-else to="/">{{ texts.backHome }}</router-link>
    </div>
  </footer>
</template>
