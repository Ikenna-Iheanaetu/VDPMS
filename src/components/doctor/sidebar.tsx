"use client"

import { cn } from "@/lib/utils"
import { LayoutGrid, Calendar, Users2, Settings } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutGrid,
  },
  {
    name: "Appointment",
    href: "/appointment",
    icon: Calendar,
  },
  {
    name: "My Patients",
    href: "/patients",
    icon: Users2,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-[#0F1729] text-white">
      <div className="p-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="rounded-lg bg-primary p-1">
            <div className="h-6 w-6" />
          </div>
          Doct.
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10",
                isActive && "bg-white/10"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

