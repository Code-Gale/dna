import mongoose, { Schema, type InferSchemaType } from "mongoose"

const VoteSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'AwardCategory', required: true },
    option: { type: String, required: true },
    email: { type: String, required: true },
    ip: { type: String },
  },
  { timestamps: true }
)

VoteSchema.index({ categoryId: 1, email: 1 }, { unique: true })

export type VoteDoc = InferSchemaType<typeof VoteSchema> & { _id: mongoose.Types.ObjectId }

export const VoteModel =
  (mongoose.models.Vote as mongoose.Model<VoteDoc>) ||
  mongoose.model<VoteDoc>("Vote", VoteSchema)
