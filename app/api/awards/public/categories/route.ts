import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { AwardCategoryModel } from "@/models/AwardCategory"
export const runtime = "nodejs"

export async function GET() {
  await dbConnect()
  const cats = await AwardCategoryModel.find({ enabled: true }).select('name options')
  return NextResponse.json({ categories: cats })
}
