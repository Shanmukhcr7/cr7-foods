import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { gsap } from 'gsap';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-white">
      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-red-600/20">
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
                  <a routerLink="/orders" class="block px-4 py-2 hover:bg-gray-700">My Orders</a>
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
                <a routerLink="/login" class="btn-outline text-sm px-4 py-2">Login</a>
                <a routerLink="/register" class="btn-primary text-sm px-4 py-2 ml-2">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Checkout Header -->
      <section class="pt-24 pb-12 px-4">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Checkout
          </h1>
          <p class="text-xl text-gray-300">
            Complete your order with delivery details
          </p>
        </div>
      </section>

      <!-- Checkout Content -->
      <section class="pb-20 px-4">
        <div class="max-w-7xl mx-auto">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-20">
            <div class="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-400">Processing checkout...</p>
          </div>

          <!-- Checkout Form -->
          <div *ngIf="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Order Summary & Payment -->
            <div class="lg:col-span-2">
              <div class="bg-gray-800 rounded-xl p-6 mb-8">
                <h2 class="text-2xl font-bold mb-6">Order Summary</h2>

                <!-- Cart Items -->
                <div class="space-y-4 mb-6">
                  <div *ngFor="let item of cartItems; trackBy: trackByItem" class="flex justify-between items-center py-4 border-b border-gray-700">
                    <div class="flex items-center space-x-4">
                      <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100'" [alt]="item.name" class="w-12 h-12 object-cover rounded-lg">
                      <div>
                        <h3 class="font-semibold">{{ item.name }}</h3>
                        <p class="text-sm text-gray-400">{{ item.quantity }} × ₹{{ item.price }}</p>
                      </div>
                    </div>
                    <div class="font-semibold text-red-600">₹{{ item.price * item.quantity }}</div>
                  </div>
                </div>

                <!-- Order Totals -->
                <div class="border-t border-gray-700 pt-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-400">Subtotal:</span>
                    <span>₹{{ getSubtotal() }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-400">Delivery Fee:</span>
                    <span>₹40</span>
                  </div>
                  <div class="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span class="text-red-600">₹{{ getTotal() }}</span>
                  </div>
                </div>
              </div>

              <!-- Delivery Details -->
              <div class="bg-gray-800 rounded-xl p-6 mb-8">
                <h2 class="text-2xl font-bold mb-6">Delivery Details</h2>

                <form [formGroup]="deliveryForm" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        formControlName="name"
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                        placeholder="Enter your name"
                        required
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        formControlName="phone"
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                        required
                      >
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Delivery Address</label>
                    <textarea
                      formControlName="address"
                      rows="3"
                      class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                      placeholder="Enter your full delivery address"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Special Instructions</label>
                    <textarea
                      formControlName="instructions"
                      rows="2"
                      class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                      placeholder="Any special delivery instructions..."
                    ></textarea>
                  </div>
                </form>
              </div>

              <!-- Payment Method -->
              <div class="bg-gray-800 rounded-xl p-6">
                <h2 class="text-2xl font-bold mb-6">Payment Method</h2>

                <div class="space-y-4">
                  <div class="flex items-center space-x-3">
                    <input type="radio" id="cod" name="payment" value="cod" class="text-red-600" checked [(ngModel)]="paymentMethod">
                    <label for="cod" class="flex-1">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <i class="fas fa-money-bill-wave text-green-600"></i>
                          <div>
                            <div class="font-semibold">Cash on Delivery</div>
                            <div class="text-sm text-gray-400">Pay when your order arrives</div>
                          </div>
                        </div>
                        <i class="fas fa-check text-green-600" *ngIf="paymentMethod === 'cod'"></i>
                      </div>
                    </label>
                  </div>

                  <div class="flex items-center space-x-3 opacity-50 cursor-not-allowed">
                    <input type="radio" id="online" name="payment" value="online" class="text-red-600" disabled>
                    <label for="online" class="flex-1">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <i class="fas fa-credit-card text-blue-600"></i>
                          <div>
                            <div class="font-semibold">Online Payment</div>
                            <div class="text-sm text-gray-400">Coming soon...</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Confirmation -->
            <div class="lg:col-span-1">
              <div class="bg-gray-800 rounded-xl p-6">
                <h2 class="text-2xl font-bold mb-6">Complete Order</h2>

                <!-- Error Message -->
                <div *ngIf="errorMessage" class="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg mb-6">
                  {{ errorMessage }}
                </div>

                <!-- Place Order Button -->
                <button
                  (click)="placeOrder()"
                  [disabled]="!canPlaceOrder()"
                  class="w-full btn-primary py-4 text-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fas fa-check mr-2"></i>
                  Place Order (₹{{ getTotal() }})
                </button>

                <!-- Terms -->
                <div class="text-sm text-gray-400 mb-6">
                  <p>By placing your order, you agree to our terms and conditions.</p>
                </div>

                <!-- Estimated Delivery -->
                <div class="bg-green-600/20 border border-green-600 rounded-lg p-4">
                  <div class="flex items-center space-x-3">
                    <i class="fas fa-clock text-green-600"></i>
                    <div>
                      <div class="font-semibold text-green-600">Estimated Delivery</div>
                      <div class="text-sm text-gray-300">30 minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  deliveryForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  showUserMenu: boolean = false;
  cartItems: CartItem[] = [];
  paymentMethod: string = 'cod';

  constructor(
    private router: Router,
    private ordersService: OrdersService,
    private fb: FormBuilder
  ) {
    this.deliveryForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      instructions: ['']
    });
  }

  ngOnInit() {
    // Load cart from localStorage
    this.loadCart();
  }

  ngAfterViewInit() {
    // GSAP Order Placement Animations
    this.initGSAPAnimations();
  }

  initGSAPAnimations() {
    // Animation for when order is placed successfully
  }

  playOrderSuccessAnimation() {
    // Create success overlay
    const successOverlay = document.createElement('div');
    successOverlay.id = 'order-success-overlay';
    successOverlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    successOverlay.innerHTML = `
      <div class="bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4">
        <i class="fas fa-check-circle text-green-600 text-6xl mb-4 animate-bounce"></i>
        <h2 class="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p class="text-gray-300 mb-6">Your delicious food will be delivered soon.</p>
        <div class="flex justify-center">
          <div class="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    `;

    // Add to body
    document.body.appendChild(successOverlay);

    // GSAP Animation sequence
    const tl = gsap.timeline();

    // Start with bounce animation on the checkmark
    tl.fromTo(".animate-bounce", {
      scale: 0,
      rotation: -180
    }, {
      scale: 1,
      rotation: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    });

    // Fade in text elements
    tl.fromTo("h2, p", {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.2
    }, "-=0.4");

    // Pulse effect on the loader
    tl.fromTo(".animate-spin", {
      scale: 0
    }, {
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)"
    });

    // Vibrate effect on the overlay
    tl.to("#order-success-overlay", {
      scale: 1.05,
      duration: 0.1,
      yoyo: true,
      repeat: 2,
      ease: "power2.inOut"
    }, "-=0.8");

    // Fade out after 2 seconds
    tl.to("#order-success-overlay", {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        // Remove overlay
        successOverlay.remove();
      }
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  loadCart() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        this.cartItems = JSON.parse(cartData);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        this.cartItems = [];
      }
    }
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotal(): number {
    return this.getSubtotal() + 40; // Add delivery fee
  }

  canPlaceOrder(): boolean {
    return this.cartItems.length > 0;
  }

  placeOrder() {
    if (!this.canPlaceOrder()) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Get user token for order placement
    const token = localStorage.getItem('userToken');
    if (!token) {
      this.errorMessage = 'Please login to place order';
      this.isLoading = false;
      return;
    }

    // Prepare order data
    const formData = this.deliveryForm.value;
    const orderData = {
      items: this.cartItems.map(item => ({
        foodId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: this.getTotal(),
      deliveryAddress: formData.address,
      phone: formData.phone,
      paymentMethod: this.paymentMethod.toUpperCase() // COD instead of cod
    };

    this.ordersService.placeOrder(orderData).subscribe({
      next: (response: any) => {
        console.log('Order placed:', response);
        // GSAP Success Animation
        this.playOrderSuccessAnimation();
        // Clear cart
        localStorage.removeItem('cart');
        this.cartItems = [];
        // Redirect to orders page after animation
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error placing order:', err);
        this.errorMessage = 'Failed to place order. Please try again.';
        this.isLoading = false;
      }
    });
  }

  trackByItem(index: number, item: any): string {
    return item._id || index;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;

    if (this.showUserMenu) {
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
