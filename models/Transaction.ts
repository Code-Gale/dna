import mongoose, { Schema, type InferSchemaType } from "mongoose"

const TransactionSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    email: { type: String, index: true },
    amount: { type: Number },
    currency: { type: String, default: "NGN" },
    status: { type: String, enum: ["processing", "processed", "failed"], default: "processing", index: true },
    tickets: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true },
)

export type TransactionDoc = InferSchemaType<typeof TransactionSchema> & { _id: mongoose.Types.ObjectId }

export const TransactionModel =
  (mongoose.models.Transaction as mongoose.Model<TransactionDoc>) ||
  mongoose.model<TransactionDoc>("Transaction", TransactionSchema)
