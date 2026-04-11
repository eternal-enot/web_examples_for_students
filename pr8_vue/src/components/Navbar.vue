<script setup lang="ts">
import { useSiteState } from '../composables/useSiteState';

const { lang, texts, toggleTheme, setLanguage } = useSiteState();
</script>

<template>
  <nav class="main-nav">
    <div class="container nav-row">
      <div class="nav-links">
        <a href="../../index.html">Список робіт</a>
        <router-link to="/" exact-active-class="active">{{ texts.navHome }}</router-link>
        <router-link to="/contacts" exact-active-class="active">{{ texts.navContacts }}</router-link>
      </div>

      <div class="nav-controls">
        <button 
          type="button" 
          :class="{ active: lang === 'uk' }" 
          @click="setLanguage('uk')"
        >
          UA
        </button>
        <button 
          type="button" 
          :class="{ active: lang === 'en' }" 
          @click="setLanguage('en')"
        >
          EN
        </button>
        <button type="button" @click="toggleTheme">
          {{ texts.themeButton }}
        </button>
      </div>
    </div>
  </nav>
</template>
