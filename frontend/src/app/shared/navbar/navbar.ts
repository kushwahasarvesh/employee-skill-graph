import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly menuOpen = signal(false);

  readonly links = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/employees', label: 'Employees', exact: false },
    { path: '/skills', label: 'Skills', exact: false },
    { path: '/projects', label: 'Projects', exact: false },
    { path: '/graph', label: 'Graph', exact: false },
    { path: '/relationships', label: 'Relationships', exact: false },
    { path: '/recommendations', label: 'Recommendations', exact: false },
    { path: '/shortest-path', label: 'Shortest Path', exact: false },
  ] as const;

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
