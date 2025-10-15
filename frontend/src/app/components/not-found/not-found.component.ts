import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-black text-white">
      <div class="text-center">
        <h1 class="text-8xl font-bold text-red-600 mb-8">404</h1>
        <h2 class="text-4xl font-bold mb-4">Page Not Found</h2>
        <p class="text-xl text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <a routerLink="/home" class="btn-primary">
          Go Home
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {}
