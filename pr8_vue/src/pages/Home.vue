<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useSiteState } from '../composables/useSiteState';
import type { Project } from '../data/translations';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectModal from '../components/ProjectModal.vue';

const { texts, pageTitle } = useSiteState();
const projects = computed<Project[]>(() => texts.value.projects);

const selectedTag = ref('all');
const modalProject = ref<Project | null>(null);

const tags = computed(() => {
  const allTags = new Set<string>();
  projects.value.forEach(p => p.tags.forEach(t => allTags.add(t)));
  return ['all', ...Array.from(allTags)];
});

const filteredProjects = computed(() => {
  if (selectedTag.value === 'all') return projects.value;
  return projects.value.filter(p => p.tags.includes(selectedTag.value));
});

watchEffect(() => {
  document.title = pageTitle('index');
});
</script>

<template>
  <main>
    <header class="hero">
      <div class="container">
        <p class="hero__label">ПРАКТИЧНА РОБОТА №8</p>
        <h1>{{ texts.heroTitle }}</h1>
        <p>{{ texts.heroText }}</p>
        <div class="hero__actions">
          <a class="btn-link" href="#projects">{{ texts.projectsLink }}</a>
        </div>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <h2>{{ texts.aboutTitle }}</h2>
        <p>{{ texts.aboutText }}</p>
      </div>
    </section>

    <section class="section section--alt" id="projects">
      <div class="container">
        <h2>{{ texts.projectsTitle }}</h2>
        <div class="controls">
          <p>
            <span>{{ texts.shownLabel }}</span> 
            <span>{{ filteredProjects.length }} / {{ projects.length }}</span>
          </p>
          <div class="tag-list">
            <button 
              v-for="tag in tags" 
              :key="tag"
              type="button" 
              class="tag-button"
              :class="{ active: selectedTag === tag }"
              @click="selectedTag = tag"
            >
              {{ tag === 'all' ? texts.allTag : tag }}
            </button>
          </div>
        </div>

        <div class="project-grid">
          <ProjectCard 
            v-for="project in filteredProjects" 
            :key="project.id" 
            :project="project" 
            @open-details="id => modalProject = projects.find(p => p.id === id) || null" 
          />
        </div>
      </div>
    </section>

    <ProjectModal :project="modalProject" @close="modalProject = null" />
  </main>
</template>
