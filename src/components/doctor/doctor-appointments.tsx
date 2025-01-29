"use client"

import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTodayAppointments, startAppointment } from "@/actions/doctor/appointments.action"
import { AppointmentStatus, AppointmentType } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { useState } from "react"

type Appointment = {
  id: string
  patientName: string
  patientId: string
  time: string
  type: AppointmentType
  status: AppointmentStatus
  vitalsChecked: boolean
}

export default function DoctorAppointments() {
  const router = useRouter()
  const today = new Date()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointments = async () => {
      const result = await getTodayAppointments();
      if (result.data) {
        setAppointments(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    };
    fetchAppointments();
  }, [toast])

  const handleStartConsultation = async (appointmentId: string) => {
    try {
      await startAppointment(appointmentId)
      router.push(`/doctor/appointments/consultation/?appointmentId=${appointmentId}`)
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start consultation. Please try again.",
        variant: "destructive",
      })
    }
  }

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
                      appointment.status === "COMPLETED"
                        ? "default"
                        : appointment.status === "IN_PROGRESS"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {appointment.status === "SCHEDULED" && !appointment.vitalsChecked
                      ? "Awaiting Vitals"
                      : appointment.status.toLowerCase().replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    disabled={!appointment.vitalsChecked}
                    onClick={() => handleStartConsultation(appointment.id)}
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