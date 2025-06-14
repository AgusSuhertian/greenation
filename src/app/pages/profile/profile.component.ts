import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, ReadArticle } from '../../auth.service'; // impor tipe ReadArticle dari auth.service
import { UserProfile } from '../../models/user-profile.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  editMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  editedProfile: Partial<UserProfile> = {};
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  readArticles: ReadArticle[] = [];
  loadingReadArticles = false;

  private readArticlesSub?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe ke profile user
    this.authService.currentUserProfile$.subscribe(profile => {
      this.profile = profile ? { ...profile } : null;
      if (this.profile) {
        this.editedProfile = { ...this.profile };
      }
    });

    // Load riwayat artikel yang dibaca
    this.loadReadArticles();
  }

  ngOnDestroy(): void {
    this.readArticlesSub?.unsubscribe();
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.editMode && this.profile) {
      this.editedProfile = { ...this.profile };
    }

    this.selectedFile = null;
    this.imagePreviewUrl = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.profile?.id) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const dataToUpdate = { ...this.editedProfile };
      if (this.selectedFile) {
        (dataToUpdate as any).avatarFile = this.selectedFile;
      }

      await this.authService.updateUserProfile(this.profile.id, dataToUpdate);

      this.successMessage = 'Profil berhasil diperbarui!';
      this.editMode = false;
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    } catch (error: any) {
      this.errorMessage = 'Gagal memperbarui profil: ' + (error?.message || 'Unknown error');
    } finally {
      this.loading = false;
    }
  }

  loadReadArticles(): void {
  this.loadingReadArticles = true;
  this.readArticlesSub = this.authService.getReadArticles().subscribe({
    next: (articles: ReadArticle[]) => {
      this.readArticles = articles.map(article => ({
        articleId: article.articleId,
        title: article.title,
        dateRead: article.dateRead instanceof Date ? article.dateRead : new Date(article.dateRead)
      }));
      this.loadingReadArticles = false;
    },
    error: (error) => {
      console.error('Gagal memuat riwayat artikel:', error);
      this.readArticles = [];
      this.loadingReadArticles = false;
    }
  });
}
}
