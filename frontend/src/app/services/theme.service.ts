import { Injectable, signal } from '@angular/core';
import { Religion } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  selectedReligion = signal<Religion | null>(null);

  setTheme(religion: Religion): void {
    this.selectedReligion.set(religion);
    localStorage.setItem('selectedReligion', JSON.stringify(religion));
    this.applyTheme(religion);
  }

  loadTheme(): void {
    const stored = localStorage.getItem('selectedReligion');
    if (stored) {
      try {
        const religion: Religion = JSON.parse(stored);
        this.selectedReligion.set(religion);
        this.applyTheme(religion);
      } catch {
        localStorage.removeItem('selectedReligion');
      }
    }
  }

  clearTheme(): void {
    localStorage.removeItem('selectedReligion');
    this.selectedReligion.set(null);
    const body = document.body;
    body.className = body.className.replace(/theme-\S+/g, '').trim();
    document.documentElement.removeAttribute('style');
  }

  private applyTheme(religion: Religion): void {
    const body = document.body;
    body.className = body.className.replace(/theme-\S+/g, '').trim();
    body.classList.add(`theme-${religion.code}`);

    const root = document.documentElement;
    root.style.setProperty('--color-primary', religion.colorPrimary);
    root.style.setProperty('--color-secondary', religion.colorSecondary);
    root.style.setProperty('--color-accent', religion.colorAccent);
    root.style.setProperty('--gradient-bg', religion.backgroundGradient);

    const hex = religion.colorPrimary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
  }
}
