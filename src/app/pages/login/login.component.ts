import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private router: Router, // Router sudah diinject
    private authService: AuthService // Inject AuthService
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.username || !this.password) {
      alert('Username dan password wajib diisi');
      return;
    }

    const users: { username: string; password: string }[] =
      JSON.parse(localStorage.getItem('users') || '[]');

    const matched = users.find(
      u => u.username === this.username && u.password === this.password
    );

    if (matched) {
      // Panggil authService.login()
      // Biarkan AuthService yang mengatur localStorage dan navigasi
      this.authService.login('/home'); // Atau ke returnUrl jika ada
      // localStorage.setItem('isLoggedIn', 'true'); // Tidak perlu lagi di sini
      // this.router.navigate(['/home']); // Tidak perlu lagi di sini
    } else {
      alert('Username atau password salah');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  // ... (checkUsers bisa tetap ada untuk debugging Anda)
}