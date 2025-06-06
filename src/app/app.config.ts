import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideFirebaseApp(() => initializeApp({
      projectId: "greenaction-7c5ff",
      appId: "1:209216567777:web:c337a6b2b867cf898afaa0",
      storageBucket: "greenaction-7c5ff.firebasestorage.app",
      apiKey: "AIzaSyDhNp6TIzyBtMH99tHYb3xVZ4ITwf7AVwk",
      authDomain: "greenaction-7c5ff.firebaseapp.com",
      messagingSenderId: "209216567777",
      measurementId: "G-NECP048C10"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),  
  ]
};
