import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; 
import { FormsModule, NgForm } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../auth.service';
import { UserCredential } from '@angular/fire/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink 
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    email: '', 
    password: ''
  };

  isSubmitting = false; 
  errorMessage: string | null = null; 
  private returnUrl: string; 

  constructor(
    private authService: AuthService, 
    private router: Router,          
    private route: ActivatedRoute    
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    console.log('[LoginComponent] Constructor - Return URL:', this.returnUrl);
  }

    async onSubmit(loginForm: NgForm): Promise<void> {
    console.log('[LoginComponent] onSubmit - Form submitted. Form valid:', loginForm.valid);
    console.log('[LoginComponent] onSubmit - loginData before submit:', this.loginData);

    if (loginForm.invalid) {
      Object.values(loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      this.errorMessage = "Harap isi email dan password dengan benar.";
      console.warn('[LoginComponent] onSubmit - Form tidak valid.');
      return;
    }

    if (!this.loginData.email || !this.loginData.email.trim() || !this.loginData.password) {
      this.errorMessage = "Email dan password tidak boleh kosong.";
      console.warn('[LoginComponent] onSubmit - Email atau password kosong di loginData.');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    console.log('[LoginComponent] onSubmit - Memulai proses login. isSubmitting:', this.isSubmitting);
    console.log('[LoginComponent] onSubmit - Mencoba login dengan data:', {email: this.loginData.email, password: '***'});

    try {
      const userCredential: UserCredential = await this.authService.login({
        email: this.loginData.email.trim(),
        password: this.loginData.password
      });
      console.log('[LoginComponent] onSubmit - Panggilan authService.login selesai.');

      if (userCredential && userCredential.user) {
        console.log('[LoginComponent] Login berhasil, user diterima. Navigasi ke:', this.returnUrl);
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.errorMessage = 'Login gagal. Informasi pengguna tidak diterima dari server.';
        console.warn('[LoginComponent] Login attempt returned no user in credential, but no error was thrown by service.');
      }
    } catch (error: any) {
      console.error('[LoginComponent] Error saat login (lengkap):', error);
      this.errorMessage = error.message || 'Terjadi kesalahan. Periksa kembali email dan password Anda.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.errorMessage = 'Email atau password salah. Silakan coba lagi.';
      } else if (error.code === 'auth/missing-email') {
         this.errorMessage = 'Email tidak boleh kosong.';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Terlalu banyak percobaan login. Akun Anda mungkin terkunci sementara.';
      } else if (error.code === 'auth/network-request-failed') {
        this.errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      }
    } finally {
      this.isSubmitting = false;
      console.log('[LoginComponent] onSubmit - Proses login selesai (finally block). isSubmitting:', this.isSubmitting);
    }
  }

  goToRegister(): void {
    console.log('[LoginComponent] Navigasi ke halaman register.');
    this.router.navigate(['/register']);
  }
}
