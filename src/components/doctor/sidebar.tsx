"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, Calendar, Users2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Overview",
    href: "/doctor",
    icon: LayoutGrid,
  },
  {
    name: "Appointment",
    href: "/doctor/appointments",
    icon: Calendar,
  },
  {
    name: "My Patients",
    href: "/doctor/patients",
    icon: Users2,
  },
  {
    name: "Settings",
    href: "/doctor/settings",
    icon: Settings,
  },
];

export default function DoctorsSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white text-white">
      <div className="p-6 text-black">
        <div className="flex items-center gap-2 font-semibold">
          <div className="rounded-lg bg-primary p-1 ">
            <div className="h-6 w-6" />
          </div>
          VDPMS
        </div>
      </div>
      <nav className="flex-1 space-y-2 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-4 text-sm text-black font-medium hover:bg-black/5",
                isActive && "bg-black text-white hover:bg-black"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
