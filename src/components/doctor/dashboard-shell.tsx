"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import DoctorsSidebar from "./sidebar";
import logout from "@/actions/logout.action";
import { redirect } from "next/navigation";
import getCookieForClient from "@/actions/get-cookie-for-client.action";
import { useToast } from "@/hooks/use-toast";
import { getRecentPatients } from "@/actions/doctor/overview.action";
import { ConditionStatus } from "@prisma/client";

interface DashboardShellProps {
  children: React.ReactNode;
}

interface RecentPatients {
  id: number;
  name: string;
  patientId: string;
  diagnosis: string;
  lastVisit: Date | null;
  condition: ConditionStatus;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [recentPatients, setRecentPatients] = useState<RecentPatients[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getNurseName = async () => {
      try {
        const { data: cookieData } = await getCookieForClient();
        if (cookieData?.name) {
          setDoctorName(cookieData.name);
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

  useEffect(() => {
    const fetchRecentPatients = async () => {
      const result = await getRecentPatients();
      if (result.success && result.data) {
        setRecentPatients(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    };
    fetchRecentPatients();
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
        <DoctorsSidebar />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild></SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0">
          <DoctorsSidebar />
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
          <div className="flex items-center space-x-3 gap-2">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${doctorName}`}
                  alt={doctorName}
                />
                <AvatarFallback>
                  {" "}
                  {doctorName
                    .split(" ")
                    .map((n) => n[0])
                    .join()}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm hidden md:block">
                <div className="font-semibold">{doctorName}</div>
                <div className="text-muted-foreground">Doctor</div>
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
                      <TableRow key={patient.patientId}>
                        <TableCell>
                          <Link
                            href={`/patients/${patient.patientId}`}
                            className="hover:underline"
                          >
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.lastVisit ? patient.lastVisit.toDateString() : 'N/A'}
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              patient.condition === ConditionStatus.STABLE &&
                                "bg-green-100 text-green-800",
                              patient.condition === ConditionStatus.FOLLOW_UP &&
                                "bg-blue-100 text-blue-800",
                              patient.condition === ConditionStatus.CRITICAL &&
                                "bg-red-100 text-red-800"
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
  );
}
