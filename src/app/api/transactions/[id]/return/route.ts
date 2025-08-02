import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id

    // Find the transaction
    const transaction = await db.transaction.findUnique({
      where: {
        id: transactionId
      },
      include: {
        book: true
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    if (transaction.status !== "BORROWED") {
      return NextResponse.json(
        { error: "Book is already returned or not borrowed" },
        { status: 400 }
      )
    }

    // Calculate fine if overdue
    const dueDate = new Date(transaction.dueDate)
    const returnDate = new Date()
    let fineAmount = 0

    if (returnDate > dueDate) {
      const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      fineAmount = daysOverdue * 1.00 // $1.00 per day overdue
    }

    // Update transaction
    const updatedTransaction = await db.transaction.update({
      where: {
        id: transactionId
      },
      data: {
        returnDate,
        status: "RETURNED",
        fineAmount
      },
      include: {
        book: true,
        member: true
      }
    })

    // Update book available copies
    await db.book.update({
      where: {
        id: transaction.bookId
      },
      data: {
        availableCopies: {
          increment: 1
        }
      }
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error returning book:", error)
    return NextResponse.json(
      { error: "Failed to return book" },
      { status: 500 }
    )
  }
}