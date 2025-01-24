import NurseDashboardShell from "@/components/nurse/nurse-dashboard-shell";

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return <NurseDashboardShell>{children}</NurseDashboardShell>
}

