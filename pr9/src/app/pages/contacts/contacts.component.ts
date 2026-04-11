import { CommonModule } from '@angular/common';
import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SiteStateService } from '../../services/site-state.service';

@Component({
  selector: 'app-contacts-page',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './contacts.component.html'
})
export class ContactsComponent {
  readonly site = inject(SiteStateService);
  private readonly title = inject(Title);

  readonly showBackToTop = signal(false);
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  constructor() {
    effect(() => {
      this.title.setTitle(this.site.pageTitle('contacts'));
    });
  }

  setLanguage(lang: 'uk' | 'en'): void {
    this.site.setLanguage(lang);
  }

  toggleTheme(): void {
    this.site.toggleTheme();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackToTop.set(window.scrollY > 300);
  }
}
