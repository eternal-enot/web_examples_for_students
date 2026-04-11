<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useSiteState } from '../composables/useSiteState';
import type { Project } from '../data/translations';

const props = defineProps<{ project?: Project | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { texts } = useSiteState();

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div v-if="props.project" class="modal open">
    <div class="modal__overlay" @click="emit('close')"></div>
    <div class="modal__content">
      <button class="modal__close" type="button" @click="emit('close')">×</button>
      <h3>{{ props.project.title }}</h3>
      <p>{{ props.project.description }}</p>
      <p>{{ props.project.details }}</p>
      <p>
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
          {{ texts.repoLink }}
        </a>
      </p>
    </div>
  </div>
</template>
