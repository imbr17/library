import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const members = await db.member.findMany({
      orderBy: {
        joinDate: "desc"
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, isActive } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingMember = await db.member.findUnique({
      where: {
        email
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "Member with this email already exists" },
        { status: 400 }
      )
    }

    const member = await db.member.create({
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        isActive: isActive ?? true,
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}