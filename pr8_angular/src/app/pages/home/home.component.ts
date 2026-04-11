import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ProjectItem } from '../../data/translations';
import { SiteStateService } from '../../services/site-state.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly site = inject(SiteStateService);
  private readonly title = inject(Title);

  readonly selectedTag = signal('all');
  readonly openedProjectId = signal<number | null>(null);
  readonly showBackToTop = signal(false);

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    for (const project of this.site.texts().projects) {
      for (const tag of project.tags) {
        tags.add(tag);
      }
    }

    return ['all', ...Array.from(tags)];
  });

  readonly visibleProjects = computed(() => {
    const currentTag = this.selectedTag();
    const projects = this.site.texts().projects;
    if (currentTag === 'all') {
      return projects;
    }

    return projects.filter((project) => project.tags.includes(currentTag));
  });

  readonly modalProject = computed(() => {
    const id = this.openedProjectId();
    if (id === null) return null;
    return this.site.texts().projects.find((project) => project.id === id) ?? null;
  });

  constructor() {
    effect(() => {
      this.title.setTitle(this.site.pageTitle('index'));
    });
  }

  setLanguage(lang: 'uk' | 'en'): void {
    this.site.setLanguage(lang);
  }

  toggleTheme(): void {
    this.site.toggleTheme();
  }

  setTag(tag: string): void {
    this.selectedTag.set(tag);
  }

  openModal(project: ProjectItem): void {
    this.openedProjectId.set(project.id);
  }

  closeModal(): void {
    this.openedProjectId.set(null);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackToTop.set(window.scrollY > 300);
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
