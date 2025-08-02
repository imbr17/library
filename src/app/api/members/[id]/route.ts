import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = params.id

    // Check if member has any active transactions
    const activeTransactions = await db.transaction.findMany({
      where: {
        memberId,
        status: "BORROWED"
      }
    })

    if (activeTransactions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete member with active transactions" },
        { status: 400 }
      )
    }

    await db.member.delete({
      where: {
        id: memberId
      }
    })

    return NextResponse.json({ message: "Member deleted successfully" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    )
  }
}