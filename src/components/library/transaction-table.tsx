"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Clock, ChevronLeft, ChevronRight } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
}

interface Member {
  id: string
  name: string
  email: string
}

interface Transaction {
  id: string
  book: Book
  member: Member
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: string
  fineAmount: number
}

interface TransactionTableProps {
  transactions: Transaction[]
  onRefresh: () => void
}

const ITEMS_PER_PAGE = 10

export function TransactionTable({ transactions, onRefresh }: TransactionTableProps) {
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleReturn = async (transactionId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/transactions/${transactionId}/return`, {
        method: "POST",
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert("Failed to return book")
      }
    } catch (error) {
      console.error("Error returning book:", error)
      alert("Error returning book")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "BORROWED":
        return <Badge variant="default">Borrowed</Badge>
      case "RETURNED":
        return <Badge variant="secondary">Returned</Badge>
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>
      case "LOST":
        return <Badge variant="outline">Lost</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Track book borrowings and returns ({transactions.length} total transactions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.book.title}</TableCell>
                    <TableCell>{transaction.member.name}</TableCell>
                    <TableCell>{new Date(transaction.borrowDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(transaction.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {transaction.returnDate 
                        ? new Date(transaction.returnDate).toLocaleDateString() 
                        : "Not returned"
                      }
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      {transaction.fineAmount > 0 ? `$${transaction.fineAmount.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.status === "BORROWED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReturn(transaction.id)}
                            disabled={loading}
                          >
                            Return
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, transactions.length)} of {transactions.length} transactions
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}