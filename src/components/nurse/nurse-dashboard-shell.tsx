"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NurseAppSidebar from "./nurse-app-sidebar";

interface NurseDashboardShellProps {
  children: React.ReactNode;
}

export default function NurseDashboardShell({ children }: NurseDashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <NurseAppSidebar />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0">
          <NurseAppSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/nurse-avatar.png" alt="Nurse" />
                <AvatarFallback>NN</AvatarFallback>
              </Avatar>
              <div className="text-sm hidden md:block">
                <div className="font-semibold">Nancy Nurse</div>
                <div className="text-muted-foreground">Nurse</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
