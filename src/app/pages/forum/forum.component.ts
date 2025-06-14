import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ForumService } from '../../services/forum.service';
import { AuthService } from '../../auth.service';
import { ForumPost, ForumComment } from '../../models/forum-post.model';
import { UserProfile } from '../../models/user-profile.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  posts: ForumPost[] = [];
  newPostContent: string = '';
  newCommentContent: { [postId: string]: string } = {};
  currentUserProfile: UserProfile | null = null;

  constructor(
    private forumService: ForumService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.forumService.getPosts().subscribe(posts => {
      this.posts = posts;
    });

    this.authService.currentUserProfile$.subscribe(profile => {
      this.currentUserProfile = profile;
    });
  }

  async addPost() {
    if (!this.newPostContent.trim()) return;

    if (!this.currentUserProfile) {
      alert('Anda harus login untuk bisa membuat postingan.');
      return;
    }

    const user = this.currentUserProfile;
    const newPost = {
      authorId: user.id,
      userName: user.fullName || user.username || 'Anonymous',
      content: this.newPostContent.trim(),
      comments: [],
      timestamp: Timestamp.now()
    };

    try {
      await this.forumService.addPost(newPost);
      this.newPostContent = ''; 
    } catch (error) {
      console.error("Gagal menambahkan post:", error);
      alert("Maaf, gagal mengirim post. Silakan coba lagi.");
    }
  }

  async addComment(postId: string) {
    if (!postId) {
      console.error("ForumComponent: Invalid Post ID provided to addComment.");
      return;
    }
    const commentContent = this.newCommentContent[postId];
    if (!commentContent || !commentContent.trim()) {
      return;
    }
    if (!this.currentUserProfile) {
      alert('Anda harus login untuk bisa berkomentar.');
      return;
    }

    const user = this.currentUserProfile;

    const newComment = {
      authorId: user.id,
      userName: user.fullName || user.username || 'Anonymous',
      content: commentContent.trim(),
      timestamp: Timestamp.now()
    };
    
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      if (!post.comments) {
          post.comments = [];
      }
      
      post.comments.push({ id: 'temp-' + Date.now(), ...newComment });
      this.posts = [...this.posts];
      this.newCommentContent[postId] = '';
    }

    try {
      await this.forumService.addComment(postId, newComment);
      console.log('Komentar berhasil disimpan di Firestore.');
    } catch (error) {
      console.error("Gagal menyimpan komentar di Firestore:", error);
      alert("Maaf, gagal mengirim komentar. Perubahan Anda mungkin tidak tersimpan.");
      if (post && post.comments) {
        post.comments.pop();
        this.posts = [...this.posts];
      }
    }
  }
  
  async handleDeleteComment(postId: string, commentId: string) {
    try {
      await this.forumService.deleteComment(postId, commentId);
      console.log('Komentar berhasil dihapus.');
    } catch (error) {
      console.error("Gagal menghapus komentar:", error);
      alert("Maaf, gagal menghapus komentar. Anda mungkin tidak memiliki izin.");
    }
  }
}
