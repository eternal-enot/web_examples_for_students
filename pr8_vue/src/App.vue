<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import BackToTop from './components/BackToTop.vue';
</script>

<template>
  <Navbar />
  <router-view />
  <Footer />
  <BackToTop />
</template>
