import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const books = await db.book.findMany({
      orderBy: {
        addedAt: "desc"
      }
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, author, isbn, genre, description, totalCopies, availableCopies } = body

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      )
    }

    const book = await db.book.create({
      data: {
        title,
        author,
        isbn: isbn || null,
        genre: genre || null,
        description: description || null,
        totalCopies: totalCopies || 1,
        availableCopies: availableCopies || totalCopies || 1,
      }
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    )
  }
}