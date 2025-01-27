"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getTasks,
  createTask,
  updateTaskStatus,
} from "@/actions/nurse/tasks.action";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getCookieForClient from "@/actions/get-cookie-for-client.action";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "NORMAL" | "URGENT" | "EMERGENCY";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  nurseId: number;
  dueTime?: Date;
}

export default function NurseTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [nurseId, setNurseId] = useState<string>("");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    priority: "NORMAL",
    status: "PENDING",
    nurseId: 0,
    dueTime: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchNurseId = async () => {
      try {
        const { data } = await getCookieForClient();
        if (data?.roleSpecificId) { 
          setNurseId(data.roleSpecificId);
          setNewTask((prev) => ({ ...prev, nurseId: data.userId }));
        }
      } catch (error) {
        console.error("Failed to fetch nurse ID:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    };
    fetchNurseId();
  }, [toast]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!nurseId) return;

      const result = await getTasks(nurseId!);
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setTasks(
          result.data
            ? result.data.map((task) => ({
                ...task,
                dueTime: task.dueTime || undefined,
              }))
            : []
        );
      }
    };
    loadTasks();
  }, [toast, nurseId]);

  const handleAddTask = async () => {
    if (!nurseId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createTask({ ...newTask, nurseId });
      if (!result.success)
        throw new Error(result.error || "Failed to create task");

      setTasks((prev) => [
        ...prev,
        {
          ...result.data!,
          dueTime: result.data!.dueTime ?? undefined,
        },
      ]);
      setIsAddingTask(false);
      setNewTask({
        title: "",
        description: "",
        priority: "NORMAL",
        status: "PENDING",
        nurseId: 0,
        dueTime: undefined,
      });

      toast({
        title: "Task Added",
        description: "New task has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    taskId: number,
    newStatus: Task["status"]
  ) => {
    const result = await updateTaskStatus(taskId, newStatus);

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus.toLocaleLowerCase().replace(" ", "_")}.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for the nursing team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: Task["priority"]) =>
                    setNewTask({ ...newTask, priority: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-due-time" className="text-right">
                  Due Time
                </Label>
                <Input
                  id="task-due-time"
                  type="datetime-local"
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      dueTime: new Date(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddTask}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-lg">{task.title}</span>
                <Badge
                  variant={
                    task.priority === "EMERGENCY"
                      ? "destructive"
                      : task.priority === "URGENT"
                      ? "default"
                      : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
              </CardTitle>
              <CardDescription>{task.description}</CardDescription>
              {task.dueTime && (
                <CardDescription>
                  Due: {new Date(task.dueTime).toLocaleString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Status: {task.status}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {task.status !== "COMPLETED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(task.id, "COMPLETED")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              {task.status === "PENDING" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                >
                  Start Task
                </Button>
              )}
              {task.status === "COMPLETED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(task.id, "PENDING")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reopen
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
