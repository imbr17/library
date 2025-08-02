"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Book, Users, Clock, Plus, Search, Filter } from "lucide-react"
import { BookTable } from "@/components/library/book-table"
import { MemberTable } from "@/components/library/member-table"
import { TransactionTable } from "@/components/library/transaction-table"
import { AddBookDialog } from "@/components/library/add-book-dialog"
import { AddMemberDialog } from "@/components/library/add-member-dialog"
import { AddTransactionDialog } from "@/components/library/add-transaction-dialog"
import { DashboardStats } from "@/components/library/dashboard-stats"

interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  genre?: string
  description?: string
  totalCopies: number
  availableCopies: number
}

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
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
  fineAmount: number
}

export default function LibraryManagement() {
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [booksRes, membersRes, transactionsRes] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/members"),
        fetch("/api/transactions")
      ])

      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(booksData)
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setMembers(membersData)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAdded = (newBook: Book) => {
    setBooks(prev => [...prev, newBook])
  }

  const handleMemberAdded = (newMember: Member) => {
    setMembers(prev => [...prev, newMember])
  }

  const handleTransactionAdded = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction])
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTransactions = transactions.filter(transaction =>
    transaction.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.member.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalBooks: books.length,
    totalMembers: members.length,
    activeTransactions: transactions.filter(t => t.status === "BORROWED").length,
    overdueTransactions: transactions.filter(t => t.status === "OVERDUE").length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Management System</h1>
          <p className="text-muted-foreground">Manage your library's books, members, and transactions</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Professional Edition
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardStats stats={stats} />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Recent Books
                </CardTitle>
                <CardDescription>Latest additions to the library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {books.slice(0, 5).map((book) => (
                    <div key={book.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{book.title}</span>
                      <Badge variant="outline">{book.availableCopies}/{book.totalCopies}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  New Members
                </CardTitle>
                <CardDescription>Recently joined members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{member.name}</span>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest borrow/return activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{transaction.book.title}</span>
                      <Badge variant={
                        transaction.status === "BORROWED" ? "default" :
                        transaction.status === "RETURNED" ? "secondary" :
                        transaction.status === "OVERDUE" ? "destructive" : "outline"
                      }>
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="books" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <AddBookDialog onBookAdded={handleBookAdded} />
          </div>
          <BookTable books={filteredBooks} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <AddMemberDialog onMemberAdded={handleMemberAdded} />
          </div>
          <MemberTable members={filteredMembers} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <AddTransactionDialog 
              onTransactionAdded={handleTransactionAdded} 
              books={books}
              members={members}
            />
          </div>
          <TransactionTable transactions={filteredTransactions} onRefresh={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}