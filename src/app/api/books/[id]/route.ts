import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = params.id

    // Check if book has any active transactions
    const activeTransactions = await db.transaction.findMany({
      where: {
        bookId,
        status: "BORROWED"
      }
    })

    if (activeTransactions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete book with active transactions" },
        { status: 400 }
      )
    }

    await db.book.delete({
      where: {
        id: bookId
      }
    })

    return NextResponse.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    )
  }
}