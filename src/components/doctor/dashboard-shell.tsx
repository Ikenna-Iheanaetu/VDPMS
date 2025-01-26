"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, HelpCircle, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import DoctorsSidebar from "./sidebar"

interface DashboardShellProps {
  children: React.ReactNode
}

const recentPatients = [
  {
    id: "P001",
    name: "Olivia Martin",
    diagnosis: "Hypertension",
    lastVisit: "1 hour ago",
    status: "Stable",
  },
  {
    id: "P002",
    name: "Jackson Lee",
    diagnosis: "Type 2 Diabetes",
    lastVisit: "2 hours ago",
    status: "Follow-up",
  },
  {
    id: "P003",
    name: "Isabella Nguyen",
    diagnosis: "Asthma",
    lastVisit: "3 hours ago",
    status: "Critical",
  },
]

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <DoctorsSidebar />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0">
          <DoctorsSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Input type="search" placeholder="Search patients..." className="max-w-[400px] hidden md:block" />
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="Dr. Stephen" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="flex flex-1">
          <main className="flex-1 p-4 lg:p-6">{children}</main>
          <div className="hidden xl:block w-80 border-l p-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Diagnosis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Link href={`/patients/${patient.id}`} className="hover:underline">
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">{patient.lastVisit}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              patient.status === "Stable" && "bg-green-100 text-green-800",
                              patient.status === "Follow-up" && "bg-blue-100 text-blue-800",
                              patient.status === "Critical" && "bg-red-100 text-red-800",
                            )}
                          >
                            {patient.diagnosis}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

