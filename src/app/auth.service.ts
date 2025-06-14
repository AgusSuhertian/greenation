import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { collectionData } from '@angular/fire/firestore';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  updateProfile,
  deleteUser
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  getDocs
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserProfile } from './models/user-profile.model';

export interface ReadArticle {
  articleId: string;
  title: string;
  dateRead: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private currentUser = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUser.asObservable();
  private currentUserProfile = new BehaviorSubject<UserProfile | null>(null);
  public currentUserProfile$: Observable<UserProfile | null> = this.currentUserProfile.asObservable();
  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(map(user => !!user));

  constructor(private router: Router) {
    authState(this.auth).pipe(
      switchMap(user => {
        this.currentUser.next(user);
        if (user) {
          return from(this.fetchUserProfile(user.uid)).pipe(
            tap(() => this._updateUserSessionStats(user.uid))
          );
        } else {
          this.currentUserProfile.next(null);
          return of(null);
        }
      })
    ).subscribe();
  }

  private async _updateUserSessionStats(userId: string): Promise<void> {
    const userProfileRef = doc(this.firestore, `user_profiles/${userId}`);
    const profile = this.currentUserProfile.getValue();
    const visitCount = (profile?.visitCount || 0) + 1;
    await setDoc(userProfileRef, {
      sessionStart: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      visitCount: visitCount,
    }, { merge: true });
  }

  private normalizeTimestamps(profile: any): UserProfile {
    const timestampFields = [
      'createdAt', 'updatedAt', 'dateOfBirth', 'sessionStart', 'sessionEnd', 'lastActiveAt'
    ];
    for (const field of timestampFields) {
      const val = profile[field];
      if (val instanceof Timestamp) profile[field] = val.toDate();
      else if (typeof val === 'string') profile[field] = new Date(val);
    }
    return profile as UserProfile;
  }

  private async uploadAvatar(userId: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, `avatars/${userId}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      this.currentUserProfile.next(null);
      return null;
    }
    try {
      const userProfileDocRef = doc(this.firestore, `user_profiles/${userId}`);
      const docSnap = await getDoc(userProfileDocRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        const normalized = this.normalizeTimestamps(data);
        this.currentUserProfile.next(normalized);
        return normalized;
      } else {
        this.currentUserProfile.next(null);
        return null;
      }
    } catch (error) {
      console.error('[AuthService] fetchUserProfile error:', error);
      this.currentUserProfile.next(null);
      throw error;
    }
  }

  async register(creds: {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    dateOfBirth?: Date;
    avatarFile?: File;
  }): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, creds.email, creds.password);
    const user = userCredential.user;

    let avatarUrl: string | null = null;
    if (user && creds.avatarFile) {
      avatarUrl = await this.uploadAvatar(user.uid, creds.avatarFile);
    }

    const profileData: { [key: string]: any } = {
      username: creds.username || user.email?.split('@')[0],
      fullName: creds.fullName || '',
      email: user.email,
      avatarUrl: avatarUrl,
      dateOfBirth: creds.dateOfBirth || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    Object.keys(profileData).forEach(key => {
      if (profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    await setDoc(doc(this.firestore, `user_profiles/${user.uid}`), profileData);
    return userCredential;
  }

  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile> & { avatarFile?: File }
  ): Promise<void> {
    if (!userId) throw new Error('User ID diperlukan.');

    const { avatarFile, ...textData } = profileData;
    const dataToUpdate: { [key: string]: any } = { ...textData };

    if (avatarFile) {
      try {
        const newAvatarUrl = await this.uploadAvatar(userId, avatarFile);
        dataToUpdate['avatarUrl'] = newAvatarUrl;
      } catch (error) {
        console.error('[AuthService] Gagal mengunggah avatar baru:', error);
        throw new Error('Gagal mengunggah foto profil.');
      }
    }

    if (dataToUpdate['dateOfBirth']) {
      dataToUpdate['dateOfBirth'] = Timestamp.fromDate(new Date(dataToUpdate['dateOfBirth']));
    }

    dataToUpdate['updatedAt'] = serverTimestamp();

    const userProfileRef = doc(this.firestore, `user_profiles/${userId}`);
    await setDoc(userProfileRef, dataToUpdate, { merge: true });

    await this.fetchUserProfile(userId);
  }

  async login(creds: { email: string; password: string }): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, creds.email, creds.password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  getCurrentUserId(): string | null {
    return this.currentUser.value?.uid ?? null;
  }

  async updateDisplayName(displayName: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Tidak ada pengguna yang login.');
    await updateProfile(user, { displayName });
    this.currentUser.next(user);
  }

  async deleteAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Tidak ada pengguna yang login.');

    await deleteUser(user);
    this.currentUser.next(null);
    this.currentUserProfile.next(null);
    this.router.navigate(['/register']);
  }

  // ==========================
  // Riwayat Artikel Dibaca
  // ==========================

  getReadArticles(): Observable<ReadArticle[]> {
  const userId = this.getCurrentUserId();
  if (!userId) return of([]);

  const readArticlesRef = collection(this.firestore, `user_profiles/${userId}/read_articles`);
  const q = query(readArticlesRef, orderBy('dateRead', 'desc'), limit(20));

  return collectionData(q, { idField: 'id' }).pipe(
    map(articles =>
      articles.map((data: any) => ({
        articleId: data.articleId,
        title: data.title,
        dateRead: data.dateRead?.toDate ? data.dateRead.toDate() : new Date(data.dateRead),
      }))
    )
  );
}

  async addReadArticle(articleId: string, title: string): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User belum login');

    const readArticlesRef = collection(this.firestore, `user_profiles/${userId}/read_articles`);

    await addDoc(readArticlesRef, {
      articleId,
      title,
      dateRead: serverTimestamp()
    });
  }
}
