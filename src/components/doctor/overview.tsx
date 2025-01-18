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

const stats = [
  {
    name: "Appointments",
    value: "24.4k",
    icon: Calendar,
    iconBgColor: "bg-[#9188FF]",
    color: "bg-[#7B5EFF]",
  },
  {
    name: "Total Patient",
    value: "166.3k",
    icon: Users2,
    iconBgColor: "bg-[#FF7175]",
    color: "bg-[#FF5363]",
  },
];

const appointments = [
  {
    name: "Jhon Smith",
    type: "Clinic Consulting",
    time: "Ongoing",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
  {
    name: "Frank Murray",
    type: "Video Consulting",
    time: "10:25",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
  {
    name: "Ella Lucia",
    type: "Emergency",
    time: "11:30",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
  {
    name: "Alyssa Dehn",
    type: "Clinic Consulting",
    time: "12:20",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
];

const patients = [
  {
    name: "Deveon Lane",
    visitId: "OPD-2345",
    date: "5/7/21",
    gender: "Male",
    disease: "Diabetes",
    status: "Out-Patient",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
  {
    name: "Albert Flores",
    visitId: "IPD-2424",
    date: "5/7/21",
    gender: "Male",
    disease: "Diabetes",
    status: "Out-Patient",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
  {
    name: "Ella Lucia",
    visitId: "OPD-2346",
    date: "8/15/21",
    gender: "Male",
    disease: "Diabetes",
    status: "Out-Patient",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%201-fcOLTxuNr96pozSky1IbMADW33Rm9x.png",
  },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, Dr. Stephen</h1>
        <p className="text-muted-foreground">Have a nice day at great work</p>
      </div>

      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.name} className={cn("overflow-hidden", stat.color)}>
            <div className="flex gap-6 justify-center items-center h-40">
              <div className={cn("p-4 rounded-full", stat.iconBgColor )}>
                <stat.icon className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
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
                  <TableHead>Visit Id</TableHead>
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
                  <TableRow key={patient.visitId}>
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
                    <TableCell className="whitespace-nowrap">
                      {patient.visitId}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {patient.date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {patient.disease}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {patient.status}
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
