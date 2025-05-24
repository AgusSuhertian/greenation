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
import { FirebaseError } from 'firebase/app';        
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';


import { UserProfile } from './models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

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
          return from(this.fetchUserProfile(user.uid));
        } else {
          this.currentUserProfile.next(null);
          return of(null);
        }
      })
    ).subscribe(() => {
      if (!this.currentUser.value) {
        console.log('[AuthService] User logged out, navigating to /login');
        this.router.navigate(['/login']);
      }
    });
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
        const data = { id: docSnap.id, ...docSnap.data() } as UserProfile;
        if ((data.createdAt as Timestamp)?.toDate) {
          data.createdAt = (data.createdAt as Timestamp).toDate();
        }
        if ((data.updatedAt as Timestamp)?.toDate) {
          data.updatedAt = (data.updatedAt as Timestamp).toDate();
        }
        this.currentUserProfile.next(data);
        return data;
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
  }): Promise<UserCredential> {
    if (!creds.email || !creds.password) {
      throw new Error('Email dan password wajib diisi.');
    }
    if (creds.password.length < 6) {
      throw new Error('Password minimal harus 6 karakter.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        creds.email,
        creds.password
      );
      const user = userCredential.user;

      if (user && (creds.fullName || creds.username)) {
        await updateProfile(user, {
          displayName: creds.fullName || creds.username
        });
      }

      if (user) {
        const profile: Partial<UserProfile> = {
          username: creds.username?.trim() || user.email?.split('@')[0],
          fullName: creds.fullName?.trim() || '',
          email: user.email ?? undefined,          // null-safe
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        const ref = doc(this.firestore, `user_profiles/${user.uid}`);
        await setDoc(ref, profile);
      }
      return userCredential;
    } catch (error) {
      console.error('[AuthService] register error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
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

  async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<void> {
    if (!userId) throw new Error('User ID diperlukan.');

    const ref = doc(this.firestore, `user_profiles/${userId}`);
    const dataToUpdate: { [key: string]: any } = {};

    if (profileData.username !== undefined) dataToUpdate['username'] = profileData.username;
    if (profileData.fullName  !== undefined) dataToUpdate['fullName'] = profileData.fullName;
    if (profileData.avatarUrl !== undefined) dataToUpdate['avatarUrl'] = profileData.avatarUrl;
    if (profileData.bio       !== undefined) dataToUpdate['bio']      = profileData.bio;

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
