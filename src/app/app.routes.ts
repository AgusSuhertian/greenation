import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FaunaComponent } from './pages/fauna/fauna.component';
import { FloraComponent } from './pages/flora/flora.component';
import { FaunaDetailComponent } from './pages/fauna-detail/fauna-detail.component';
import { FloraDetailComponent } from './pages/flora-detail/flora-detail.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { ArticleFormComponent } from './pages/article-form/article-form.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { InteractiveMapComponent } from './pages/interactive-map/interactive-map.component';




import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Halaman login dan register 
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Halaman utama yang membutuhkan login
  { path: 'home',   component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'fauna',  component: FaunaComponent, canActivate: [AuthGuard] },
  { path: 'flora',  component: FloraComponent, canActivate: [AuthGuard] },
  { path: 'fauna/:id', component: FaunaDetailComponent, canActivate: [AuthGuard] },
  { path: 'flora/:id', component: FloraDetailComponent, canActivate: [AuthGuard] },
  { path: 'artikel/baru', component: ArticleFormComponent, canActivate: [AuthGuard] },
  { path: 'artikel/:id', component: ArticleDetailComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'peta-interaktif', component: InteractiveMapComponent, canActivate: [AuthGuard] },

  // Redirect root '/' ke login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Redirect jika path tidak dikenali
  { path: '**', redirectTo: 'login' }
];
