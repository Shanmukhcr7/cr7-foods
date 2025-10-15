import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import gsap from 'gsap';

interface OrderItem {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string; // Allow dynamic status changes for demo
  deliveryAddress: string;
  phone: string;
  paymentMethod: string;
  createdAt: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-white">
      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-red-600/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="text-2xl font-bold text-gradient">CR7 FOODS</div>
            <div class="hidden md:flex space-x-8">
              <a routerLink="/home" class="hover:text-red-600 transition-colors">Home</a>
              <a routerLink="/menu" class="hover:text-red-600 transition-colors">Menu</a>
              <a routerLink="/orders" class="text-red-600">Orders</a>
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
                  <a routerLink="/orders" routerLinkActive="text-red-600" class="block px-4 py-2 hover:bg-gray-700">My Orders</a>
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

      <!-- Orders Header -->
      <section class="pt-24 pb-12 px-4">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-gradient mb-4">
            My Orders
          </h1>
          <p class="text-xl text-gray-300">
            Track your order history and live order status
          </p>
        </div>
      </section>

      <!-- Orders Content -->
      <section class="pb-20 px-4">
        <div class="max-w-7xl mx-auto">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-20">
            <div class="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-400">Loading your orders...</p>
          </div>

          <!-- No Orders -->
          <div *ngIf="!isLoading && orders.length === 0" class="text-center py-20">
            <div class="max-w-md mx-auto">
              <i class="fas fa-shopping-bag text-6xl text-gray-600 mb-6"></i>
              <h2 class="text-3xl font-bold mb-4">No orders yet</h2>
              <p class="text-gray-400 mb-8">
                You haven't placed any orders yet. Start by exploring our delicious menu!
              </p>
              <a routerLink="/menu" class="btn-primary">
                <i class="fas fa-utensils mr-2"></i>
                Browse Menu
              </a>
            </div>
          </div>

          <!-- Orders List -->
          <div *ngIf="!isLoading && orders.length > 0" class="space-y-8">
            <!-- Order Status Cards -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <!-- Active Orders -->
              <div class="bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl p-6 border border-blue-600/20">
                <div class="flex items-center mb-4">
                  <i class="fas fa-clock text-blue-600 text-2xl mr-3"></i>
                  <h3 class="text-xl font-bold">Active Orders</h3>
                </div>
                <div class="space-y-2">
                  <div *ngFor="let order of activeOrders" class="flex justify-between items-center">
                    <span class="text-sm">#{{ order._id.slice(-6).toUpperCase() }}</span>
                    <span class="text-blue-600 font-semibold">{{ order.status }}</span>
                  </div>
                </div>
              </div>

              <!-- Order Statistics -->
              <div class="bg-gradient-to-br from-green-600/20 to-green-600/10 rounded-xl p-6 border border-green-600/20">
                <div class="flex items-center mb-4">
                  <i class="fas fa-chart-line text-green-600 text-2xl mr-3"></i>
                  <h3 class="text-xl font-bold">Statistics</h3>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>Total Orders:</span>
                    <span class="text-green-600 font-bold">{{ orders.length }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Total Spent:</span>
                    <span class="text-green-600 font-bold">₹{{ getTotalSpent() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Delivered:</span>
                    <span class="text-green-600 font-bold">{{ getDeliveredCount() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- All Orders -->
            <div class="space-y-6">
              <h2 class="text-2xl font-bold mb-6">Order History</h2>

              <div *ngFor="let order of orders; trackBy: trackByOrder" class="bg-gray-800 rounded-xl overflow-hidden order-card" [attr.data-status]="order.status">
                <!-- Order Header -->
                <div class="bg-gray-700 px-6 py-4">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-bold text-lg">Order #{{ order._id.slice(-6).toUpperCase() }}</div>
                      <div class="text-sm text-gray-400">{{ formatDate(order.createdAt) }}</div>
                    </div>
                    <div class="flex items-center space-x-4">
                      <div class="text-right">
                        <div class="text-lg font-bold text-red-600">₹{{ order.totalAmount }}</div>
                        <div class="text-sm text-gray-400">{{ order.paymentMethod }}</div>
                      </div>
                      <div class="text-right">
                        <div class="order-status" [class]="getStatusClass(order.status)">
                          <i [class]="getStatusIcon(order.status)" class="mr-1"></i>
                          {{ getStatusText(order.status) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="px-6 py-4">
                  <div class="space-y-3">
                    <div *ngFor="let item of order.items" class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                      <div>
                        <div class="font-semibold">{{ item.name }}</div>
                        <div class="text-sm text-gray-400">{{ item.quantity }} × ₹{{ item.price }}</div>
                      </div>
                      <div class="font-semibold text-red-600">₹{{ item.quantity * item.price }}</div>
                    </div>
                  </div>
                </div>

                <!-- Order Footer -->
                <div class="px-6 py-4 bg-gray-700">
                  <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-400">
                      <i class="fas fa-map-marker-alt mr-1"></i>
                      {{ order.deliveryAddress }}
                    </div>
                    <div class="text-sm text-gray-400">
                      <i class="fas fa-phone mr-1"></i>
                      {{ order.phone }}
                    </div>
                  </div>
                </div>

                <!-- Live Status Animation (for active orders) -->
                <div *ngIf="order.status !== 'delivered' && order.status !== 'cancelled'" class="px-6 py-4 bg-blue-600/10 border-t border-blue-600/20">
                  <div class="status-animation">
                    <div class="flex items-center justify-center space-x-4">
                      <!-- Status Steps -->
                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center" [class.active]="order.status === 'pending' || order.status === 'preparing' || order.status === 'delivered'">
                          <i class="fas fa-check text-white text-xs"></i>
                        </div>
                        <div class="text-sm">Confirmed</div>
                      </div>

                      <div class="w-8 h-0.5 bg-gray-600 flex-1"></div>

                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center" [class.active]="order.status === 'preparing' || order.status === 'delivered'">
                          <i class="fas fa-cog text-white text-xs"></i>
                        </div>
                        <div class="text-sm">Preparing</div>
                      </div>

                      <div class="w-8 h-0.5 bg-gray-600 flex-1"></div>

                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center" [class.active]="order.status === 'delivered'">
                          <i class="fas fa-truck text-white text-xs"></i>
                        </div>
                        <div class="text-sm">Out for Delivery</div>
                      </div>

                      <div class="w-8 h-0.5 bg-gray-600 flex-1"></div>

                      <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center" [class.active]="order.status === 'delivered'">
                          <i class="fas fa-check text-white text-xs"></i>
                        </div>
                        <div class="text-sm">Delivered</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    .order-card {
      transition: all 0.3s ease;
    }

    .order-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .order-status {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-pending { background: #feebc8; color: #c05621; }
    .status-preparing { background: #bee3f8; color: #2c5282; }
    .status-delivered { background: #c6f6d5; color: #22543d; }
    .status-cancelled { background: #fed7d7; color: #822727; }

    .order-card[data-status="pending"] .status-animation {
      background: linear-gradient(90deg, #feebc8, #cbb044);
    }

    .order-card[data-status="preparing"] .status-animation {
      background: linear-gradient(90deg, #bee3f8, #44a3cb);
    }

    .step-line {
      position: relative;
      height: 4px;
      background: #374151;
      border-radius: 2px;
    }

    .step-line.active {
      background: linear-gradient(90deg, #10b981, #059669);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .7; }
    }
  `]
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  orders: Order[] = [];
  isLoading: boolean = true;
  showUserMenu: boolean = false;
  private animationInterval: any;

  constructor(
    private router: Router,
    private ordersService: OrdersService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('userToken');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadOrders();
  }

  ngAfterViewInit() {
    this.initGSAPAnimations();
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  loadOrders() {
    this.isLoading = true;
    this.ordersService.getUserOrders().subscribe({
      next: (response: any) => {
        this.orders = response.orders || [];
        console.log('Orders loaded:', this.orders.length);
        this.isLoading = false;

        // Start live status updates for active orders
        this.startLiveStatusUpdates();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.orders = [];
        this.isLoading = false;
      }
    });
  }

  get activeOrders(): Order[] {
    return this.orders.filter(order =>
      order.status === 'pending' ||
      order.status === 'preparing'
    );
  }

  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.totalAmount, 0);
  }

  getDeliveredCount(): number {
    return this.orders.filter(order => order.status === 'delivered').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'fas fa-hourglass-start';
      case 'preparing': return 'fas fa-cog fa-spin';
      case 'delivered': return 'fas fa-check-circle';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-hourglass-start';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  private startLiveStatusUpdates() {
    // Simulate live status updates every 5 seconds for demo
    this.animationInterval = setInterval(() => {
      this.updateOrderStatuses();
    }, 5000);
  }

  private updateOrderStatuses() {
    // Removed demo status progression - now only admin can update order statuses
    // This prevents fake status updates and ensures proper admin control
  }

  initGSAPAnimations() {
    // GSAP animations for order cards - simple implementation
    try {
      const orderCards = document.querySelectorAll('.order-card');
      if (orderCards && orderCards.length > 0) {
        // Simple fade in animation without GSAP for now to avoid TypeScript issues
        orderCards.forEach((card, index) => {
          (card as HTMLElement).style.transition = 'all 0.6s ease';
          setTimeout(() => {
            (card as HTMLElement).style.opacity = '1';
            (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
          }, index * 100);
        });
      }
    } catch (error) {
      console.warn('Animation error:', error);
    }
  }

  trackByOrder(index: number, order: any): string {
    return order._id;
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
