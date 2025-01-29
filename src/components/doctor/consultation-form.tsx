"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAppointmentData, saveConsultation } from "@/actions/doctor/consultation.action";
import { useSearchParams } from "next/navigation";

const consultationSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().min(1, "Consultation notes are required"),
  prescription: z.string().optional(),
  followUpDate: z.string().optional(),
});

interface ConsultationFormProps {
  appointmentId: string;
}

interface AppointmentData {
  id: number;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: "CHECK_UP" | "FOLLOW_UP" | "CONSULTATION" | "EMERGENCY";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "PENDING";
  vitalsChecked: boolean;
  vitals: VitalsData[];
  patient: {
    user: {
      name: string;
      avatar?: string;
    };
    patientId: string;
  };
}

interface VitalsData {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  weight?: string;
  height?: string;
}

export default function ConsultationForm() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      diagnosis: "",
      notes: "",
      prescription: "",
      followUpDate: "",
    },
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        if (!appointmentId) {
          throw new Error("Appointment ID is required");
        }

        const data = await getAppointmentData(appointmentId);
        setAppointment(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load appointment",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, toast]);

  const handleSubmit = async (data: z.infer<typeof consultationSchema>) => {
    try {
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const result = await saveConsultation(appointmentId, formData);
      
      if (result?.success) {
        toast({
          title: "Success!",
          description: "Consultation notes saved successfully",
        });
      } else {
        if (result?.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field as keyof z.infer<typeof consultationSchema>, {
              type: "manual",
              message: errors?.join(", "),
            });
          });
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || "Failed to save consultation",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save consultation",
      });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading appointment details...</div>;
  if (!appointment) return <div className="p-4 text-center">Appointment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Consultation Notes</h1>
          <p className="text-muted-foreground">
            {format(new Date(appointment.date), "MMMM d, yyyy")} at {appointment.time}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={appointment.patient.user.avatar || "/placeholder.svg"}
                  alt={appointment.patient.user.name}
                />
                <AvatarFallback>
                  {appointment.patient.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{appointment.patient.user.name}</div>
                <div className="text-sm text-muted-foreground">
                  Patient ID: {appointment.patient.patientId}
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div>
                <div className="font-medium mb-2">Vitals</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {appointment.vitals[0] && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>{" "}
                        {appointment.vitals[0].temperature}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blood Pressure:</span>{" "}
                        {appointment.vitals[0].bloodPressure}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Heart Rate:</span>{" "}
                        {appointment.vitals[0].heartRate}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Respiratory Rate:</span>{" "}
                        {appointment.vitals[0].respiratoryRate}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>{" "}
                        {appointment.vitals[0].weight || "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Height:</span>{" "}
                        {appointment.vitals[0].height || "N/A"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormDescription>
                        Include dosage and administration instructions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button type="submit">Save Consultation</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}