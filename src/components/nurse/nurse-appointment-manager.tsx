"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type AppointmentRequest = {
  id: number
  patientName: string
  patientId: string
  preferredDate: Date
  appointmentType: string
  reason: string
  status: "pending" | "scheduled" | "completed" | "cancelled"
  priority: "normal" | "urgent" | "emergency"
}

type ScheduledAppointment = {
  id: number
  patientName: string
  patientId: string
  date: Date
  time: string
  appointmentType: string
  reason: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
}

const appointmentRequests: AppointmentRequest[] = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: "P001",
    preferredDate: new Date(2023, 5, 20),
    appointmentType: "Check-up",
    reason: "Annual physical examination",
    status: "pending",
    priority: "normal",
  },
  {
    id: 2,
    patientName: "Jane Smith",
    patientId: "P002",
    preferredDate: new Date(2023, 5, 22),
    appointmentType: "Consultation",
    reason: "Persistent headaches",
    status: "pending",
    priority: "urgent",
  },
  {
    id: 3,
    patientName: "Bob Johnson",
    patientId: "P003",
    preferredDate: new Date(2023, 5, 25),
    appointmentType: "Follow-up",
    reason: "Post-surgery check",
    status: "pending",
    priority: "normal",
  },
]

const scheduledAppointments: ScheduledAppointment[] = [
  {
    id: 1,
    patientName: "Alice Brown",
    patientId: "P004",
    date: new Date(2023, 5, 21),
    time: "10:00 AM",
    appointmentType: "Check-up",
    reason: "Routine health check",
    status: "scheduled",
  },
  {
    id: 2,
    patientName: "Charlie Davis",
    patientId: "P005",
    date: new Date(2023, 5, 22),
    time: "2:30 PM",
    appointmentType: "Follow-up",
    reason: "Review test results",
    status: "scheduled",
  },
]

export default function NurseAppointmentManager() {
  const [requests, setRequests] = useState<AppointmentRequest[]>(appointmentRequests)
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>(scheduledAppointments)
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  const [scheduledTime, setScheduledTime] = useState<string>("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [newAppointment, setNewAppointment] = useState<Partial<AppointmentRequest>>({
    patientName: "",
    patientId: "",
    appointmentType: "",
    reason: "",
    priority: "normal",
  })
  const { toast } = useToast()

  const handleSchedule = () => {
    if (selectedRequest && scheduledDate && scheduledTime) {
      const updatedRequests = requests.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: "scheduled" as const } : req,
      )
      setRequests(updatedRequests)

      const newScheduledAppointment: ScheduledAppointment = {
        id: appointments.length + 1,
        patientName: selectedRequest.patientName,
        patientId: selectedRequest.patientId,
        date: scheduledDate,
        time: scheduledTime,
        appointmentType: selectedRequest.appointmentType,
        reason: selectedRequest.reason,
        status: "scheduled",
      }
      setAppointments([...appointments, newScheduledAppointment])

      toast({
        title: "Appointment Scheduled",
        description: `Appointment for ${selectedRequest.patientName} scheduled for ${format(scheduledDate, "PPP")} at ${scheduledTime}.`,
      })

      setSelectedRequest(null)
      setScheduledDate(undefined)
      setScheduledTime("")
    }
  }

  const handleNewAppointment = () => {
    const newId = Math.max(...requests.map((r) => r.id)) + 1
    const newRequest: AppointmentRequest = {
      ...(newAppointment as AppointmentRequest),
      id: newId,
      preferredDate: new Date(),
      status: isEmergency ? "scheduled" : "pending",
      priority: isEmergency ? "emergency" : (newAppointment.priority as "normal" | "urgent"),
    }
    setRequests([...requests, newRequest])
    setNewAppointment({
      patientName: "",
      patientId: "",
      appointmentType: "",
      reason: "",
      priority: "normal",
    })
    setIsEmergency(false)

    toast({
      title: isEmergency ? "Emergency Appointment Created" : "New Appointment Request Added",
      description: `${isEmergency ? "Emergency appointment" : "Appointment request"} for ${newRequest.patientName} has been ${isEmergency ? "scheduled" : "added"}.`,
    })
  }

  const getPriorityBadge = (priority: AppointmentRequest["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "emergency":
        return <Badge variant="destructive">Emergency</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const handleUpdateAppointmentStatus = (id: number, newStatus: ScheduledAppointment["status"]) => {
    const updatedAppointments = appointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    setAppointments(updatedAppointments)
    toast({
      title: "Appointment Status Updated",
      description: `Appointment status changed to ${newStatus}.`,
    })
  }

  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="requests">Appointment Requests</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled Appointments</TabsTrigger>
      </TabsList>
      <TabsContent value="requests">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Appointment Requests</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>New Appointment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>New Appointment Request</DialogTitle>
                  <DialogDescription>Create a new appointment request or emergency appointment.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientName" className="text-right">
                      Patient Name
                    </Label>
                    <Input
                      id="patientName"
                      value={newAppointment.patientName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientId" className="text-right">
                      Patient ID
                    </Label>
                    <Input
                      id="patientId"
                      value={newAppointment.patientId}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="appointmentType" className="text-right">
                      Type
                    </Label>
                    <Input
                      id="appointmentType"
                      value={newAppointment.appointmentType}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentType: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>
                    <Textarea
                      id="reason"
                      value={newAppointment.reason}
                      onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, priority: value as "normal" | "urgent" })
                      }
                      defaultValue={newAppointment.priority}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isEmergency" className="text-right">
                      Emergency
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isEmergency"
                        checked={isEmergency}
                        onChange={(e) => setIsEmergency(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="isEmergency">This is an emergency case</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleNewAppointment}>
                    {isEmergency ? "Create Emergency Appointment" : "Add Appointment Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead className="hidden md:table-cell">Preferred Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Reason</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>{request.patientId}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(request.preferredDate, "PPP")}</TableCell>
                    <TableCell className="hidden sm:table-cell">{request.appointmentType}</TableCell>
                    <TableCell className="hidden lg:table-cell">{request.reason}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === "scheduled" ? "default" : "secondary"}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedRequest(request)}>
                            {request.status === "pending" ? "Schedule" : "View"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {request.status === "pending" ? "Schedule Appointment" : "Appointment Details"}
                            </DialogTitle>
                            <DialogDescription>
                              {request.status === "pending"
                                ? `Set the date and time for ${request.patientName}'s ${request.appointmentType} appointment.`
                                : `Details for ${request.patientName}'s appointment.`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="patient-name" className="text-right">
                                Patient
                              </Label>
                              <Input id="patient-name" value={request.patientName} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="patient-id" className="text-right">
                                Patient ID
                              </Label>
                              <Input id="patient-id" value={request.patientId} className="col-span-3" readOnly />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="appointment-type" className="text-right">
                                Type
                              </Label>
                              <Input
                                id="appointment-type"
                                value={request.appointmentType}
                                className="col-span-3"
                                readOnly
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="reason" className="text-right">
                                Reason
                              </Label>
                              <Textarea id="reason" value={request.reason} className="col-span-3" readOnly />
                            </div>
                            {request.status === "pending" && (
                              <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="date" className="text-right">
                                    Date
                                  </Label>
                                  <div className="col-span-3">
                                    <Calendar
                                      mode="single"
                                      selected={scheduledDate}
                                      onSelect={setScheduledDate}
                                      className="rounded-md border"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="time" className="text-right">
                                    Time
                                  </Label>
                                  <Input
                                    id="time"
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="col-span-3"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <DialogFooter>
                            {request.status === "pending" && (
                              <Button type="submit" onClick={handleSchedule}>
                                Schedule Appointment
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="scheduled">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Scheduled Appointments</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{appointment.patientId}</TableCell>
                    <TableCell>{format(appointment.date, "PPP")}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell className="hidden sm:table-cell">{appointment.appointmentType}</TableCell>
                    <TableCell className="hidden md:table-cell">{appointment.reason}</TableCell>
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
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(value) =>
                          handleUpdateAppointmentStatus(appointment.id, value as ScheduledAppointment["status"])
                        }
                        defaultValue={appointment.status}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

