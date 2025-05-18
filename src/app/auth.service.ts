// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs'; // Ditambahkan kembali jika isAuthenticated() masih digunakan

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  }

  // Jika Anda masih memerlukan versi Observable untuk beberapa kasus, misalnya di AuthGuard
  // atau jika ada komponen lain yang subscribe ke status ini.
  // Jika tidak, Anda bisa menghapus metode ini dan impor Observable/of.
  isAuthenticated(): Observable<boolean> {
    return of(this.isLoggedIn());
  }

  login(navigateTo: string = '/home'): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate([navigateTo]);
    }
  }

  logout(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem('isLoggedIn');
      this.router.navigate(['/login']);
    }
  }
}