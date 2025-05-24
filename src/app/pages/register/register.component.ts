import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { UserCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(registerForm: NgForm): Promise<void> {
    if (registerForm.invalid) {
      this.errorMessage = "Harap isi semua field yang wajib diisi dengan benar.";
      Object.values(registerForm.controls).forEach(control => control.markAsTouched());
      return;
    }
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = "Password dan konfirmasi password tidak cocok.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    console.log('[RegisterComponent] Data yang akan dikirim untuk registrasi:', {
        email: this.registerData.email,
        password: '***', 
        username: this.registerData.username,
        fullName: this.registerData.fullName
    });

    try {
      const userCredential: UserCredential = await this.authService.register({
        email: this.registerData.email.trim(),
        password: this.registerData.password,
        username: this.registerData.username ? this.registerData.username.trim() : undefined,
        fullName: this.registerData.fullName ? this.registerData.fullName.trim() : undefined
      });

      const user = userCredential.user;
      console.log('[RegisterComponent] Panggilan authService.register selesai, user:', user);

      if (user) {
         this.successMessage = `Registrasi untuk ${user.email} berhasil!`;
        if (!user.emailVerified &&  false ) {this.successMessage += " Silakan periksa email Anda untuk konfirmasi.";
            setTimeout(() => { this.router.navigate(['/login']); }, 3500);
        } else {
            this.successMessage += " Anda akan diarahkan...";
          }
        registerForm.resetForm(); 
        this.registerData = { username: '', fullName: '', email: '', password: '', confirmPassword: '' };

      } else {
             this.errorMessage = "Registrasi berhasil tetapi data pengguna tidak diterima.";
      }

    } catch (error: any) {
      console.error('[RegisterComponent] Error saat registrasi:', error);
      this.errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui saat registrasi.';
      if (error && typeof error.code === 'string') {
        const errorCode = error.code as string;
        if (errorCode === 'auth/email-already-in-use') {
          this.errorMessage = 'Alamat email ini sudah terdaftar.';
        } else if (errorCode === 'auth/weak-password') {
          this.errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
        }
        }
    } finally {
      this.isSubmitting = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
