import mongoose, { Schema, type InferSchemaType } from "mongoose"

const TicketSchema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["success", "pending", "failed"], default: "pending", index: true },
    ticketType: { type: String, enum: ["early-bird", "regular"], required: true },
    qrCode: { type: String },
    reference: { type: String, index: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    reminderSentAt: { type: Date },
  },
  { timestamps: true },
)

export type TicketDoc = InferSchemaType<typeof TicketSchema> & { _id: mongoose.Types.ObjectId }

export const TicketModel =
  (mongoose.models.Ticket as mongoose.Model<TicketDoc>) || mongoose.model<TicketDoc>("Ticket", TicketSchema)
