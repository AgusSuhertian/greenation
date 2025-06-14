import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Firebase modular imports
import { Firestore, doc, collection, setDoc } from '@angular/fire/firestore';

import { AuthService } from '../../auth.service'; 

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  safeContent: SafeHtml = '';
  imageLoadError = false;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private sanitizer: DomSanitizer,
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idOrSlug = this.route.snapshot.paramMap.get('id');
    console.log(`[ArticleDetailComponent] ID atau Slug yang diterima: ${idOrSlug}`);

    if (idOrSlug) {
      this.loadArticleDetail(idOrSlug);
    } else {
      this.errorMessage = 'Parameter ID atau Slug tidak ditemukan.';
      this.isLoading = false;
      console.warn('[ArticleDetailComponent] Parameter ID atau Slug tidak ditemukan.');
    }
  }

  private convertPlainTextToHtml(text: string): string {
    if (!text) return '';
    return text
      .split(/\r?\n+/)
      .filter(line => line.trim().length > 0)
      .map(line => `<p>${line.trim()}</p>`)
      .join('');
  }

  async loadArticleDetail(idOrSlug: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;
    console.log(`[ArticleDetailComponent] Memulai load artikel dengan id/slug: ${idOrSlug}`);

    try {
      const articleBySlug = await this.articleService.getArticleBySlug(idOrSlug);
      console.log('[ArticleDetailComponent] Hasil getArticleBySlug:', articleBySlug);

      if (articleBySlug) {
        this.article = articleBySlug;
      } else {
        const articleById$ = this.articleService.getArticleById(idOrSlug);
        this.article = await firstValueFrom(articleById$) || null;
        console.log('[ArticleDetailComponent] Hasil getArticleById:', this.article);
      }

      if (!this.article) {
        this.errorMessage = 'Artikel tidak ditemukan.';
        console.warn('[ArticleDetailComponent] Artikel tidak ditemukan.');
      } else {
        const contentHtml = this.convertPlainTextToHtml(this.article.content || '');
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(contentHtml);

        // Rekam artikel yang dibaca
        await this.recordReadArticle(this.article);
      }
    } catch (error: any) {
      this.errorMessage = 'Gagal memuat artikel. Silakan coba lagi nanti.';
      console.error('[ArticleDetailComponent] Error saat loadArticleDetail:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async recordReadArticle(article: Article): Promise<void> {
  try {
    const user = await this.authService.getCurrentUser();
    console.log('Current User:', user);
    if (!user?.uid) {
      console.warn('User belum login atau UID tidak ditemukan.');
      return;
    }

    const userId = user.uid;
    const readData = {
      articleId: article.id,
      title: article.title,
      timestamp: new Date()
    };

    console.log('Mencoba simpan readArticle:', readData);

    const userDocRef = doc(this.firestore, 'users', userId);
    const readArticlesCollectionRef = collection(userDocRef, 'readArticles');
    const articleDocRef = doc(readArticlesCollectionRef, article.id);

    await setDoc(articleDocRef, readData);

    console.log('Artikel dibaca telah direkam di Firestore.');
  } catch (err) {
    console.error('Gagal merekam artikel yang dibaca:', err);
  }
}

}
