import PatientList from "@/components/nurse/patients-list";

export default function NursePatientsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Patient Management</h1>
      <PatientList />
    </div>
  )
}
