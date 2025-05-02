import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FaunaComponent } from './pages/fauna/fauna.component';
import { FloraComponent } from './pages/flora/flora.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Halaman publik
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Halaman yang dilindungi
  { path: '',      component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'fauna', component: FaunaComponent, canActivate: [AuthGuard] },
  { path: 'flora', component: FloraComponent, canActivate: [AuthGuard] },

  // Jika URL tidak dikenali, arahkan ke home (yang juga dilindungi)
  { path: '**', redirectTo: '' }
];
