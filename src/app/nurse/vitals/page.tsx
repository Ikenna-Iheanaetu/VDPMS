import VitalsMonitoring from "@/components/nurse/vitals-monitoring";

export default function NurseVitalsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Vitals Monitoring</h1>
      <VitalsMonitoring />
    </div>
  )
}

