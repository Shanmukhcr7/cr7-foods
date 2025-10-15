import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OrdersService } from '../../../services/orders.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentTime: Date = new Date();
  currentDate: Date = new Date();

  // Dashboard data from API
  totalOrders: number = 0;
  totalRevenue: number = 0;
  totalUsers: number = 0;
  totalFoods: number = 0;

  pendingOrders: number = 0;
  preparingOrders: number = 0;
  deliveredOrders: number = 0;

  recentOrders: any[] = [];
  topSellingItems: any[] = [];

  // Loading states
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private http: HttpClient, private ordersService: OrdersService) {}

  ngOnInit() {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = '/admin/login';
      return;
    }

    // Load dashboard data using API
    this.loadDashboardData();

    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    // Use the backend dashboard API endpoint directly
    this.loadDashboardStats();

    // Load orders separately for recent orders section
    this.loadDashboardOrders();
  }

  loadDashboardStats() {
    const token = localStorage.getItem('adminToken');
    this.http.get('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (response: any) => {
        console.log('Dashboard API response:', response);
        this.totalOrders = response.stats?.totalOrders || 0;
        this.totalRevenue = response.stats?.totalRevenue || 0;
        this.totalUsers = response.stats?.totalUsers || 0;
        this.totalFoods = response.stats?.totalFoods || 0;

        // Calculate order status counts from recent orders
        if (response.recentOrders) {
          this.calculateStatsFromOrders(response.recentOrders);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.error = 'Failed to load dashboard data';
        this.isLoading = false;
        // Fallback to manual calculation if API fails
        this.loadOrders();
        this.loadFoods();
        setTimeout(() => {
          this.loadRevenue();
        }, 500);
      }
    });
  }

  loadDashboardOrders() {
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        const ordersArray = Array.isArray(orders) ? orders : [];
        this.pendingOrders = ordersArray.filter(order => order.status === 'pending').length;
        this.preparingOrders = ordersArray.filter(order => order.status === 'preparing').length;
        this.deliveredOrders = ordersArray.filter(order => order.status === 'delivered').length;

        // Get recent orders (last 5)
        this.recentOrders = ordersArray
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Calculate top selling items
        this.calculateTopSellingItems(ordersArray);
      },
      error: (err) => {
        console.error('Error loading dashboard orders:', err);
        this.pendingOrders = 0;
        this.preparingOrders = 0;
        this.deliveredOrders = 0;
        this.recentOrders = [];
      }
    });
  }

  calculateStatsFromOrders(orders: any[]) {
    this.pendingOrders = orders.filter(order => order.status === 'pending').length;
    this.preparingOrders = orders.filter(order => order.status === 'preparing').length;
    this.deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  }

  loadOrders() {
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        const ordersArray = Array.isArray(orders) ? orders : [];
        this.totalOrders = ordersArray.length;
        this.pendingOrders = ordersArray.filter(order => order.status === 'pending').length;
        this.preparingOrders = ordersArray.filter(order => order.status === 'preparing').length;
        this.deliveredOrders = ordersArray.filter(order => order.status === 'delivered').length;

        // Get recent orders (last 5)
        this.recentOrders = ordersArray
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Calculate top selling items
        this.calculateTopSellingItems(ordersArray);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders data';
        // Set default values on error
        this.totalOrders = 0;
        this.pendingOrders = 0;
        this.preparingOrders = 0;
        this.deliveredOrders = 0;
        this.recentOrders = [];
        this.isLoading = false;
      }
    });
  }

  calculateTopSellingItems(orders: any[]) {
    const itemCounts: { [key: string]: { name: string; count: number } } = {};

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.name) {
            if (itemCounts[item.name]) {
              itemCounts[item.name].count += item.qty || 1;
            } else {
              itemCounts[item.name] = { name: item.name, count: item.qty || 1 };
            }
          }
        });
      }
    });

    // Convert to array and sort by count
    this.topSellingItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:5000/api/users').subscribe({
      next: (users) => {
        this.totalUsers = users.length;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  loadFoods() {
    this.http.get<any[]>('http://localhost:5000/api/foods').subscribe({
      next: (foods) => {
        this.totalFoods = foods.length;
      },
      error: (err) => {
        console.error('Error loading foods:', err);
      }
    });
  }

  loadRevenue() {
    this.ordersService.getAllOrders().subscribe({
      next: (orders: any) => {
        const ordersArray = Array.isArray(orders) ? orders : [];
        this.totalRevenue = ordersArray
          .filter((order: any) => order.status === 'delivered')
          .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      },
      error: (err) => {
        console.error('Error loading revenue:', err);
      }
    });
  }

  refreshData() {
    this.loadDashboardData();
  }

  updateOrderStatus(orderId: string, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        console.log('Order status updated successfully');
        // Refresh data to show updated status
        this.loadDashboardData();
      },
      error: (err: any) => {
        console.error('Error updating order status:', err);
        alert('Failed to update order status. Please try again.');
      }
    });
  }

  logout() {
    // Clear admin token from localStorage
    localStorage.removeItem('adminToken');

    // Navigate to admin login page
    window.location.href = '/admin/login';
  }
}
