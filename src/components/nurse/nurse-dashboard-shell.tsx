"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NurseAppSidebar from "./nurse-app-sidebar";
import logout from "@/actions/logout.action";
import { redirect } from "next/navigation";
import getCookieForClient from "@/actions/get-cookie-for-client.action";
import { useToast } from "@/hooks/use-toast";

interface NurseDashboardShellProps {
  children: React.ReactNode;
}

export default function NurseDashboardShell({
  children,
}: NurseDashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [nurseName, setNurseName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const getNurseName = async () => {
      try {
        const { data: cookieData } = await getCookieForClient();
        if (cookieData?.name) {
          setNurseName(cookieData.name);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get nurse name",
          variant: "destructive",
        });
      }
    };

    getNurseName();
  }, [toast]);

  const handleLogout = async () => {
    const loggedOut = await logout();

    if (loggedOut.success && loggedOut.data) {
      redirect(loggedOut.data?.redirectUrl);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <NurseAppSidebar />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild></SheetTrigger>
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
            <div className="flex items-center space-x-3 gap-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${nurseName}`}
                    alt={nurseName}
                  />
                  <AvatarFallback>
                    {nurseName
                      .split(" ")
                      .map((n) => n[0])
                      .join()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm hidden md:block">
                  <div className="font-semibold">{nurseName}</div>
                  <div className="text-muted-foreground">Nurse</div>
                </div>
              </div>
              <div>
                <Button
                  className="bg-red-500 text-white"
                  onClick={() => handleLogout()}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
