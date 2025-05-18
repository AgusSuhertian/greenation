// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('isLoggedIn'); // Hapus status login
    this.router.navigate(['/login']);      // Arahkan ke halaman login
  }
}
