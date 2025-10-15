import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  showUserMenu: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCart();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  loadCart() {
    // Load cart from localStorage
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        this.cart = JSON.parse(cartData);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        this.cart = [];
      }
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  trackByCartItem(index: number, item: any): string {
    return item._id || index;
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  updateQuantity(item: CartItem, quantity: number) {
    const newQuantity = Math.max(1, quantity);
    const existingItem = this.cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      existingItem.quantity = newQuantity;
      this.saveCart();
    }
  }

  removeItem(item: CartItem) {
    if (confirm(`Remove ${item.name} from cart?`)) {
      this.cart = this.cart.filter(cartItem => cartItem._id !== item._id);
      this.saveCart();
    }
  }

  clearCart() {
    if (confirm('Clear all items from cart?')) {
      this.cart = [];
      this.saveCart();
    }
  }

  proceedToCheckout() {
    if (!this.isLoggedIn) {
      alert('Please login to proceed with checkout');
      this.router.navigate(['/login']);
      return;
    }

    if (this.cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/menu']);
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
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userToken');
      this.showUserMenu = false;
      this.router.navigate(['/home']);
    }
  }
}
