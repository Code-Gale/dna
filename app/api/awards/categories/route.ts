import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { AwardCategoryModel } from "@/models/AwardCategory"
export const runtime = "nodejs"

// Admin: list all, create, update, delete
export async function GET() {
  await dbConnect()
  const cats = await AwardCategoryModel.find().sort({ createdAt: -1 })
  return NextResponse.json({ categories: cats })
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { name, options = [], enabled = false } = body || {}
    if (!name || !Array.isArray(options)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const created = await AwardCategoryModel.create({ name, options, enabled })
    return NextResponse.json({ category: created })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()
    const body = await request.json()
    const { id, name, options, enabled } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const update: any = {}
    if (typeof name === 'string') update.name = name
    if (Array.isArray(options)) update.options = options
    if (typeof enabled === 'boolean') update.enabled = enabled
    const updated = await AwardCategoryModel.findByIdAndUpdate(id, update, { new: true })
    return NextResponse.json({ category: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await AwardCategoryModel.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete' }, { status: 400 })
  }
}
