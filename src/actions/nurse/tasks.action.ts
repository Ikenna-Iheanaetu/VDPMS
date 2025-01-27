"use server"

import prisma from "@/lib/prisma"
import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
  priority: z.enum(["NORMAL", "URGENT", "EMERGENCY"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
  nurseId: z.string(),
  dueTime: z.coerce.date().optional(),
})


export async function getTasks(nurseId: string) {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          nurse: {
            nurseId: nurseId
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });
  
      return {
        success: true,
        data: tasks,
        error: null
      };
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      return {
        success: false,
        data: null,
        error: "Failed to fetch tasks"
      };
    }
  }

  export async function createTask(formData: z.infer<typeof TaskSchema>) {
    try {
      const nurse = await prisma.nurse.findUnique({
        where: { nurseId: formData.nurseId },
        select: { id: true }
      });
  
      if (!nurse) {
        return {
          success: false,
          data: null,
          error: "Invalid nurse ID"
        };
      }
  
      const task = await prisma.task.create({
        data: {
          title: formData.title,
          description: formData.description,
          priority: formData.priority as Priority,
          status: formData.status as TaskStatus,
          nurseId: nurse.id,
          dueTime: formData.dueTime
        }
      });
  
      return {
        success: true,
        data: task,
        error: null
      };
    } catch (error) {
      console.error("Failed to create task:", error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: null,
          error: error.errors[0].message
        };
      }
  
      return {
        success: false,
        data: null,
        error: "Failed to create task"
      };
    }
  }

export async function updateTaskStatus(taskId: number, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    })
    
    return { 
      success: true, 
      data: task, 
      error: null 
    }
  } catch (error) {
    console.error("Failed to update task status:", error)
    
    return { 
      success: false, 
      data: null, 
      error: "Failed to update task status. Please try again." 
    }
  }
}