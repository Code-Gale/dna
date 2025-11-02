import mongoose, { Schema, type InferSchemaType } from "mongoose"

const SettingSchema = new Schema(
  {
    totalTickets: { type: Number, default: 100 },
  earlyBirdPrice: { type: Number, default: 5000 },
    regularPrice: { type: Number, default: 7500 },
    earlyBirdDeadline: { type: Date, default: new Date("2025-11-21T23:59:59+01:00") },
  eventDate: { type: Date, default: new Date("2025-12-10T15:00:00+01:00") },
  contactEmail: { type: String, default: 'lp38arfamily@gmail.com' },
  contactPhone: { type: String, default: '+2348149603848' },
  outfitInspiration: {
    type: [
      new Schema(
        {
          title: { type: String, required: true },
          imageUrl: { type: String },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  faqs: {
    type: [
      new Schema(
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  },
  { timestamps: true },
)

export type SettingDoc = InferSchemaType<typeof SettingSchema> & { _id: mongoose.Types.ObjectId }

// In dev with HMR, the model might already be registered with an older schema.
// Drop the cached model so it re-registers with the current schema.
if (mongoose.models.Setting) {
  delete mongoose.models.Setting
}

export const SettingModel = mongoose.model<SettingDoc>("Setting", SettingSchema)
