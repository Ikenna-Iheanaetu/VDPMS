import ConsultationForm from "@/components/doctor/consultation-form";

export default function ConsultationPage({ params }: { params: { id: string } }) {
  return <ConsultationForm appointmentId={params.id} />
}

