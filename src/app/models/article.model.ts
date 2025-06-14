export interface Article {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  authorName: string;
  publishDate?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}
