import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isUserLoggedIn = false;
  private authSub!: Subscription;

  authService = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.authSub = this.authService.isLoggedIn$.subscribe(status => {
      this.isUserLoggedIn = status;
    });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
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
