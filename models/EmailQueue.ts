import mongoose, { Schema, type InferSchemaType } from "mongoose"

const EmailQueueSchema = new Schema(
  {
    reference: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    html: { type: String },
    attachments: { type: Array, default: [] }, // attachments as { filename, contentBase64, contentType }
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
  },
  { timestamps: true },
)

export type EmailQueueDoc = InferSchemaType<typeof EmailQueueSchema> & { _id: mongoose.Types.ObjectId }

export const EmailQueueModel =
  (mongoose.models.EmailQueue as mongoose.Model<EmailQueueDoc>) || mongoose.model<EmailQueueDoc>("EmailQueue", EmailQueueSchema)
