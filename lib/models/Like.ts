import mongoose, { model, models } from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    fingerprint: { type: String, required: true },
  },
  { timestamps: true }
);

likeSchema.index({ postId: 1, fingerprint: 1 }, { unique: true });

export const Like = models.Like ?? model("Like", likeSchema);
