import type { Types } from "mongoose";

export type PostStatus = "draft" | "published";

export interface IPost {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  content: unknown;
  contentPlain: string;
  status: PostStatus;
  publishedAt?: Date | null;
  tags: Types.ObjectId[];
  category?: string;
  coverImage?: string;
  ogImage?: string;
  readingTimeMinutes: number;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PostCreate = Omit<IPost, "_id" | "createdAt" | "updatedAt"> & {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};
