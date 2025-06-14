import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';
import { ForumComponent } from './pages/forum/forum.component';
import { FaunaComponent } from './pages/fauna/fauna.component';
import { FloraComponent } from './pages/flora/flora.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { routes } from './app.routes';
import { ArticleComponent } from './pages/article/article.component';

// Firebase modular (ini yang benar untuk digunakan)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    ProfileComponent,
    ArticleComponent,
    ForumComponent,
    FaunaComponent,
    FloraComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    RouterModule.forRoot(routes),

    // Konfigurasi Firebase modular dengan environment.firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
