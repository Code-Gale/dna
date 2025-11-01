import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const PushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, unique: true, index: true },
    p256dh: String,
    auth: String,
    userAgent: String,
  },
  { timestamps: true },
)

export type PushSubscriptionDoc = InferSchemaType<typeof PushSubscriptionSchema> & { _id: mongoose.Types.ObjectId }

export const PushSubscriptionModel =
  (mongoose.models.PushSubscription as mongoose.Model<PushSubscriptionDoc>) ||
  mongoose.model<PushSubscriptionDoc>('PushSubscription', PushSubscriptionSchema)
