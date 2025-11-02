import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { VoteModel } from "@/models/Vote"
import { AwardCategoryModel } from "@/models/AwardCategory"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { categoryId, option, email } = body || {}
    if (!categoryId || !option || !email) return NextResponse.json({ error: 'categoryId, option, and email are required' }, { status: 400 })
    const cat = await AwardCategoryModel.findById(categoryId)
    if (!cat || !cat.enabled) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    if (!cat.options.includes(option)) return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || ''
    await VoteModel.create({ categoryId, option, email: String(email).toLowerCase().trim(), ip })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'You have already voted for this category with this email.' }, { status: 409 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to submit vote' }, { status: 400 })
  }
}
