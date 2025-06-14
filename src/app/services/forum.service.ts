import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  orderBy,
  addDoc,
  doc,      
  deleteDoc, 
  Timestamp,
  collectionData
} from '@angular/fire/firestore';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ForumPost, ForumComment } from '../models/forum-post.model';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  async addPost(post: Omit<ForumPost, 'id'>): Promise<any> {
    const postsCollection = collection(this.firestore, 'forum_posts');
    return await addDoc(postsCollection, post);
  }

  async addComment(postId: string, comment: { authorId: string; userName: string; content: string; timestamp: Timestamp }) {
    if (!postId) {
      throw new Error("Post ID tidak valid untuk menambahkan komentar.");
    }
    const commentsCollection = collection(this.firestore, `forum_posts/${postId}/comments`);
    await addDoc(commentsCollection, comment);
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    if (!postId || !commentId) {
      throw new Error("Post ID dan Comment ID diperlukan untuk menghapus komentar.");
    }
    const commentDocRef = doc(this.firestore, `forum_posts/${postId}/comments/${commentId}`);
    await deleteDoc(commentDocRef);
  }


  getPosts(): Observable<ForumPost[]> {
    const postsCollection = collection(this.firestore, 'forum_posts');
    const q = query(postsCollection, orderBy('timestamp', 'desc'));

    return (collectionData(q, { idField: 'id' }) as Observable<ForumPost[]>).pipe(
      switchMap((posts: ForumPost[]) => {
        if (posts.length === 0) {
          return of([]);
        }
        const postsWithComments$ = posts.map(post => {
          const commentsCollection = collection(this.firestore, `forum_posts/${post.id}/comments`);
          const commentsQuery = query(commentsCollection, orderBy('timestamp', 'asc'));
          
          return (collectionData(commentsQuery, { idField: 'id' }) as Observable<ForumComment[]>).pipe(
            map(comments => ({ ...post, comments })) 
          );
        });

        return combineLatest(postsWithComments$);
      })
    );
  }
}
