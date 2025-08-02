"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  availableCopies: number
}

interface Member {
  id: string
  name: string
  email: string
  isActive: boolean
}

interface Transaction {
  id: string
  book: Book
  member: Member
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: string
}

interface AddTransactionDialogProps {
  onTransactionAdded: (transaction: Transaction) => void
  books: Book[]
  members: Member[]
}

export function AddTransactionDialog({ onTransactionAdded, books, members }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bookId: "",
    memberId: "",
    dueDate: new Date(),
  })

  const availableBooks = books.filter(book => book.availableCopies > 0)
  const activeMembers = members.filter(member => member.isActive)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate.toISOString(),
        }),
      })

      if (response.ok) {
        const newTransaction = await response.json()
        onTransactionAdded(newTransaction)
        setFormData({
          bookId: "",
          memberId: "",
          dueDate: new Date(),
        })
        setOpen(false)
      } else {
        const error = await response.json()
        alert(error.message || "Failed to create transaction")
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      alert("Error creating transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Create a new book borrowing transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book">Book *</Label>
            <Select value={formData.bookId} onValueChange={(value) => setFormData({ ...formData, bookId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {availableBooks.length === 0 ? (
                  <SelectItem value="" disabled>
                    No available books
                  </SelectItem>
                ) : (
                  availableBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} by {book.author} ({book.availableCopies} available)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="member">Member *</Label>
            <Select value={formData.memberId} onValueChange={(value) => setFormData({ ...formData, memberId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.length === 0 ? (
                  <SelectItem value="" disabled>
                    No active members
                  </SelectItem>
                ) : (
                  activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => {
                    if (date) {
                      setFormData({ ...formData, dueDate: date })
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !formData.bookId || !formData.memberId}>
              {loading ? "Creating..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}