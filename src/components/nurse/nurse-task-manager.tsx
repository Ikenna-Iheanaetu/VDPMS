"use client"

import { useState } from "react"
import { PlusCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: number
  title: string
  description: string
  priority: "Low" | "Medium" | "High"
  status: "Pending" | "In Progress" | "Completed"
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Check vitals for Room 201",
    description: "Monitor and record patient vitals",
    priority: "High",
    status: "Pending",
  },
  {
    id: 2,
    title: "Administer medication to Room 105",
    description: "Give prescribed medication as per schedule",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Update patient charts",
    description: "Record latest observations and treatments",
    priority: "Low",
    status: "Completed",
  },
]

export default function NurseTaskManager() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
  })
  const { toast } = useToast()

  const handleAddTask = () => {
    if (newTask.title.trim() === "") {
      toast({
        title: "Error",
        description: "Task title cannot be empty",
        variant: "destructive",
      })
      return
    }
    const task: Task = {
      id: tasks.length + 1,
      ...newTask,
    }
    setTasks([...tasks, task])
    setIsAddingTask(false)
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
    })
    toast({
      title: "Task Added",
      description: "New task has been successfully added.",
    })
  }

  const handleStatusChange = (taskId: number, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    setTasks(updatedTasks)
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus}.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingTask(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new task for the nursing team.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: Task["priority"]) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
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
                    task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
              </CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Status: {task.status}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {task.status !== "Completed" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, "Completed")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              {task.status === "Pending" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, "In Progress")}>
                  Start Task
                </Button>
              )}
              {task.status === "Completed" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.id, "Pending")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reopen
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

