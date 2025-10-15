import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-foods',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.css'
})
export class FoodsComponent implements OnInit {
  foods: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  // Modal states
  showAddModal: boolean = false;
  showEditModal: boolean = false;

  // Current food being edited
  currentFood: any = {
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    available: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadFoods();
  }

  trackByFoodId(index: number, food: any): string {
    return food._id || index;
  }

  loadFoods() {
    this.isLoading = true;
    this.error = null;

    this.http.get('http://localhost:5000/api/foods').subscribe({
      next: (response: any) => {
        console.log('Foods API response:', response);
        // Handle different response formats
        const foodsArray = response.foods || response || [];
        this.foods = Array.isArray(foodsArray) ? foodsArray : [];
        console.log('Foods loaded:', this.foods.length, 'items');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading foods:', err);
        this.error = 'Failed to load food items';
        this.foods = []; // Ensure it's an array on error
        this.isLoading = false;
      }
    });
  }

  editFood(food: any) {
    this.currentFood = { ...food };
    this.showEditModal = true;
    this.showAddModal = false;
  }

  deleteFood(foodId: string) {
    if (confirm('Are you sure you want to delete this food item?')) {
      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      this.http.delete(`http://localhost:5000/api/foods/${foodId}`, { headers }).subscribe({
        next: (response) => {
          console.log('Food deleted successfully:', response);
          alert('Food item deleted successfully!');
          this.loadFoods(); // Reload the list
        },
        error: (err) => {
          console.error('Error deleting food:', err);
          alert('Failed to delete food item. Please check if you are logged in as admin.');
        }
      });
    }
  }

  saveFood() {
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    if (this.showEditModal) {
      // Update existing food
      this.http.put(`http://localhost:5000/api/foods/${this.currentFood._id}`, this.currentFood, { headers }).subscribe({
        next: (response) => {
          console.log('Food updated successfully:', response);
          alert('Food item updated successfully!');
          this.loadFoods();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating food:', err);
          alert('Failed to update food item. Please check if you are logged in as admin.');
        }
      });
    } else {
      // Add new food
      this.http.post('http://localhost:5000/api/foods', this.currentFood, { headers }).subscribe({
        next: (response) => {
          console.log('Food added successfully:', response);
          alert('Food item added successfully!');
          this.loadFoods();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error adding food:', err);
          alert('Failed to add food item. Please check if you are logged in as admin.');
        }
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.currentFood = {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      available: true
    };
  }

  logout() {
    // Clear admin token from localStorage
    localStorage.removeItem('adminToken');

    // Navigate to admin login page
    window.location.href = '/admin/login';
  }
}
