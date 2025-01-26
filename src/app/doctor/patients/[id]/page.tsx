import PatientDetails from "@/components/doctor/patient-details";

export default function PatientPage({ params }: { params: { id: string } }) {
  return <PatientDetails patientId={params.id} />
}
