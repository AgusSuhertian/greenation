export interface Article {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string;
  authorName: string;
  publishDate?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}
