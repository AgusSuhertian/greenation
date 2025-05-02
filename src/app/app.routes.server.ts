import { Routes } from '@angular/router';
import { LoginComponent }    from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent }     from './pages/home/home.component';
import { FaunaComponent }    from './pages/fauna/fauna.component';
import { FloraComponent }    from './pages/flora/flora.component';
import { AuthGuard }         from './guards/auth.guard';

export const routes: Routes = [
  // 1. Default route → Login
  { path: '',      redirectTo: '/login', pathMatch: 'full' },

  // 2. Halaman publik
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home',     component: HomeComponent, canActivate: [AuthGuard] },
  // 3. Halaman yang dilindungi setelah login
  { path: 'home',  component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'fauna', component: FaunaComponent,  canActivate: [AuthGuard] },
  { path: 'flora', component: FloraComponent,  canActivate: [AuthGuard] },

  // 4. Catch-all: jika URL tak dikenal, arahkan ke login
  { path: '**', redirectTo: '/login' }
];
