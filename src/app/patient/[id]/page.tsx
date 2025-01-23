import { PatientProfile } from "@/components/patient/patient-profile";
import { PatientAppointments } from "@/components/patient/patient-appointments";
import { PatientMedicalHistory } from "@/components/patient/patient-medical-history";

export default function PatientPage({ params }: { params: { id: string } }) {
  // In a real application, we would fetch the patient data here
  const patient = {
    id: params.id,
    name: "John Doe",
    age: 35,
    gender: "Male",
    bloodType: "A+",
    phone: "+1 (555) 123-4567",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown, USA",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Patient Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <PatientProfile patient={patient} />
        <PatientAppointments patientId={patient.id} />
      </div>
      <PatientMedicalHistory patientId={patient.id} />
    </div>
  );
}
