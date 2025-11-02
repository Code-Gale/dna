import mongoose, { Schema, type InferSchemaType } from "mongoose"

const AwardCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    options: { type: [String], default: [] },
    enabled: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export type AwardCategoryDoc = InferSchemaType<typeof AwardCategorySchema> & { _id: mongoose.Types.ObjectId }

export const AwardCategoryModel =
  (mongoose.models.AwardCategory as mongoose.Model<AwardCategoryDoc>) ||
  mongoose.model<AwardCategoryDoc>("AwardCategory", AwardCategorySchema)
