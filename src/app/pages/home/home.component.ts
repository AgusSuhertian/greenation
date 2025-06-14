import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { Observable, Subscription } from 'rxjs'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean = false;
  private authStatusSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('[HomeComponent] ngOnInit - Memulai inisialisasi.');
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.authStatusSubscription = this.authService.isLoggedIn$.subscribe(
      status => {
        this.isUserLoggedIn = status;
        console.log('[HomeComponent] Status login:', status);
      }
    );
  }

  ngOnDestroy(): void {
    this.authStatusSubscription?.unsubscribe();
  }
}
