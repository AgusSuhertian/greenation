import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { UserProfile } from '../../models/user-profile.model';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [CommonModule],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  editMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  editedProfile: Partial<UserProfile> = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUserProfile$.subscribe(profile => {
      this.profile = profile;
      if (profile) {
        this.editedProfile = { ...profile }; 
      }
    });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.profile) {
      this.editedProfile = { ...this.profile };
    }
  }

  async saveProfile() {
    if (!this.profile) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.updateUserProfile(this.profile.id!, this.editedProfile);
      this.successMessage = 'Profil berhasil diperbarui!';
      this.editMode = false;
    } catch (error: any) {
      this.errorMessage = 'Gagal memperbarui profil: ' + (error?.message || error);
    } finally {
      this.loading = false;
    }
  }
}
