import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrdersService } from '../../../services/orders.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  // Modal states
  showOrderModal: boolean = false;
  selectedOrder: any = null;

  constructor(private http: HttpClient, private ordersService: OrdersService) {}

  ngOnInit() {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = '/admin/login';
      return;
    }

    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.error = null;

    // Use the OrdersService which has proper headers
    this.ordersService.getAllOrders().subscribe({
      next: (response: any) => {
        console.log('Orders API response:', response);
        // Expecting response to be { orders: [...] }
        this.orders = Array.isArray(response) ? response : (response?.orders || []);
        console.log('Orders loaded:', this.orders.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Check admin authentication.';
        this.orders = []; // Ensure it's an array on error
        this.isLoading = false;
        alert('Admin authentication failed. Please login again.');
        window.location.href = '/admin/login';
      }
    });
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    // Use the OrdersService to update order status
    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        // Status updated successfully
        console.log('Order status updated');
        alert('Order status updated successfully!');
        this.loadOrders(); // Reload to get updated data
      },
      error: (err: any) => {
        console.error('Error updating order status:', err);
        alert('Failed to update order status. Please try again.');
        this.loadOrders(); // Reload to revert changes
      }
    });
  }

  viewOrderDetails(order: any) {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  deleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.ordersService.deleteOrder(orderId).subscribe({
        next: () => {
          alert('Order deleted successfully!');
          this.loadOrders(); // Reload the list
        },
        error: (err) => {
          console.error('Error deleting order:', err);
          alert('Failed to delete order');
        }
      });
    }
  }

  trackByOrder(index: number, order: any): string {
    return order._id;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-600';
      case 'preparing': return 'bg-blue-600/20 text-blue-600';
      case 'delivered': return 'bg-green-600/20 text-green-600';
      default: return 'bg-gray-600/20 text-gray-600';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'preparing': return 'fas fa-cog';
      case 'delivered': return 'fas fa-check-circle';
      default: return 'fas fa-clock';
    }
  }

  logout() {
    // Clear admin token from localStorage
    localStorage.removeItem('adminToken');

    // Navigate to admin login page
    window.location.href = '/admin/login';
  }
}
