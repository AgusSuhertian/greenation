import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  constructor(private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();

    // Periksa apakah username dan password sudah terisi
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
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/home']);
    } else {
      alert('Username atau password salah');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  checkUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Data users dari localStorage:', users);
    alert(JSON.stringify(users, null, 2));
  }
}
