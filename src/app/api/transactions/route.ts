import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        book: true,
        member: true
      },
      orderBy: {
        borrowDate: "desc"
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, memberId, dueDate } = body

    if (!bookId || !memberId || !dueDate) {
      return NextResponse.json(
        { error: "Book, member, and due date are required" },
        { status: 400 }
      )
    }

    // Check if book is available
    const book = await db.book.findUnique({
      where: {
        id: bookId
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      )
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: "Book is not available" },
        { status: 400 }
      )
    }

    // Check if member exists and is active
    const member = await db.member.findUnique({
      where: {
        id: memberId
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    if (!member.isActive) {
      return NextResponse.json(
        { error: "Member is not active" },
        { status: 400 }
      )
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        bookId,
        memberId,
        dueDate: new Date(dueDate),
        status: "BORROWED"
      },
      include: {
        book: true,
        member: true
      }
    })

    // Update book available copies
    await db.book.update({
      where: {
        id: bookId
      },
      data: {
        availableCopies: {
          decrement: 1
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}