import DashboardShell from "@/components/doctor/dashboard-shell";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}

