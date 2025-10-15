import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen overflow-hidden">
      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-600/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="text-2xl font-bold text-gradient">CR7 FOODS</div>
            <div class="hidden md:flex space-x-8">
              <a routerLink="/home" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Home</a>
              <a routerLink="/menu" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Menu</a>
              <a routerLink="/orders" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Orders</a>
              <a routerLink="/about" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">About</a>
              <a routerLink="/contact" routerLinkActive="text-red-600" class="hover:text-red-600 transition-colors">Contact</a>
            </div>
            <div class="flex space-x-4 items-center">
              <!-- Show cart if logged in -->
              <a routerLink="/cart" class="btn-secondary text-sm px-4 py-2 mr-2" *ngIf="isLoggedIn()">
                <i class="fas fa-shopping-cart mr-1"></i>
                Cart
              </a>
              <!-- User menu if logged in -->
              <div class="relative" *ngIf="isLoggedIn()">
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
              <div *ngIf="!isLoggedIn()">
                <a routerLink="/login" class="btn-secondary text-sm px-4 py-2">Login</a>
                <a routerLink="/register" class="btn-primary text-sm px-4 py-2 ml-2">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div class="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent"></div>
        <canvas id="heroCanvas" class="three-canvas"></canvas>

        <div class="container mx-auto px-4 text-center relative z-10">
          <div class="max-w-4xl mx-auto">
            <h1 class="text-6xl md:text-8xl font-black text-gradient mb-6 animate-fade-in">
              CR7 FOODS
            </h1>
            <p class="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up">
              Experience Culinary Excellence Like Never Before
            </p>
            <p class="text-lg text-gray-400 mb-8 slide-up">
              Premier delivery with authentic flavors from world-class cuisine
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/menu" class="btn-primary text-lg px-8 py-4 animate-bounce">
                Explore Our Menu
              </a>
              <button class="btn-outline text-lg px-8 py-4" (click)="scrollToFeatures()">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div class="w-6 h-10 border-2 border-red-600 rounded-full flex justify-center">
            <div class="w-1 h-3 bg-red-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 px-4">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl md:text-6xl font-bold text-center text-gradient mb-16 fade-in">
            Why Choose CR7 Foods?
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="card text-center slide-up">
              <div class="text-6xl mb-6">⚡</div>
              <h3 class="text-2xl font-bold text-red-600 mb-4">Lightning Fast</h3>
              <p class="text-gray-400">Get your favorite dishes delivered in 30 minutes or less</p>
            </div>

            <div class="card text-center slide-up">
              <div class="text-6xl mb-6">🌟</div>
              <h3 class="text-2xl font-bold text-red-600 mb-4">Chef Curated</h3>
              <p class="text-gray-400">Every dish crafted by Michelin-star inspired chefs</p>
            </div>

            <div class="card text-center slide-up">
              <div class="text-6xl mb-6">💯</div>
              <h3 class="text-2xl font-bold text-red-600 mb-4">Premium Quality</h3>
              <p class="text-gray-400">Only the finest ingredients and impeccable presentation</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Top Picks Section -->
      <section class="py-20 px-4 bg-gray-900/50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-4xl md:text-5xl font-bold text-center mb-16 fade-in">
            This Week's Top Picks
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="card hover-lift" *ngFor="let item of featuredFoods">
              <div class="relative mb-4">
                <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'" [alt]="item.name" class="w-full h-48 object-cover rounded-lg">
                <div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm">
                  ₹{{item.price}}
                </div>
              </div>
              <h3 class="text-xl font-bold mb-2">{{item.name}}</h3>
              <p class="text-gray-400 mb-4">{{item.description}}</p>
              <button class="btn-primary text-sm w-full">
                Add to Cart
              </button>
            </div>
          </div>

          <div class="text-center mt-12">
            <a routerLink="/menu" class="btn-outline">
              View Full Menu
            </a>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 px-4 bg-gradient-to-r from-red-600 to-red-700">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to Order?
          </h2>
          <p class="text-xl text-white/90 mb-8">
            Join thousands of satisfied customers who love CR7 Foods
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/register" class="btn-secondary bg-white text-black hover:bg-gray-100">
              Create Account
            </a>
            <button class="btn-primary border-2 border-white text-white hover:bg-white hover:text-red-600">
              Order as Guest
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredFoods: any[] = [];
  isLoading: boolean = true;
  showUserMenu: boolean = false;

  private cleanupFunctions: (() => void)[] = [];

  constructor(private http: HttpClient, private router: Router) {
    // Simulate order status updates for live tracking
    this.simulateOrderStatusUpdates();
  }

  ngOnInit() {
    this.loadFeaturedFoods();
  }

  loadFeaturedFoods() {
    this.isLoading = true;
    this.http.get('https://cr7-foods.onrender.com/api/foods').subscribe({
      next: (response: any) => {
        console.log('Home featured foods response:', response);
        const foodsArray = response.foods || response || [];
        const validFoods = Array.isArray(foodsArray) ? foodsArray : [];
        // Get first 3 available foods as featured items
        this.featuredFoods = validFoods.filter(food => food.available).slice(0, 3);
        console.log('Featured foods loaded:', this.featuredFoods.length, 'items');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading featured foods:', err);
        this.featuredFoods = []; // Ensure it's an array on error
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
  }

  trackByFoodId(index: number, food: any): string {
    return food._id || index;
  }

  scrollToFeatures() {
    if (typeof window === 'undefined') return;
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
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
    this.showUserMenu = false;
    this.router.navigate(['/home']);
  }

  private simulateOrderStatusUpdates() {
    // Simulate live order status updates for demo purposes
    if (this.isLoggedIn()) {
      setTimeout(() => {
        console.log('📱 Live Order Status: Order #1234 - Preparing your delicious meal...');
      }, 2000);

      setTimeout(() => {
        console.log('🚴 Live Order Status: Order #1234 - Rider is on the way!');
      }, 5000);

      setTimeout(() => {
        console.log('✅ Live Order Status: Order #1234 - Delivered successfully!');
      }, 8000);
    }
  }
}
