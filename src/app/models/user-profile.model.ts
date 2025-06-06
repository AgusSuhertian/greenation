import { Timestamp, FieldValue } from '@angular/fire/firestore';

export interface UserProfile {
  id: string;
  username?: string;
  fullName?: string;
  email?: string;  
  avatarUrl?: string; 
  bio?: string;
  createdAt?: Date | Timestamp | FieldValue; 
  updatedAt?: Date | Timestamp | FieldValue; 
  dateOfBirth?: Date | string | Timestamp | FieldValue;
  sessionStart?: Date | string | Timestamp | FieldValue;
  sessionEnd?: Date | string | Timestamp | FieldValue;
  visitCount?: number;
  lastVisitDuration?: number;
  totalVisitDuration?: number;
  lastActiveAt?: Date | string | Timestamp | FieldValue;
}
