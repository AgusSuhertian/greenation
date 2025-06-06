import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles$: Observable<Article[]>;
  allArticles: Article[] = [];
  displayedArticles: Article[] = [];

  isLoading: boolean = true;
  error: string | null = null;

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;

  private articlesSubscription: Subscription | undefined;

  constructor(private articleService: ArticleService) {
    this.articles$ = this.articleService.getArticles(100); 
    console.log('[ArticleComponent] articles$ initialized.');
  }

  ngOnInit(): void {
    console.log('[ArticleComponent] ngOnInit - Memulai pengambilan daftar artikel...');
    this.articlesSubscription = this.articles$.subscribe({
      next: (data) => {
        this.allArticles = data;
        this.totalPages = Math.ceil(this.allArticles.length / this.pageSize);
        this.updateDisplayedArticles();
        this.isLoading = false;
        if (data.length === 0) {
          console.log('[ArticleComponent] Tidak ada artikel ditemukan.');
        }
      },
      error: (err) => {
        console.error('[ArticleComponent] Gagal memuat artikel:', err);
        this.error = 'Gagal memuat daftar artikel. Silakan coba lagi nanti.';
        this.isLoading = false;
      },
      complete: () => {
        if (!this.error) {
          this.isLoading = false;
        }
        console.log('[ArticleComponent] Subscription articles$ selesai.');
      }
    });
  }

  updateDisplayedArticles(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedArticles = this.allArticles.slice(start, end);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedArticles();
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  }

  getDisplayDate(article: Article): Date | null {
    if (article.publishDate instanceof Date) {
      return article.publishDate;
    } else if ((article.publishDate as any)?.toDate instanceof Function) {
      return (article.publishDate as any).toDate();
    }
    return null;
  }

  ngOnDestroy(): void {
    if (this.articlesSubscription) {
      this.articlesSubscription.unsubscribe();
      console.log('[ArticleComponent] articlesSubscription di-unsubscribe.');
    }
  }
}
