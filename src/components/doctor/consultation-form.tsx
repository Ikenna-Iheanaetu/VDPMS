"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

const consultationSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().min(1, "Consultation notes are required"),
  prescription: z.string().optional(),
  followUpDate: z.string().optional(),
})

interface ConsultationFormProps {
  appointmentId: string
}

export default function ConsultationForm({ appointmentId }: ConsultationFormProps) {
  // In a real app, fetch appointment and patient data based on ID
  const appointment = {
    id: appointmentId,
    patientName: "John Doe",
    patientId: "P001",
    date: new Date(),
    time: "10:00 AM",
    type: "Follow-up",
    vitals: {
      temperature: "98.6°F",
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      respiratoryRate: "16/min",
      weight: "70 kg",
      height: "175 cm",
    },
  }

  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      diagnosis: "",
      notes: "",
      prescription: "",
      followUpDate: "",
    },
  })
  const { toast } = useToast()

  function onSubmit(data: z.infer<typeof consultationSchema>) {
    toast({
      title: "Consultation saved",
      description: "The consultation notes have been saved successfully.",
    })
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Consultation Notes</h1>
          <p className="text-muted-foreground">
            {format(appointment.date, "MMMM d, yyyy")} at {appointment.time}
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
                <AvatarImage src="/placeholder.svg" alt={appointment.patientName} />
                <AvatarFallback>
                  {appointment.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{appointment.patientName}</div>
                <div className="text-sm text-muted-foreground">Patient ID: {appointment.patientId}</div>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <div className="font-medium mb-2">Vitals</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Temperature:</span> {appointment.vitals.temperature}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood Pressure:</span> {appointment.vitals.bloodPressure}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Heart Rate:</span> {appointment.vitals.heartRate}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Respiratory Rate:</span>{" "}
                    {appointment.vitals.respiratoryRate}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Weight:</span> {appointment.vitals.weight}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Height:</span> {appointment.vitals.height}
                  </div>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>Enter any medications to be prescribed</FormDescription>
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
  )
}

