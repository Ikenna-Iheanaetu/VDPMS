// components/patient-appointments.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { getAppointments } from "@/actions/patient/appointments.action";
import AppointmentRequestDialog from "./patient-appointment-dialog";
import { useToast } from "@/hooks/use-toast";

export function PatientAppointments() {
  const [appointments, setAppointments] = useState<
    Awaited<ReturnType<typeof getAppointments>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed",
          description:
            err instanceof Error
              ? err.message
              : "Failed to load appointments",
        });
        setError(
          err instanceof Error ? err.message : "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upcoming Appointments</CardTitle>
        <AppointmentRequestDialog />
      </CardHeader>
      <CardContent>
        {appointments ? (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {appointment.type} with Dr. {appointment.doctor.user.name}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  {appointment.date.toISOString().split("T")[0]}
                  <Clock className="ml-3 mr-1 h-3 w-3" />
                  {appointment.time}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center">
            <p>No upcoming appointments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
