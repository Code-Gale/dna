import { SettingModel } from "@/models/Setting"
import { dbConnect } from "@/lib/db"

export async function getActivePricing() {
  await dbConnect()
  let setting = await SettingModel.findOne()
  if (!setting) {
    setting = await SettingModel.create({})
  }
  const now = new Date()
  const isEarlyBird = now <= new Date(setting.earlyBirdDeadline)
  const price = isEarlyBird ? setting.earlyBirdPrice : setting.regularPrice
  const ticketType = isEarlyBird ? "early-bird" : "regular"
  return { price, ticketType, setting }
}
