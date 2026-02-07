import mongoose, { model, models } from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: false }
);

// slug index is already created by unique: true on the field

export const Tag = models.Tag ?? model("Tag", tagSchema);
