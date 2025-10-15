import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-white">
      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-600/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="text-2xl font-bold text-gradient">CR7 FOODS</div>
            <div class="hidden md:flex space-x-8">
              <a routerLink="/home" class="hover:text-red-600 transition-colors">Home</a>
              <a routerLink="/menu" class="hover:text-red-600 transition-colors">Menu</a>
              <a routerLink="/orders" class="hover:text-red-600 transition-colors">Orders</a>
              <a routerLink="/about" class="hover:text-red-600 transition-colors">About</a>
              <a routerLink="/contact" class="hover:text-red-600 transition-colors">Contact</a>
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

      <!-- Menu Header -->
      <section class="pt-24 pb-12 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <h1 class="text-5xl md:text-7xl font-black text-gradient mb-6">
            Our Menu
          </h1>
          <p class="text-xl text-gray-300 mb-8">
            Discover our chef-curated selection of delicious dishes
          </p>

          <!-- Search and Filter -->
          <div class="max-w-2xl mx-auto mb-12">
            <div class="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search for dishes..."
                class="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600"
              >
              <select class="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600">
                <option value="">All Categories</option>
                <option value="pizza">Pizza</option>
                <option value="burger">Burgers</option>
                <option value="pasta">Pasta</option>
                <option value="desserts">Desserts</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Menu Items -->
      <section class="pb-20 px-4">
        <div class="max-w-7xl mx-auto">
          <!-- Categories -->
          <div class="flex flex-wrap justify-center gap-4 mb-12">
            <button class="category-btn active px-6 py-3 rounded-full border-2 border-red-600 text-red-600 bg-red-600/10">
              All Items
            </button>
            <button class="category-btn px-6 py-3 rounded-full border-2 border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors">
              🍕 Pizza
            </button>
            <button class="category-btn px-6 py-3 rounded-full border-2 border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors">
              🍔 Burgers
            </button>
            <button class="category-btn px-6 py-3 rounded-full border-2 border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors">
              🍝 Pasta
            </button>
            <button class="category-btn px-6 py-3 rounded-full border-2 border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors">
              🧁 Desserts
            </button>
            <button class="category-btn px-6 py-3 rounded-full border-2 border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors">
              🥤 Drinks
            </button>
          </div>

          <!-- Menu Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="!isLoading && foods.length > 0; else noFoodsTemplate">
            <div class="menu-item bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors" *ngFor="let food of foods; trackBy: trackByFoodId">
              <div class="relative mb-4">
                <img
                  [src]="food.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'"
                  [alt]="food.name"
                  class="w-full h-48 object-cover rounded-lg"
                >
                <div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm">
                  ₹{{ food.price }}
                </div>
                <div class="absolute top-2 left-2" *ngIf="!food.available">
                  <span class="bg-gray-600 text-white px-2 py-1 rounded-full text-xs">Out of Stock</span>
                </div>
              </div>
              <h3 class="text-xl font-bold mb-2">{{ food.name }}</h3>
              <p class="text-gray-400 mb-4">{{ food.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <button class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors">
                    -
                  </button>
                  <span class="text-lg font-semibold">1</span>
                  <button class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-colors">
                    +
                  </button>
                </div>
                <button
                  (click)="addToCart(food)"
                  class="btn-primary px-6 py-2"
                  [disabled]="!food.available"
                >
                  {{ food.available ? 'Add to Cart' : 'Unavailable' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Loading Template -->
          <ng-template #noFoodsTemplate>
            <div class="text-center py-20">
              <div *ngIf="isLoading" class="space-y-4">
                <div class="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-gray-400">Loading menu items...</p>
              </div>
              <div *ngIf="!isLoading && foods.length === 0" class="text-gray-400">
                <i class="fas fa-utensils text-6xl mb-4"></i>
                <p class="text-xl mb-2">No food items available</p>
                <p>Please check back later or contact support</p>
              </div>
            </div>
          </ng-template>

          <!-- Load More Button -->
          <div class="text-center mt-12">
            <button class="btn-outline px-8 py-3">
              Load More Items
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-black py-12 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <div class="text-3xl font-bold text-gradient mb-4">CR7 FOODS</div>
          <p class="text-gray-400 mb-6">Delivering happiness, one meal at a time</p>
          <div class="flex justify-center space-x-6">
            <a href="#" class="text-gray-400 hover:text-red-600 transition-colors">
              <i class="fab fa-facebook text-2xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-red-600 transition-colors">
              <i class="fab fa-instagram text-2xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-red-600 transition-colors">
              <i class="fab fa-twitter text-2xl"></i>
            </a>
          </div>
          <div class="border-t border-gray-800 mt-8 pt-8 text-gray-500">
            <p>&copy; 2024 CR7 Foods. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .menu-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class MenuComponent implements OnInit {
  foods: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  showUserMenu: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadFoods();
  }

  addToCart(food: any) {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current cart from localStorage
    const cartData = localStorage.getItem('cart');
    let cart = [];

    if (cartData) {
      try {
        cart = JSON.parse(cartData);
      } catch (error) {
        cart = [];
      }
    }

    // Check if item already exists in cart
    const existingItem = cart.find((item: any) => item._id === food._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        _id: food._id,
        name: food.name,
        price: food.price,
        imageUrl: food.imageUrl,
        quantity: 1
      });
    }

    // Save cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`${food.name} added to cart!`);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  loadFoods() {
    this.isLoading = true;
    this.error = null;

    this.http.get('https://cr7-foods.onrender.com/api/foods').subscribe({
      next: (response: any) => {
        console.log('Menu API response:', response);
        // Handle different response formats
        const foodsArray = response.foods || response || [];
        this.foods = Array.isArray(foodsArray) ? foodsArray : [];
        console.log('Menu loaded:', this.foods.length, 'items');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading foods:', err);
        this.error = 'Failed to load menu items';
        this.foods = []; // Ensure it's an array on error
        this.isLoading = false;
      }
    });
  }

  trackByFoodId(index: number, food: any): string {
    return food._id || index;
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
}
