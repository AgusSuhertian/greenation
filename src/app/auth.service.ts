import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  updateProfile
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';
import { FirebaseError } from 'firebase/app';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserProfile } from './models/user-profile.model';

@Injectable({ providedIn: 'root' })
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
      tap(user => console.log('[AuthService] authState changed:', user)),
      switchMap(user => {
        this.currentUser.next(user);
        if (user) {
          return from(this.fetchUserProfile(user.uid)).pipe(
            switchMap(profile => {
              const now = new Date();
              const visitCount = (profile?.visitCount || 0) + 1;
              return from(this.updateUserProfile(user.uid, {
                sessionStart: now,
                lastActiveAt: now,
                visitCount
              }));
            })
          );
        } else {
          this.currentUserProfile.next(null);
          return of(null);
        }
      })
    ).subscribe(() => {
      if (!this.currentUser.value) {
        this.router.navigate(['/login']);
      }
    });
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

  private calculateDurationInSeconds(start: Date, end: Date): number {
    const ms = end.getTime() - start.getTime();
    return Math.floor(ms / 1000);
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

  async login(creds: { email: string; password: string }): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, creds.email, creds.password);
    } catch (error) {
      console.error('[AuthService] login error:', error);
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
    if (!creds.email || !creds.password) throw new Error('Email dan password wajib diisi.');
    if (creds.password.length < 6) throw new Error('Password minimal harus 6 karakter.');
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, creds.email, creds.password);
      const user = userCredential.user;
      if (user && (creds.fullName || creds.username)) {
        await updateProfile(user, {
          displayName: creds.fullName || creds.username
        });
      }

      let avatarUrl: string | undefined;
      if (user && creds.avatarFile) {
        try {
          avatarUrl = await this.uploadAvatar(user.uid, creds.avatarFile);
        } catch (e) {
          console.warn('[AuthService] upload avatar failed:', e);
        }
      }

      if (user) {
        const profile: Partial<UserProfile> = {
          username: creds.username?.trim() || user.email?.split('@')[0],
          fullName: creds.fullName?.trim() || '',
          email: user.email ?? undefined,
          avatarUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          dateOfBirth: creds.dateOfBirth ?? undefined
        };
        await setDoc(doc(this.firestore, `user_profiles/${user.uid}`), profile);
      }

      return userCredential;
    } catch (error) {
      console.error('[AuthService] register error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const userId = this.currentUser.value?.uid;
      const now = new Date();
      if (userId && this.currentUserProfile.value?.sessionStart) {
        const raw = this.currentUserProfile.value.sessionStart;
        let sessionStart: Date;

        if (raw instanceof Date) sessionStart = raw;
        else if (raw instanceof Timestamp) sessionStart = raw.toDate();
        else if (typeof raw === 'string' || typeof raw === 'number') sessionStart = new Date(raw);
        else {
          console.warn('sessionStart tidak valid:', raw);
          sessionStart = new Date();
        }

        const duration = this.calculateDurationInSeconds(sessionStart, now);
        const totalDuration = (this.currentUserProfile.value.totalVisitDuration || 0) + duration;

        await this.updateUserProfile(userId, {
          sessionEnd: now,
          lastVisitDuration: duration,
          totalVisitDuration: totalDuration,
          lastActiveAt: now
        });
      }

      await signOut(this.auth);
    } catch (error) {
      console.error('[AuthService] logout error:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value;
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    if (!userId) throw new Error('User ID diperlukan.');
    const ref = doc(this.firestore, `user_profiles/${userId}`);
    const dataToUpdate: { [key: string]: any } = {};

    const fields = [
      'username', 'fullName', 'avatarUrl', 'bio', 'dateOfBirth',
      'sessionStart', 'sessionEnd', 'visitCount',
      'lastVisitDuration', 'totalVisitDuration', 'lastActiveAt'
    ];

    for (const key of fields) {
      if (profileData[key as keyof UserProfile] !== undefined) {
        dataToUpdate[key] = profileData[key as keyof UserProfile];
      }
    }

    dataToUpdate['updatedAt'] = serverTimestamp();

    try {
      await setDoc(ref, dataToUpdate, { merge: true });
      if (this.currentUser.value?.uid === userId) {
        await this.fetchUserProfile(userId);
      }
    } catch (error) {
      console.error('[AuthService] updateUserProfile error:', error);
      throw error;
    }
  }
}
