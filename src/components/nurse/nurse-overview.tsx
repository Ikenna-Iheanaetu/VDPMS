"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Users2, Clipboard, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    name: "Patients",
    value: "42",
    icon: Users2,
    color: "bg-[#7B5EFF]",
    textColor: "text-[#7B5EFF]",
  },
  {
    name: "Appointments",
    value: "12",
    icon: Calendar,
    color: "bg-[#FF5E8C]",
    textColor: "text-[#FF5E8C]",
  },
  {
    name: "Tasks",
    value: "8",
    icon: Clipboard,
    color: "bg-[#FFA33F]",
    textColor: "text-[#FFA33F]",
  },
  {
    name: "Critical Patients",
    value: "3",
    icon: Stethoscope,
    color: "bg-[#3FBFFF]",
    textColor: "text-[#3FBFFF]",
  },
]

const upcomingTasks = [
  { id: 1, task: "Administer medication to Room 201", time: "09:00 AM" },
  { id: 2, task: "Check vitals for patient John Doe", time: "10:30 AM" },
  { id: 3, task: "Assist Dr. Smith with rounds", time: "11:45 AM" },
  { id: 4, task: "Update patient charts", time: "02:00 PM" },
]

const criticalPatients = [
  {
    name: "Alice Johnson",
    room: "ICU-1",
    condition: "Post-surgery",
    lastChecked: "30 mins ago",
    image: "/patient-avatar-1.png",
  },
  {
    name: "Bob Williams",
    room: "ICU-3",
    condition: "Respiratory distress",
    lastChecked: "15 mins ago",
    image: "/patient-avatar-2.png",
  },
  {
    name: "Carol Davis",
    room: "ICU-2",
    condition: "Cardiac monitoring",
    lastChecked: "45 mins ago",
    image: "/patient-avatar-3.png",
  },
]

export default function NurseOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <div className={cn("rounded p-2", stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", stat.textColor)}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{task.task}</div>
                    <div className="text-sm text-muted-foreground">{task.time}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalPatients.map((patient) => (
                <div key={patient.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={patient.image} />
                      <AvatarFallback>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.room} - {patient.condition}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Last checked: {patient.lastChecked}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

