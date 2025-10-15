import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('http://localhost:5000/api/user/login', this.loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Login successful:', response);

        if (response.token) {
          // Store token in localStorage
          localStorage.setItem('userToken', response.token);

          this.successMessage = 'Login successful! Redirecting to homepage...';

          // Redirect to home page after successful login
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1500);
        } else {
          this.errorMessage = 'Invalid response from server';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);

        if (err.status === 400) {
          this.errorMessage = 'Invalid email or password';
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
}
