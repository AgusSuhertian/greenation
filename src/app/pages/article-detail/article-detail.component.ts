import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null | undefined = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  safeContent: SafeHtml = ''; 

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const idOrSlug = this.route.snapshot.paramMap.get('id');
    if (idOrSlug) {
      this.loadArticleDetail(idOrSlug);
    } else {
      this.errorMessage = 'Parameter ID atau Slug tidak ditemukan.';
      this.isLoading = false;
    }
  }

  private convertPlainTextToHtml(text: string): string {
    if (!text) return '';
    const paragraphs = text
      .split(/\r?\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('');
    return paragraphs;
  }

  async loadArticleDetail(idOrSlug: string): Promise<void> {
    this.isLoading = true;
    try {
      const articleBySlug = await this.articleService.getArticleBySlug(idOrSlug);
      if (articleBySlug) {
        this.article = articleBySlug;
      } else {
        const articleById$ = this.articleService.getArticleById(idOrSlug);
        this.article = await firstValueFrom(articleById$);
      }

      if (!this.article) {
        this.errorMessage = 'Artikel tidak ditemukan.';
      } else {
        const contentHtml = this.convertPlainTextToHtml(this.article.content || '');
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(contentHtml);
      }
    } catch (error: any) {
      this.errorMessage = 'Gagal memuat artikel.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
