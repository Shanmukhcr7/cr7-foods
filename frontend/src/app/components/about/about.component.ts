import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  showUserMenu: boolean = false;

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
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
    localStorage.removeItem('userToken');
    this.showUserMenu = false;
    this.router.navigate(['/home']);
  }
}
