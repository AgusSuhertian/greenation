import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  orderBy,
  limit,
  query,
  where,
  serverTimestamp,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Article } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private firestore = inject(Firestore);
  private articlesCol = collection(this.firestore, 'articles');

  private toModel(raw: any, id?: string): Article {
    const a: Partial<Article> = { id: id ?? raw.id };

    a.title = raw.title;
    a.slug = raw.slug;
    a.summary = raw.summary;
    a.content = raw.content;

    a.imageUrl = raw.imageUrl ?? raw.image_url;
    a.authorName = raw.authorName ?? raw.author_name;

    const pub = raw.publishDate ?? raw.publish_date;
    if (pub) a.publishDate = this.fromTimestamp(pub);

    a.createdAt = this.fromTimestamp(raw.createdAt ?? raw.created_at);
    a.updatedAt = this.fromTimestamp(raw.updatedAt ?? raw.updated_at);

    return a as Article;
  }

  private fromTimestamp(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    return typeof val.toDate === 'function' ? val.toDate() : new Date(val);
  }

  getArticles(count = 10): Observable<Article[]> {
    const q = query(this.articlesCol, orderBy('publish_date', 'desc'), limit(count));
    return collectionData(q, { idField: 'id' })
      .pipe(map(list => list.map(d => this.toModel(d))));
  }

  getArticleById(id: string): Observable<Article | undefined> {
    return docData(doc(this.firestore, `articles/${id}`), { idField: 'id' })
      .pipe(map(d => (d ? this.toModel(d) : undefined)));
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const q = query(this.articlesCol, where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return undefined;
    return this.toModel({ id: snap.docs[0].id, ...snap.docs[0].data() });
  }

  async createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const payload: any = {
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    content: data.content,
    image_url: data.imageUrl || '',    
    author_name: data.authorName,
    publish_date: data.publishDate
      ? Timestamp.fromDate(new Date(data.publishDate as any))
      : serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  };

  Object.keys(payload).forEach(k => {
    if (payload[k] === undefined || payload[k] === null) {
      delete payload[k];
    }
  });

  console.log('[ArticleService] Payload sebelum simpan:', payload);

  const docRef = await addDoc(this.articlesCol, payload);
  return docRef.id;
}


  async updateArticle(id: string, changes: Partial<Article>): Promise<void> {
    const toUpd: any = {};

    if (changes.title !== undefined) toUpd.title = changes.title;
    if (changes.content !== undefined) toUpd.content = changes.content;
    if (changes.slug !== undefined) toUpd.slug = changes.slug;
    if (changes.summary !== undefined) toUpd.summary = changes.summary;
    if (changes.imageUrl !== undefined) toUpd.image_url = changes.imageUrl;
    if (changes.authorName !== undefined) toUpd.author_name = changes.authorName;
    if (changes.publishDate) {
      toUpd.publish_date = Timestamp.fromDate(new Date(changes.publishDate as any));
    }

    toUpd.updated_at = serverTimestamp();

    await updateDoc(doc(this.firestore, `articles/${id}`), toUpd);
  }

  async deleteArticle(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `articles/${id}`));
  }
}
