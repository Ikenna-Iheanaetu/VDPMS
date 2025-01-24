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
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function NurseAppointmentManager() {
  const [requests, setRequests] = useState<AppointmentRequest[]>(appointmentRequests)
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

  return (
    <Tabs defaultValue="requests">
      <TabsList>
        <TabsTrigger value="requests">Appointment Requests</TabsTrigger>
        <TabsTrigger value="new">New Appointment</TabsTrigger>
      </TabsList>
      <TabsContent value="requests">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Appointment Requests</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Preferred Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
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
                  <TableCell>{format(request.preferredDate, "PPP")}</TableCell>
                  <TableCell>{request.appointmentType}</TableCell>
                  <TableCell>{request.reason}</TableCell>
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
      </TabsContent>
      <TabsContent value="new">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">New Appointment</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-patient-name" className="text-right">
                Patient Name
              </Label>
              <Input
                id="new-patient-name"
                value={newAppointment.patientName}
                onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-patient-id" className="text-right">
                Patient ID
              </Label>
              <Input
                id="new-patient-id"
                value={newAppointment.patientId}
                onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-appointment-type" className="text-right">
                Appointment Type
              </Label>
              <Input
                id="new-appointment-type"
                value={newAppointment.appointmentType}
                onChange={(e) => setNewAppointment({ ...newAppointment, appointmentType: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="new-reason"
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-priority" className="text-right">
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
              <Label htmlFor="is-emergency" className="text-right">
                Emergency
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-emergency"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is-emergency">This is an emergency case</Label>
              </div>
            </div>
          </div>
          <Button onClick={handleNewAppointment}>
            {isEmergency ? "Create Emergency Appointment" : "Add Appointment Request"}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

