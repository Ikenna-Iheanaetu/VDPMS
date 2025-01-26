"use client"

import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Appointment = {
  id: string
  patientName: string
  patientId: string
  time: string
  type: string
  status: "waiting" | "in-progress" | "completed"
  vitalsChecked: boolean
}

const appointments: Appointment[] = [
  {
    id: "1",
    patientName: "Olivia Martin",
    patientId: "P001",
    time: "9:00 AM",
    type: "Check-up",
    status: "waiting",
    vitalsChecked: true,
  },
  {
    id: "2",
    patientName: "William Kim",
    patientId: "P002",
    time: "10:30 AM",
    type: "Follow-up",
    status: "waiting",
    vitalsChecked: true,
  },
  {
    id: "3",
    patientName: "Sofia Davis",
    patientId: "P003",
    time: "2:00 PM",
    type: "Consultation",
    status: "waiting",
    vitalsChecked: false,
  },
]

export default function DoctorAppointments() {
  const router = useRouter()
  const today = new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments for {format(today, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt={appointment.patientName} />
                      <AvatarFallback>
                        {appointment.patientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-muted-foreground">ID: {appointment.patientId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === "completed"
                        ? "default"
                        : appointment.status === "in-progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {appointment.status === "waiting" && !appointment.vitalsChecked
                      ? "Awaiting Vitals"
                      : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    disabled={!appointment.vitalsChecked}
                    onClick={() => router.push(`/consultations/${appointment.id}`)}
                  >
                    {appointment.vitalsChecked ? "Start Consultation" : "Waiting for Nurse"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

