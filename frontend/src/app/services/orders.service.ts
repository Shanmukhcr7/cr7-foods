import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private baseUrl = 'https://cr7-foods.onrender.com/api';

  constructor(private http: HttpClient) {}

  private getUserHeaders() {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getAdminHeaders() {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  placeOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, orderData, { headers: this.getUserHeaders() });
  }

  getUserOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/user-orders`, { headers: this.getUserHeaders() });
  }

  // Admin methods
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/orders`, { headers: this.getAdminHeaders() });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/orders/${orderId}`, { status: status }, { headers: this.getAdminHeaders() });
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/orders/${orderId}`, { headers: this.getAdminHeaders() });
  }
}
