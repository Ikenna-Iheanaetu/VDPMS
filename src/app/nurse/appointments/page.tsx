import NurseAppointmentManager from "@/components/nurse/nurse-appointment-manager";


export default function NurseAppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Appointment Management</h1>
      <NurseAppointmentManager />
    </div>
  )
}

