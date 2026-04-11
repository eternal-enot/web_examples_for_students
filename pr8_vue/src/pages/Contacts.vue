<script setup lang="ts">
import { watchEffect } from 'vue';
import { useSiteState } from '../composables/useSiteState';

const { texts, pageTitle } = useSiteState();

watchEffect(() => {
  document.title = pageTitle('contacts');
});
</script>

<template>
  <main>
    <header class="hero">
      <div class="container">
        <p class="hero__label">ПРАКТИЧНА РОБОТА №8</p>
        <h1>{{ texts.contactsTitle }}</h1>
        <p>{{ texts.contactsText }}</p>
        <div class="hero__actions">
          <router-link class="btn-link" to="/">На головну</router-link>
        </div>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="card">
          <h2>{{ texts.contactsListTitle }}</h2>
          <p><strong>Email:</strong> <a href="mailto:illia.student@email.com">illia.student@email.com</a></p>
          <p><strong>GitHub:</strong> <a href="https://github.com/" target="_blank" rel="noopener noreferrer">github.com/illia</a></p>
          <p><strong>Telegram:</strong> <a href="https://t.me/" target="_blank" rel="noopener noreferrer">@illia</a></p>
        </div>
      </div>
    </section>
  </main>
</template>
