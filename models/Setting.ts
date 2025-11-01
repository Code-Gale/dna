import mongoose, { Schema, type InferSchemaType } from "mongoose"

const SettingSchema = new Schema(
  {
    totalTickets: { type: Number, default: 100 },
  earlyBirdPrice: { type: Number, default: 6000 },
    regularPrice: { type: Number, default: 7500 },
    earlyBirdDeadline: { type: Date, default: new Date("2025-11-21T23:59:59+01:00") },
  eventDate: { type: Date, default: new Date("2025-12-10T15:00:00+01:00") },
  },
  { timestamps: true },
)

export type SettingDoc = InferSchemaType<typeof SettingSchema> & { _id: mongoose.Types.ObjectId }

export const SettingModel =
  (mongoose.models.Setting as mongoose.Model<SettingDoc>) || mongoose.model<SettingDoc>("Setting", SettingSchema)
