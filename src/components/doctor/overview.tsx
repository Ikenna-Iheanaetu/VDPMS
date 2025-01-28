"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Users2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AppointmentStatus,
  AppointmentType,
  ConditionStatus,
  Gender,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getDashboardStats, getRecentPatients, getTodaysAppointments } from "@/actions/doctor/overview.action";


interface AppointmentsProps {
  id: number;
  name: string;
  type: AppointmentType;
  time: string;
  patientId: string;
  status: AppointmentStatus;
  condition?: ConditionStatus | null;
  image: string;
}

interface PatientsProps{
  id: number
  patientId: string
  name: string
  diagnosis: string
  lastVisit: Date | null
  condition: ConditionStatus
  gender: Gender
  image: string
}


interface StatsProps {
  appointments: number;
  patients: number;
}

export default function Overview() {
  const [stats, setStats] = useState<StatsProps>({
    appointments: 0,
    patients: 0,
  });
  const [appointments, setAppointments] = useState<AppointmentsProps[]>([]);
  const [patients, setPatients] = useState<PatientsProps[]>([]);
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch stats
      const statsResult = await getDashboardStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        toast({
          title: "Error",
          description: statsResult.error,
          variant: "destructive",
        });
      }

      // Fetch appointments
      const appointmentsResult = await getTodaysAppointments();
      if (appointmentsResult.success && appointmentsResult.data) {
        setAppointments(appointmentsResult.data);
      } else {
        toast({
          title: "Error",
          description: appointmentsResult.error,
          variant: "destructive",
        });
      }

      // Fetch patients
      const patientsResult = await getRecentPatients();
      if (patientsResult.success && patientsResult.data) {
        setPatients(patientsResult.data);
      } else {
        toast({
          title: "Error",
          description: patientsResult.error,
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const statsData = [
    {
      name: "Appointments",
      value: stats.appointments.toLocaleString(),
      icon: Calendar,
      iconBgColor: "bg-[#9188FF]",
      color: "bg-[#7B5EFF]",
    },
    {
      name: "Total Patient",
      value: stats.patients.toLocaleString(),
      icon: Users2,
      iconBgColor: "bg-[#FF7175]",
      color: "bg-[#FF5363]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, Dr. Stephen</h1>
        <p className="text-muted-foreground">Have a nice day at great work</p>
      </div>

      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-2">
        {statsData
        .map((stat) => (
          <Card key={stat.name} className={cn("overflow-hidden", stat.color)}>
            <div className="flex gap-6 justify-center items-center h-40">
              <div className={cn("p-4 rounded-full", stat.iconBgColor)}>
                <stat.icon className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-white/70">{stat.name}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today Appointments</CardTitle>
              <div className="hidden sm:block">
                {/* <Calendar className="w-fit" mode="single" /> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={appointment.image} />
                      <AvatarFallback>
                        {appointment.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{appointment.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">{appointment.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-x-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Patients</CardTitle>
              <Button variant="ghost" className="text-sm text-[#3FBFFF]">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Disease
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={patient.image} />
                          <AvatarFallback>
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="whitespace-nowrap">
                          {patient.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {patient.diagnosis}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      { patient.condition }
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
