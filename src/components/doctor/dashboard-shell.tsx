"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[250px] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-8">
              <Avatar>
                <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png" alt="User" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div className="text-sm space-y-2 hidden md:block">
                <div className="font-semibold">Stephen Conley</div>
                <div className="text-muted-foreground font-normal">Cardiologist</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

