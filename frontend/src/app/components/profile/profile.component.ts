import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  isLoading: boolean = true;
  isEditing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showUserMenu: boolean = false;

  profileData = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuth();
    this.loadUserProfile();
  }

  checkAuth() {
    const token = localStorage.getItem('userToken');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  }

  loadUserProfile() {
    const token = localStorage.getItem('userToken');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    this.http.get('https://cr7-foods.onrender.com/api/user/profile', { headers }).subscribe({
      next: (response: any) => {
        console.log('Profile loaded:', response);
        if (response.user) {
          this.currentUser = response.user;
          this.profileData = {
            name: response.user.name || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            address: response.user.address || ''
          };
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile data';
      }
    });
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProfile() {
    const token = localStorage.getItem('userToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    this.http.put('https://cr7-foods.onrender.com/api/user/profile', this.profileData, { headers }).subscribe({
      next: (response: any) => {
        console.log('Profile updated:', response);
        this.successMessage = 'Profile updated successfully!';
        this.isEditing = false;
        // Reload profile data
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Failed to update profile';
      }
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  toggleUserMenu() {
    // Implementation for user menu
  }

  closeUserMenu() {
    // Implementation for closing user menu
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userToken');
      this.router.navigate(['/home']);
    }
  }
}
