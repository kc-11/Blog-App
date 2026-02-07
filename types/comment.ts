import type { Types } from "mongoose";

export type CommentStatus = "pending" | "approved";

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  authorName: string;
  authorEmail: string;
  body: string;
  status: CommentStatus;
  parentId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
