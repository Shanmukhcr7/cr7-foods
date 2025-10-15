import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class AdminLoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<any>('https://cr7-foods.onrender.com/api/admin/login', this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.token) {
          // Store token in localStorage
          localStorage.setItem('adminToken', response.token);

          this.successMessage = 'Login successful! Redirecting to dashboard...';

          // Redirect to admin dashboard after short delay
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1500);
        } else {
          this.errorMessage = 'Invalid response from server';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);

        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Auto-fill demo credentials for testing
  fillDemoCredentials() {
    this.loginData = {
      username: 'admin',
      password: 'admin123'
    };
  }
}
