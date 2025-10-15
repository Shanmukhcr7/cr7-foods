import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerData = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  };

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register() {
    // Validate form
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password || !this.registerData.phone) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare data for API
    const userData = {
      name: this.registerData.name,
      email: this.registerData.email,
      password: this.registerData.password,
      phone: this.registerData.phone,
      address: this.registerData.address
    };

    this.http.post('http://localhost:5000/api/user/register', userData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Registration successful:', response);

        if (response.token) {
          this.successMessage = 'Account created successfully! Redirecting to login...';

          // Redirect to login page after successful registration
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration error:', err);

        if (err.status === 400 && err.error.message === 'User already exists with this email') {
          this.errorMessage = 'An account with this email already exists';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
