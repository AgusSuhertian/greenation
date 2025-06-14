export interface ForumPost {
  id?: string;
  authorId: string;
  userName: string;
  content: string;
  comments?: ForumComment[];
  timestamp: any;
}

export interface ForumComment {
  id?: string;
  authorId: string; 
  userName: string;
  content: string;
  timestamp: any;
}
