import mongoose, { model, models } from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, status: 1, createdAt: -1 });

export const Comment = models.Comment ?? model("Comment", commentSchema);

export async function getApprovedCommentsByPostId(postId: string) {
  const { connectDB } = await import("@/lib/db");
  await connectDB();
  return Comment.find({ postId, status: "approved" })
    .sort({ createdAt: 1 })
    .lean();
}
