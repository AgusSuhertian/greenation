import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model'; 
import { ArticleService } from '../../services/article.service';
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
  latestArticles$: Observable<Article[]>;
  isLoadingArticles: boolean = true;
  articleError: string | null = null;
  isUserLoggedIn: boolean = false;

  private articlesSubscription: Subscription | undefined;
  private authStatusSubscription: Subscription | undefined;

  constructor(
    private articleService: ArticleService,
    private authService: AuthService
  ) {
    this.latestArticles$ = this.articleService.getArticles(4);
    console.log('[HomeComponent] Constructor - latestArticles$ diinisialisasi.');
  }

  ngOnInit(): void {
    console.log('[HomeComponent] ngOnInit - Memulai inisialisasi.');
    this.checkLoginStatus();

    this.articlesSubscription = this.latestArticles$.subscribe({
      next: (articles) => {
        console.log('[HomeComponent] Latest articles loaded via subscribe:', articles);
        this.isLoadingArticles = false;
        if (articles.length === 0 && !this.articleError) {
          console.log('[HomeComponent] Tidak ada artikel yang dimuat.');
        }
      },
      error: (err) => {
        console.error('[HomeComponent] Error loading articles via subscribe:', err);
        this.articleError = 'Gagal memuat artikel terbaru.';
        this.isLoadingArticles = false;
      },
      complete: () => {
        console.log('[HomeComponent] Subscription untuk latestArticles$ selesai (complete).');
        if (!this.articleError) {
          this.isLoadingArticles = false;
        }
      }
    });
  }

  checkLoginStatus(): void {
    this.authStatusSubscription = this.authService.isLoggedIn$.subscribe(status => {
      this.isUserLoggedIn = status;
      console.log('[HomeComponent] User logged in status (dari checkLoginStatus):', this.isUserLoggedIn);
    });
  }

  ngOnDestroy(): void {
    console.log('[HomeComponent] ngOnDestroy - Melakukan unsubscribe.');
    if (this.articlesSubscription) {
      this.articlesSubscription.unsubscribe();
    }
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
  }
}
