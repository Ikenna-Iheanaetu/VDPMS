"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  getAppointmentRequests,
  getScheduledAppointments,
  fetchDoctors,
  createAppointmentRequest,
  scheduleAppointment,
  updateAppointmentStatus,
  recordVitals,
} from "@/actions/nurse/appointments.action";
import { AppointmentType, Priority } from "@prisma/client";

type AppointmentRequest = {
  id: number;
  patientName: string;
  patientId: string;
  preferredDate: Date;
  appointmentType: string;
  reason: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  priority: "normal" | "urgent" | "emergency";
};

type ScheduledAppointment = {
  id: number;
  patientName: string;
  patientId: string;
  date: Date;
  time: string;
  appointmentType: string;
  reason: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  vitalsChecked?: boolean;
  vitals?: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
  };
  doctor: {
    id: number;
    label: string;
    value: string;
  };
};

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  appointmentType: z.nativeEnum(AppointmentType, {
    required_error: "Please select an appointment type.",
  }),
  reason: z.string().min(1, "Reason is required"),
  priority: z.nativeEnum(Priority, {
    required_error: "Please select a priority",
  }),
  preferredDate: z.date({
    required_error: "Please select a preferred date.",
  }),
});

export default function NurseAppointmentManager() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<AppointmentRequest | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    undefined
  );
  const [scheduledTime, setScheduledTime] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newAppointment, setNewAppointment] = useState<
    Partial<AppointmentRequest>
  >({
    patientName: "",
    patientId: "",
    appointmentType: "",
    reason: "",
    priority: "normal",
  });
  const [vitalsCheck, setVitalsCheck] = useState<{
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
  }>({
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
  });
  const [doctors, setDoctors] = useState<
    { id: string; label: string; value: string }[]
  >([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientId: "",
      appointmentType: AppointmentType.CONSULTATION,
      reason: "",
      priority: Priority.NORMAL,
      preferredDate: new Date(),
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requestsData, appointmentsData, doctorsData] = await Promise.all(
          [getAppointmentRequests(), getScheduledAppointments(), fetchDoctors()]
        );
        setRequests(requestsData);
        setAppointments(appointmentsData);
        setDoctors(doctorsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: (error as Error).message,
        });
      }
    };
    loadData();
  }, [toast]);

  const handleSchedule = async () => {
    if (
      !selectedRequest ||
      !scheduledDate ||
      !scheduledTime ||
      !selectedDoctor
    ) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a date, time, and doctor",
      });
      return;
    }

    try {
      await scheduleAppointment(selectedRequest.id, {
        date: scheduledDate,
        time: scheduledTime,
        doctorId: selectedDoctor,
      });

      const [updatedRequests, updatedAppointments] = await Promise.all([
        getAppointmentRequests(),
        getScheduledAppointments(),
      ]);

      setRequests(updatedRequests);
      setAppointments(updatedAppointments);
      resetScheduleState();

      toast({
        title: "Appointment Scheduled",
        description: `Scheduled ${selectedRequest.patientName}'s ${selectedRequest.appointmentType} appointment`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scheduling failed",
        description: (error as Error).message,
      });
    }
  };

  const handleNewAppointment = async (values: z.infer<typeof formSchema>) => {
    try {
      await createAppointmentRequest(values);

      const updatedRequests = await getAppointmentRequests();
      setRequests(updatedRequests);
      form.reset();

      toast({
        title: "Request Created",
        description: `New appointment request for ${values.patientName}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: (error as Error).message,
      });
    }
  };

  const getPriorityBadge = (priority: AppointmentRequest["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "emergency":
        return <Badge variant="destructive">Emergency</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const handleUpdateStatus = async (
    appointmentId: number,
    status: "scheduled" | "in-progress" | "completed" | "cancelled"
  ) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      const updatedAppointments = await getScheduledAppointments();
      setAppointments(updatedAppointments);
      toast({ title: "Status Updated", description: `Updated to ${status}` });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: (error as Error).message,
      });
    }
  };

  const handleVitalsSubmit = async (appointmentId?: number) => {
    try {
      await recordVitals(appointmentId!, vitalsCheck);
      const updatedAppointments = await getScheduledAppointments();
      setAppointments(updatedAppointments);
      setVitalsCheck({
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
      });
      toast({
        title: "Vitals Recorded",
        description: "Vitals successfully recorded",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: (error as Error).message,
      });
    }
  };

  const resetScheduleState = () => {
    setSelectedRequest(null);
    setScheduledDate(undefined);
    setScheduledTime("");
    setSelectedDoctor("");
  };

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
                  <DialogDescription>
                    Create a new appointment request or emergency appointment.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={form.handleSubmit((data) => {
                    handleNewAppointment(data);
                  })}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patientName" className="text-right">
                        Patient Name
                      </Label>
                      <Input
                        id="patientName"
                        {...form.register("patientName")}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patientId" className="text-right">
                        Patient ID
                      </Label>
                      <Input
                        id="patientId"
                        {...form.register("patientId")}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="appointmentType" className="text-right">
                        Type
                      </Label>

                      <Select {...form.register("appointmentType")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value={AppointmentType.CHECK_UP}>
                            Regular Check-up
                          </SelectItem>
                          <SelectItem value={AppointmentType.FOLLOW_UP}>
                            Follow-up
                          </SelectItem>
                          <SelectItem value={AppointmentType.CONSULTATION}>
                            Consultation
                          </SelectItem>
                          <SelectItem value={AppointmentType.EMERGENCY}>
                            Emergency
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reason" className="text-right">
                        Reason
                      </Label>
                      <Textarea
                        id="reason"
                        {...form.register("reason")}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select {...form.register("priority")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Priority.NORMAL}>
                            Normal
                          </SelectItem>
                          <SelectItem value={Priority.URGENT}>
                            Urgent
                          </SelectItem>
                          <SelectItem value={Priority.EMERGENCY}>
                            Emergency
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="preferredDate" className="text-right">
                        Preferred Date
                      </Label>
                      <div className="col-span-3">
                        <Calendar
                          mode="single"
                          selected={form.watch("preferredDate")}
                          onSelect={(date) =>
                            form.setValue("preferredDate", date as Date)
                          }
                          disabled={(date) =>
                            date < new Date() ||
                            date >
                              new Date(
                                new Date().setMonth(new Date().getMonth() + 2)
                              )
                          }
                          initialFocus
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Appointment Request</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Preferred Date
                  </TableHead>
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
                    <TableCell className="hidden md:table-cell">
                      {format(request.preferredDate, "PPP")}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {request.appointmentType}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {request.reason}
                    </TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "scheduled"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            {request.status === "pending" ? "Schedule" : "View"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {request.status === "pending"
                                ? "Schedule Appointment"
                                : "Appointment Details"}
                            </DialogTitle>
                            <DialogDescription>
                              {request.status === "pending"
                                ? `Set the date and time for ${request.patientName}'s ${request.appointmentType} appointment.`
                                : `Details for ${request.patientName}'s appointment.`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="patient-name"
                                className="text-right"
                              >
                                Patient
                              </Label>
                              <Input
                                id="patient-name"
                                value={request.patientName}
                                className="col-span-3"
                                readOnly
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="patient-id"
                                className="text-right"
                              >
                                Patient ID
                              </Label>
                              <Input
                                id="patient-id"
                                value={request.patientId}
                                className="col-span-3"
                                readOnly
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="appointment-type"
                                className="text-right"
                              >
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
                              <Textarea
                                id="reason"
                                value={request.reason}
                                className="col-span-3"
                                readOnly
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="doctor" className="text-right">
                                Doctor
                              </Label>
                              <Select
                                value={selectedDoctor}
                                onValueChange={setSelectedDoctor}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {doctors.map((doctor) => (
                                    <SelectItem
                                      key={doctor.id}
                                      value={doctor.id}
                                    >
                                      {doctor.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
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
                                onChange={(e) =>
                                  setScheduledTime(e.target.value)
                                }
                                className="col-span-3"
                              />
                            </div>
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
                  <TableHead>Doctor</TableHead>
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
                    <TableCell className="hidden sm:table-cell">
                      {appointment.appointmentType}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {appointment.reason}
                    </TableCell>
                    <TableCell>
                      {doctors.find(
                        (doc) => doc.value === appointment.doctor.value
                      )?.label || "N/A"}
                    </TableCell>
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
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {appointment.status === "scheduled" ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">Check Vitals</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Check Patient Vitals</DialogTitle>
                              <DialogDescription>
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                Record the patient's vitals before their
                                appointment with the doctor.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="temperature"
                                  className="text-right"
                                >
                                  Temperature
                                </Label>
                                <Input
                                  id="temperature"
                                  placeholder="98.6°F"
                                  className="col-span-3"
                                  value={vitalsCheck.temperature}
                                  onChange={(e) =>
                                    setVitalsCheck({
                                      ...vitalsCheck,
                                      temperature: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="bloodPressure"
                                  className="text-right"
                                >
                                  Blood Pressure
                                </Label>
                                <Input
                                  id="bloodPressure"
                                  placeholder="120/80 mmHg"
                                  className="col-span-3"
                                  value={vitalsCheck.bloodPressure}
                                  onChange={(e) =>
                                    setVitalsCheck({
                                      ...vitalsCheck,
                                      bloodPressure: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="heartRate"
                                  className="text-right"
                                >
                                  Heart Rate
                                </Label>
                                <Input
                                  id="heartRate"
                                  placeholder="72 bpm"
                                  className="col-span-3"
                                  value={vitalsCheck.heartRate}
                                  onChange={(e) =>
                                    setVitalsCheck({
                                      ...vitalsCheck,
                                      heartRate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="respiratoryRate"
                                  className="text-right"
                                >
                                  Respiratory Rate
                                </Label>
                                <Input
                                  id="respiratoryRate"
                                  placeholder="16 breaths/min"
                                  className="col-span-3"
                                  value={vitalsCheck.respiratoryRate}
                                  onChange={(e) =>
                                    setVitalsCheck({
                                      ...vitalsCheck,
                                      respiratoryRate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() =>
                                  handleVitalsSubmit(appointment.id)
                                }
                              >
                                Record Vitals
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Select
                          onValueChange={(value) =>
                            handleUpdateStatus(
                              appointment.id,
                              value as ScheduledAppointment["status"]
                            )
                          }
                          defaultValue={appointment.status}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
