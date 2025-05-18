import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FaunaComponent } from './pages/fauna/fauna.component';
import { FloraComponent } from './pages/flora/flora.component';
import { FaunaDetailComponent } from './pages/fauna-detail/fauna-detail.component';
import { FloraDetailComponent } from './pages/flora-detail/flora-detail.component';


import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Halaman login dan register (tidak membutuhkan AuthGuard)
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Halaman utama yang membutuhkan login
  { path: 'home',   component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'fauna',  component: FaunaComponent, canActivate: [AuthGuard] },
  { path: 'flora',  component: FloraComponent, canActivate: [AuthGuard] },
  { path: 'fauna/:id', component: FaunaDetailComponent, canActivate: [AuthGuard] },
  { path: 'flora/:id', component: FloraDetailComponent, canActivate: [AuthGuard] },

  // Redirect root '/' ke login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Redirect jika path tidak dikenali
  { path: '**', redirectTo: 'login' }
];
