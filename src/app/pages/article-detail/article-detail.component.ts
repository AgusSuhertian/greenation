import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { firstValueFrom } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
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
      }

    } catch (error: any) {
      this.errorMessage = 'Gagal memuat artikel.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
    console.log('Image URL:', this.article?.imageUrl);

  }
  
}
