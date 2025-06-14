import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ReadArticleService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}
  async addReadArticle(userId: string, articleId: string, title: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID diperlukan');
    }

    try {
      const readArticlesRef = collection(this.firestore, `user/${userId}/readArticles`);

      await addDoc(readArticlesRef, {
        articleId,
        title,
        dateRead: serverTimestamp()
      });

      console.log('Artikel berhasil ditambahkan ke riwayat baca');
    } catch (error) {
      console.error('Gagal menambahkan artikel ke riwayat baca:', error);
      throw error;
    }
  }
}
