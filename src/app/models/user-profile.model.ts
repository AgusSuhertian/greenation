import { Timestamp, FieldValue } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: Date | string | Timestamp | FieldValue;
  updatedAt?: Date | string | Timestamp | FieldValue;
}
