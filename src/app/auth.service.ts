import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedFlag = false;

  constructor() {}

  isAuthenticated(): Observable<boolean> {
    return of(this.isAuthenticatedFlag);
  }

  login(): void {
    this.isAuthenticatedFlag = true;
  }

  logout(): void {
    this.isAuthenticatedFlag = false;
  }
}
