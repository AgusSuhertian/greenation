import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.css']
})
export class ArticleFormComponent {
  article: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>> = {
    title: '',
    slug: '',
    content: '',
    summary: '',
    imageUrl: '',
    authorName: '',
    publishDate: new Date().toISOString().split('T')[0]
  };

  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private readonly articleService: ArticleService,
    private readonly router: Router
  ) {}

  async onSubmit(form: NgForm): Promise<void> {
    console.log('[ArticleFormComponent] onSubmit - Form submitted. Form valid:', form.valid);

    if (form.invalid) {
      this.errorMessage = 'Harap isi semua field wajib dengan benar.';
      Object.values(form.controls).forEach(c => c.markAsTouched());
      return;
    }

    if (!this.article.title?.trim() || !this.article.content?.trim()) {
      this.errorMessage = "Judul dan Konten wajib diisi dan tidak boleh hanya spasi.";
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const slugGenerated = this.article.slug?.trim() ||
        this.article.title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      const articleToSubmit: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> = {
        title: this.article.title.trim(),
        content: this.article.content.trim(),
        slug: slugGenerated,
        summary: this.article.summary?.trim() || '',
        imageUrl: this.article.imageUrl?.trim() || '',
        authorName: this.article.authorName?.trim() || '',
        publishDate: this.article.publishDate || new Date().toISOString().split('T')[0]
      };

      console.log('[ArticleFormComponent] Data yang akan dikirim ke service:', articleToSubmit);

      const newArticleId: string = await this.articleService.createArticle(articleToSubmit);
      console.log('[ArticleFormComponent] Artikel berhasil dibuat dengan ID:', newArticleId);

      this.successMessage = `Artikel "${articleToSubmit.title}" berhasil dibuat!`;
      form.resetForm();
      this.article = {
        title: '',
        slug: '',
        content: '',
        summary: '',
        imageUrl: '',
        authorName: '',
        publishDate: new Date().toISOString().split('T')[0]
      };

      setTimeout(() => {
        const navigateTo = articleToSubmit.slug || newArticleId;
        this.router.navigate(['/artikel', navigateTo]);
      }, 2000);

    } catch (err: any) {
      this.errorMessage = `Terjadi kesalahan: ${err.message ?? 'tidak diketahui.'}`;
      console.error('[ArticleFormComponent] Error saat submit artikel:', err);
    } finally {
      this.isSubmitting = false;
    }
  }
}
