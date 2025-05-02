import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const username = (form.querySelector('#username') as HTMLInputElement).value.trim();
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    const confirm  = (form.querySelector('#confirm')  as HTMLInputElement).value;

    if (!username || !password) {
      alert('Username dan password wajib diisi');
      return;
    }
    if (password !== confirm) {
      alert('Password dan konfirmasi tidak cocok');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.username === username)) {
      alert('Username sudah terdaftar');
      return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registrasi berhasil! Silakan login.');
    this.router.navigate(['/login']);
  }
}
