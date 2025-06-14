import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { AuthService } from '../../auth.service'; 
import { UserProfile } from '../../models/user-profile.model'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;

  isLoggedIn$: Observable<boolean>;
  userProfile$: Observable<UserProfile | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.userProfile$ = this.authService.currentUserProfile$;
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
      this.isMenuOpen = false;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
