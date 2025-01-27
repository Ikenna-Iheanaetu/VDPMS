"use client";

import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users2, Clipboard, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNurseStats,
  getUpcomingTasks,
  getCriticalPatients,
  completeTask,
} from "@/actions/nurse/overview.action";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type StatCard = {
  name: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  textColor: string;
};

type TaskType = {
  id: number;
  task: string;
  time: string;
};

type CriticalPatientType = {
  name: string;
  room: string | null;
  condition: string | null;
  lastChecked: Date;
  image: string | null;
};

export default function NurseOverview({ nurseId }: { nurseId: number }) {
  const [statsData, setStatsData] = useState<StatCard[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [criticalPatients, setCriticalPatients] = useState<
    CriticalPatientType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, tasksData, patientsData] = await Promise.all([
          getNurseStats(nurseId),
          getUpcomingTasks(nurseId),
          getCriticalPatients(),
        ]);

        setStatsData([
          {
            name: "Patients",
            value: stats.patients.toString(),
            icon: Users2,
            color: "bg-[#7B5EFF]",
            textColor: "text-[#7B5EFF]",
          },
          {
            name: "Appointments",
            value: stats.appointments.toString(),
            icon: Users2, // Replace with actual icon
            color: "bg-[#FF5E8C]",
            textColor: "text-[#FF5E8C]",
          },
          {
            name: "Tasks",
            value: stats.tasks.toString(),
            icon: Clipboard,
            color: "bg-[#FFA33F]",
            textColor: "text-[#FFA33F]",
          },
          {
            name: "Critical Patients",
            value: stats.criticalPatients.toString(),
            icon: Stethoscope,
            color: "bg-[#3FBFFF]",
            textColor: "text-[#3FBFFF]",
          },
        ]);

        setTasks(tasksData);
        setCriticalPatients(patientsData);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Failed to load dashboard data",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update settings",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, [nurseId, toast]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      await completeTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task marked as completed",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Failed to complete task",
        description:
          error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.name} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <div className={cn("rounded p-2", stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", stat.textColor)}>
                {stat.value}
              </div>
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
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                />
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
                <CriticalPatientItem key={patient.name} patient={patient} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onComplete,
}: {
  task: TaskType;
  onComplete: (id: number) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await onComplete(task.id);
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold">{task.task}</div>
        <div className="text-sm text-muted-foreground">{task.time}</div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? "Completing..." : "Complete"}
      </Button>
    </div>
  );
}

function CriticalPatientItem({ patient }: { patient: CriticalPatientType }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={patient.image || undefined} />
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
      <div className="text-sm text-muted-foreground">
        Last checked:{" "}
        {patient.lastChecked.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
