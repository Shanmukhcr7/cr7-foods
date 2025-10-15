import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  template: `
    <nav class="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-red-600/20" *ngIf="showNav">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="text-2xl font-bold text-gradient">CR7 FOODS</div>
          <div class="hidden md:flex space-x-8">
            <a routerLink="/home" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Home</a>
            <a routerLink="/menu" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Menu</a>
            <a routerLink="/about" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">About</a>
            <a routerLink="/contact" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Contact</a>
          </div>
          <div class="flex space-x-4 items-center">
            <!-- Show cart if logged in -->
            <a routerLink="/cart" class="btn-secondary text-sm px-4 py-2" *ngIf="isLoggedIn">
              <i class="fas fa-shopping-cart mr-1"></i>
              Cart
            </a>
            <!-- User menu if logged in -->
            <div class="relative" *ngIf="isLoggedIn">
              <button
                (click)="toggleUserMenu()"
                class="flex items-center space-x-2 btn-secondary text-sm px-4 py-2"
              >
                <i class="fas fa-user"></i>
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
              <div
                *ngIf="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
              >
                <a routerLink="/profile" class="block px-4 py-2 hover:bg-gray-700">My Profile</a>
                <button
                  (click)="logout()"
                  class="block w-full text-left px-4 py-2 hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
            <!-- Login/Register if not logged in -->
            <div *ngIf="!isLoggedIn">
              <a routerLink="/login" class="btn-outline text-sm px-4 py-2">Login</a>
              <a routerLink="/register" class="btn-primary text-sm px-4 py-2 ml-2">Sign Up</a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'CR7 Foods';
  isLoggedIn = false;
  showUserMenu = false;
  showNav = true;
  private subscription: any;

  constructor(private router: Router) {
    this.checkLoginStatus();
  }

  ngOnInit() {
    // Listen to router events to hide nav on auth pages
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const authRoutes = ['/login', '/register', '/admin/login'];
        this.showNav = !authRoutes.includes(event.url);
        this.checkLoginStatus();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Close user menu on document click
    document.removeEventListener('click', this.closeUserMenu);
  }

  checkLoginStatus() {
    const userToken = localStorage.getItem('userToken');
    this.isLoggedIn = !!userToken;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;

    if (this.showUserMenu) {
      // Add click outside listener
      setTimeout(() => {
        document.addEventListener('click', this.closeUserMenu.bind(this));
      });
    }
  }

  closeUserMenu() {
    this.showUserMenu = false;
    document.removeEventListener('click', this.closeUserMenu);
  }

  logout() {
    localStorage.removeItem('userToken');
    this.isLoggedIn = false;
    this.showUserMenu = false;
    this.router.navigate(['/home']);
  }
}
