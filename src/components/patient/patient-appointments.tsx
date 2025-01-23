import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const appointments = [
  {
    id: 1,
    date: "2023-06-15",
    time: "10:00 AM",
    doctor: "Dr. Smith",
    type: "Check-up",
  },
  {
    id: 2,
    date: "2023-06-22",
    time: "2:30 PM",
    doctor: "Dr. Johnson",
    type: "Follow-up",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PatientAppointments({ patientId }: { patientId: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
          >
            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {appointment.type} with {appointment.doctor}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {appointment.date}
                <Clock className="ml-3 mr-1 h-3 w-3" />
                {appointment.time}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
