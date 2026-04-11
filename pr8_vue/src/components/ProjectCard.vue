<script setup lang="ts">
import { useSiteState } from '../composables/useSiteState';
import type { Project } from '../data/translations';

defineProps<{ project: Project }>();
const emit = defineEmits<{ (e: 'open-details', id: number): void }>();

const { texts } = useSiteState();
</script>

<template>
  <article class="project-card">
    <h3>{{ project.title }}</h3>
    <p>{{ project.description }}</p>
    <div class="project-tags">
      <span v-for="tag in project.tags" :key="tag" class="project-tag">{{ tag }}</span>
    </div>
    <div class="project-actions">
      <button type="button" @click="emit('open-details', project.id)">
        {{ texts.detailsButton }}
      </button>
    </div>
  </article>
</template>
